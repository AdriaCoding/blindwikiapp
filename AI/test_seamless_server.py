#!/usr/bin/env python3
"""
Test script for the Seamless HTTP server.
This script provides a robust way to test the audio translation server by:
1. Validating input parameters
2. Handling file operations safely
3. Making HTTP requests with proper error handling
4. Saving and validating the response
"""

import argparse
import logging
import mimetypes
import os
import requests
import sys
import tempfile
from pathlib import Path
from typing import Optional, Tuple
from urllib.parse import urljoin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_mime_type(file_path: str) -> str:
    """Get the MIME type of a file based on its extension."""
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type is None:
        # Default to audio/wav if we can't determine the type
        return 'audio/wav'
    return mime_type

def test_seamless_server(
    audio_file: str,
    target_language: str,
    output_dir: Optional[str] = None
) -> Tuple[bool, str]:
    """
    Test the Seamless HTTP server with an audio file.
    
    Args:
        audio_file: Path to the input audio file
        target_language: 3-letter language code for translation target
        output_dir: Directory to save the translated audio (optional)
    
    Returns:
        Tuple of (success: bool, message: str)
    """
    try:
        # Validate input file
        audio_path = Path(audio_file)
        if not audio_path.exists():
            return False, f"Input file not found: {audio_file}"
        if not audio_path.is_file():
            return False, f"Input path is not a file: {audio_file}"
        
        # Validate target language
        if not isinstance(target_language, str) or len(target_language) != 3:
            return False, "Target language must be a 3-letter code"
        
        # Prepare the request
        server_url = "https://ai-server-739559409286.europe-west1.run.app"
        url = urljoin(server_url, "/")
        files = {
            'audio_file': (
                audio_path.name,
                open(audio_path, 'rb'),
                get_mime_type(str(audio_path))
            )
        }
        data = {'tgt_lang': target_language}
        
        logger.info(f"Testing server at {url}")
        logger.info(f"Input file: {audio_path} ({audio_path.stat().st_size} bytes)")
        logger.info(f"Target language: {target_language}")
        
        # Make the request
        response = requests.post(url, files=files, data=data)
        
        # Clean up the file handle
        files['audio_file'][1].close()
        
        # Check response
        if response.status_code != 200:
            return False, f"Server returned error {response.status_code}: {response.text}"
        
        # Get output filename from Content-Disposition header or generate one
        output_filename = f"{audio_path.stem}_{target_language}_translated{audio_path.suffix}"
        
        # Save the response
        if output_dir:
            output_path = Path(output_dir) / output_filename
        else:
            output_path = audio_path.parent / output_filename
        
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        logger.info(f"Successfully saved translated audio to: {output_path}")
        logger.info(f"Response size: {len(response.content)} bytes")
        logger.info(f"Content type: {response.headers.get('Content-Type', 'unknown')}")
        
        return True, f"Successfully translated audio to {target_language}"
        
    except requests.exceptions.RequestException as e:
        return False, f"Network error: {str(e)}"
    except Exception as e:
        return False, f"Unexpected error: {str(e)}"

def main():
    parser = argparse.ArgumentParser(description="Test the Seamless HTTP server")
    parser.add_argument("audio_file", help="Path to the input audio file")
    parser.add_argument("target_language", help="3-letter language code for translation target")
    parser.add_argument("--output-dir", help="Directory to save the translated audio")
    parser.add_argument("--verbose", "-v", action="store_true",
                      help="Enable verbose logging")
    
    args = parser.parse_args()
    
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    success, message = test_seamless_server(
        args.audio_file,
        args.target_language,
        args.output_dir
    )
    
    if success:
        logger.info(message)
        sys.exit(0)
    else:
        logger.error(message)
        sys.exit(1)

if __name__ == "__main__":
    main()
