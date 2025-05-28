## Build a python http server that listens for audio requests and returns the same audio.

import http.server
import socketserver
import cgi
import io
import os # Import os to access environment variables
import subprocess # For running shell commands
import tempfile # For creating temporary files
import shutil # For cleaning up directories

# PORT will be set by Cloud Run, default to 8080 for local testing
PORT = int(os.environ.get("PORT", 8080))
HOST = '0.0.0.0' # Listen on all available interfaces

class AudioTranslationHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
        temp_dir = None # Initialize to None for cleanup
        try:
            # Parse the form data posted
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={'REQUEST_METHOD': 'POST',
                         'CONTENT_TYPE': self.headers['Content-Type']}
            )

            # Look for a file in the form
            if "audio_file" not in form:
                self.send_response(400)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                self.wfile.write(b"Error: 'audio_file' not found in form data.")
                return

            file_item = form["audio_file"]

            if not file_item.filename:
                self.send_response(400)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                self.wfile.write(b"Error: No file selected or file has no name.")
                return

            # Get target language
            if "tgt_lang" not in form:
                self.send_response(400)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                self.wfile.write(b"Error: 'tgt_lang' not found in form data.")
                return
            
            tgt_lang = form.getvalue("tgt_lang")
            # Basic validation for tgt_lang (e.g., 3-letter code)
            if not isinstance(tgt_lang, str) or len(tgt_lang) != 3:
                self.send_response(400)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                self.wfile.write(b"Error: 'tgt_lang' must be a 3-letter code.")
                print(f"Invalid tgt_lang received: {tgt_lang}")
                return

            # Create a temporary directory to store input and output files
            temp_dir = tempfile.mkdtemp()
            
            # Save uploaded file to a temporary file
            input_filename = os.path.join(temp_dir, file_item.filename)
            with open(input_filename, 'wb') as f_in:
                f_in.write(file_item.file.read())

            print(f"DEBUG: Attempting to use input file: {input_filename}")
            print(f"DEBUG: Does input file exist? {os.path.exists(input_filename)}")
            print(f"DEBUG: Is input file a file? {os.path.isfile(input_filename)}")
            if os.path.exists(input_filename):
                print(f"DEBUG: Input file size: {os.path.getsize(input_filename)} bytes")

            # Preprocess: Convert to 16kHz, 16-bit, mono WAV using ffmpeg
            preprocessed_filename = os.path.join(temp_dir, "preprocessed_input.wav")
            ffmpeg_cmd = [
                "ffmpeg", "-y", "-i", input_filename,
                "-ar", "16000", "-ac", "1", "-sample_fmt", "s16",
                preprocessed_filename
            ]
            print(f"Running ffmpeg command: {' '.join(ffmpeg_cmd)}")
            ffmpeg_proc = subprocess.Popen(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            ffmpeg_stdout, ffmpeg_stderr = ffmpeg_proc.communicate()
            if ffmpeg_proc.returncode != 0:
                self.send_response(500)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                error_message = f"Error during audio preprocessing: {ffmpeg_stderr.decode()}"
                self.wfile.write(error_message.encode())
                print(error_message)
                return
            print(f"Audio preprocessing successful. Preprocessed file: {preprocessed_filename}")

            # Choose which model to use based on tgt_lang
            expressive_langs = ["spa", "fra", "deu", "eng", "cmn", "ita"]
            use_expressive = tgt_lang in expressive_langs

            # Define the output file path (extension might change based on m4t, but .wav is common)
            base_name, original_ext = os.path.splitext(file_item.filename)
            output_filename = os.path.join(temp_dir, f"{base_name}_translated.wav") # Assume .wav output for now

            if use_expressive:
                # Use expressivity_predict
                cmd = [
                    "expressivity_predict", preprocessed_filename,
                    "--tgt_lang", tgt_lang,
                    "--model_name", "seamless_expressivity",
                    "--vocoder_name", "vocoder_pretssel",
                    "--gated-model-dir", "/app/seamless_expressive_pts",
                    "--output_path", output_filename
                ]
            else:
                # Use m4t_predict
                cmd = [
                    "m4t_predict", preprocessed_filename,
                    "--task", "S2ST",
                    "--tgt_lang", tgt_lang,
                    "--output_path", output_filename
                ]

            print(f"Executing command: {' '.join(cmd)}")
            
            # Run the command
            process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, stderr = process.communicate()

            if process.returncode != 0:
                self.send_response(500)
                self.send_header("Content-type", "text/plain")
                self.end_headers()
                error_message = f"Error during translation: {stderr.decode()}"
                self.wfile.write(error_message.encode())
                print(error_message)
                print(f"Stdout: {stdout.decode()}")
                return
            
            print(f"Translation successful. Stdout: {stdout.decode()}")
            print(f"Checking for output file: {output_filename}")


            # Check if the output file was created
            if not os.path.exists(output_filename):
                # m4t_predict might create output in a subdirectory if output_path is a dir,
                # or use a different naming convention.
                # Let's list the temp_dir to find the output if direct path fails.
                possible_outputs = [f for f in os.listdir(temp_dir) if f.endswith(('.wav', '.mp3', '.m4a')) and f != os.path.basename(input_filename)]
                if not possible_outputs:
                    self.send_response(500)
                    self.send_header("Content-type", "text/plain")
                    self.end_headers()
                    self.wfile.write(b"Error: Translated audio file not found after processing.")
                    print(f"Translated file not found at {output_filename}. Contents of {temp_dir}: {os.listdir(temp_dir)}")
                    return
                # If multiple, pick the first one. This might need refinement.
                output_filename = os.path.join(temp_dir, possible_outputs[0])
                print(f"Found translated file: {output_filename}")


            # Read the translated file content
            with open(output_filename, 'rb') as f_out:
                translated_audio_data = f_out.read()

            # Send the response
            self.send_response(200)
            # Determine content type for the translated audio (assuming .wav for now)
            content_type = 'audio/wav' 
            lower_output_filename = output_filename.lower()
            if '.mp3' in lower_output_filename:
                content_type = 'audio/mpeg'
            elif '.m4a' in lower_output_filename:
                content_type = 'audio/mp4'
            
            self.send_header("Content-type", content_type)
            # Use a generic name or derive from original
            self.send_header("Content-Disposition", f'attachment; filename="translated_{os.path.basename(output_filename)}"')
            self.end_headers()
            self.wfile.write(translated_audio_data)
            print(f"Sent translated file: {os.path.basename(output_filename)}, size: {len(translated_audio_data)} bytes, type: {content_type}")

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            error_msg = f"Server Error: {e}"
            self.wfile.write(error_msg.encode())
            print(error_msg)
            # Also print stdout/stderr from subprocess if available and relevant
            if 'process' in locals() and hasattr(process, 'stdout') and process.stdout:
                 print(f"Subprocess STDOUT: {stdout.decode(errors='ignore') if stdout else 'N/A'}")
            if 'process' in locals() and hasattr(process, 'stderr') and process.stderr:
                 print(f"Subprocess STDERR: {stderr.decode(errors='ignore') if stderr else 'N/A'}")


        finally:
            # Clean up the temporary directory
            if temp_dir and os.path.exists(temp_dir):
                try:
                    shutil.rmtree(temp_dir)
                    print(f"Successfully removed temporary directory: {temp_dir}")
                except Exception as e_clean:
                    print(f"Error cleaning up temporary directory {temp_dir}: {e_clean}")


Handler = AudioTranslationHandler # Changed handler name

if __name__ == '__main__': # Ensure this runs only when script is executed directly
    with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
        print(f"Serving at host {HOST} port {PORT}")
        httpd.serve_forever()