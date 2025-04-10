# BlindWiki

<div align="center">
  <img src="https://github.com/adriacoding/blindwikiapp/blob/main/BlindWiki2/assets/images/icon.png?raw=true" alt="BlindWiki Logo" width="180">
  <br>
  <h3>Collaborative Voice-Based Platform for Accessible Mapping</h3>
</div>

## 📋 Overview

BlindWiki is an innovative mobile application that allows users to record audio notes associated with specific locations, creating a collaborative, accessible map of user experiences. The platform is particularly designed to improve accessibility for visually impaired users by providing an audio-based interface to navigate and understand urban environments.

### Key Features:

- 🔊 **Geo-Located Audio Recording**: Capture voice notes with automatic location tagging
- 🌍 **Multi-Language Support**: Record in your native language with automatic language detection
- 🔍 **AI-Powered Processing**: Automatic transcription, translation, and content tagging
- 🧩 **Content Discovery**: Explore recordings by location, tags, or areas
- 👥 **Community Collaboration**: Build a shared knowledge base of accessible places and experiences

## 🔧 Repository Structure

This repository contains three main components:

1. **BlindWiki2**: Frontend mobile application built with React Native and Expo
2. **BlindWikiPhoneGap**: Previous version of the application (legacy code)
3. **Notebooks**: Jupyter notebooks for AI processing pipeline development

## 🚀 Getting Started

### Prerequisites

- Python 3.12.10 (confirmed working, Python 3.13 has compatibility issues)
- Node.js (latest LTS recommended)
- Expo CLI (`npm install -g expo-cli`)

### Setting Up the Environment

1. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # On Windows
   .venv\Scripts\activate
   # On Unix or MacOS
   source .venv/bin/activate
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. For the frontend application, navigate to the BlindWiki2 directory:
   ```bash
   cd BlindWiki2
   npm install
   ```

## 🔬 AI Processing Pipeline

The repository includes several Jupyter notebooks that implement an AI-powered processing pipeline for audio recordings:

### Language Identification (`language_tagger.ipynb`)
- Automatically detects the language of audio recordings
- Uses SpeechBrain's language identification model
- Supports over 100 languages

<img src="https://mermaid.ink/img/pako:eNptkU9rwzAMxb-K0GmF7QOUHUZhDYxCGWywHXZR7KYRjZ3ZcktX8t1nJ2lh9E-ynt4P6UlXkoUSJMGcGqsewpAzq8zOKcB1FKXvMb-uBByNqpBLBxRl8CUU5pSCkFYaXMEWzQbK1rpyQU6vz6vD2cAnMGKlOVN-s9nCoA4azUkH_sZdQNIXMOoLLCzhDOTfsMCijO_Fvh43nbHAhODSYuXoTfvEEsXaUB_nX0Lxx9BOa2zB-HnBNB1v4hiyHxQo5ywqDzfPYRSGK2-7xDzKspRlJuMhNp-3eZJkHnNjmJXs_1NkXZwmk_uNx3KZyXZ1A1mFLGFmuVUn9yHFQDYGqaB-r86nnHQu7d1P2HbpQOJBx8N-nI57_QB-tI4v" alt="Language Processing Pipeline">

### Speech-to-Text Transcription (`get_transcriptions_on_language.ipynb`)
- Transcribes audio recordings based on identified language
- Uses OpenAI's Whisper models
- Handles multilingual audio input

### Translation (`get_translations.ipynb`)
- Translates transcriptions to English for universal accessibility
- Uses NLLB-200 translation model
- Preserves meaning across languages

### Content Analysis and Tagging (`blind_wiki_test.ipynb`)
- Analyzes transcriptions for meaningful content
- Tests approaches for automatic tagging
- Processes existing tags from the platform

## 📱 BlindWiki Mobile Application

The BlindWiki2 directory contains a React Native mobile application with the following features:

- User authentication and profile management
- Audio recording with location tagging
- Exploring and filtering content by location, tags, and areas
- Playback of audio recordings
- Adding comments and tags to existing recordings

For detailed setup instructions for the mobile application, see the [BlindWiki2 README](./BlindWiki2/README.md).

## 🔄 Web Development with CORS Proxy

When developing the web version locally, you'll need to run a CORS proxy to handle API requests:

1. Open a terminal and navigate to the BlindWiki2 directory
2. Run the proxy server:
   ```bash
   node proxy.js
   ```
3. The proxy server will run on http://localhost:3000

## 📊 Future Development

Based on the current implementation, potential areas for improvement include:

1. **Model Upgrades**:
   - Use larger Whisper models for better transcription accuracy
   - Explore fine-tuning on domain-specific audio

2. **Pipeline Integration**:
   - Create an automated end-to-end pipeline
   - Add API endpoints for real-time processing

3. **Automatic Tagging**:
   - Implement automatic tagging based on content
   - Use topic modeling or keyword extraction

4. **Content Summarization**:
   - Add automatic summarization of longer recordings
   - Generate short descriptions for improved browsability

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 👥 Contributors

- [Your Name](https://github.com/yourusername)
- Add other contributors

## 🙏 Acknowledgements

- [SpeechBrain](https://speechbrain.github.io/) for language identification models
- [OpenAI Whisper](https://github.com/openai/whisper) for speech-to-text capabilities
- [NLLB-200](https://github.com/facebookresearch/fairseq/tree/nllb) for translation models