## Build a python http server that listens for audio requests and returns the same audio.

import http.server
import socketserver
import cgi
import io
import os # Import os to access environment variables

# PORT will be set by Cloud Run, default to 8080 for local testing
PORT = int(os.environ.get("PORT", 8080))
HOST = '0.0.0.0' # Listen on all available interfaces

class AudioEchoHandler(http.server.SimpleHTTPRequestHandler):
    def do_POST(self):
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

            # Read the file content
            file_data = file_item.file.read()
            filename = file_item.filename

            # Send the response
            self.send_response(200)
            content_type = 'application/octet-stream' # Default content type
            
            # SimpleHTTPRequestHandler.guess_type can be a bit limited
            # So we'll do more specific checks.
            lower_filename = filename.lower()
            if '.mp3' in lower_filename:
                content_type = 'audio/mpeg'
            elif '.wav' in lower_filename:
                content_type = 'audio/wav'
            elif '.m4a' in lower_filename:
                content_type = 'audio/mp4' # m4a is often mp4
            elif '.aac' in lower_filename:
                content_type = 'audio/aac'
            elif '.ogg' in lower_filename: # ogg can be vorbis or opus
                content_type = 'audio/ogg'
            elif '.webm' in lower_filename: # webm can be vorbis or opus
                content_type = 'audio/webm'
            # You can add more specific MIME types if needed

            self.send_header("Content-type", content_type)
            self.send_header("Content-Disposition", f'attachment; filename="received_{filename}"')
            self.end_headers()
            self.wfile.write(file_data)
            print(f"Received and echoed back file: {filename}, size: {len(file_data)} bytes, type: {content_type}")

        except Exception as e:
            self.send_response(500)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write(f"Server Error: {e}".encode())
            print(f"Error processing POST request: {e}")

Handler = AudioEchoHandler

if __name__ == '__main__': # Ensure this runs only when script is executed directly
    with socketserver.TCPServer((HOST, PORT), Handler) as httpd:
        print(f"Serving at host {HOST} port {PORT}")
        httpd.serve_forever()