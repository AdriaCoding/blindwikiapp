# BlindWiki AI Pipeline Summary

This document provides a comprehensive summary of the AI processing pipeline developed for the BlindWiki application. The pipeline consists of several interconnected components that together provide automatic processing of audio notes, including:

1. Language identification
2. Speech-to-text transcription
3. Translation to English
4. Text analysis and tagging

Below we explain each component and how they work together.

## 1. Language Identification (`language_tagger.ipynb`)

The first step in the pipeline is to identify the language of each audio recording. This is done using a pre-trained language identification model from SpeechBrain.

### Key components:

- **Model**: SpeechBrain's `EncoderClassifier` with the pre-trained `speechbrain/lang-id-voxlingua107-ecapa` model
- **Process**: 
  1. Audio files are loaded and processed in batches
  2. The model predicts the language for each audio file
  3. Results are saved to a pickle file for later use

### Output:
- A dictionary mapping file names to predicted languages

### Notes:
- The model supports 107 languages through the VoxLingua107 dataset
- Corrupted audio files are detected and logged separately

## 2. Statistical Analysis (`statistical_analyisis_on_languages.ipynb`)

This notebook performs statistical analysis on the language identification results to understand the distribution of languages in the dataset.

### Key components:

- **Data Loading**: Loads pickle files containing language identification results
- **Analysis**: 
  1. Counts occurrences of each language
  2. Visualizes language distribution
  3. Allows filtering languages by frequency threshold

### Output:
- `file_language.csv`: A CSV file mapping audio files to their detected languages
- Visualization of language distribution

### Notes:
- This step helps in understanding the diversity of languages in the dataset
- Can be used to decide which languages to prioritize for transcription

## 3. Speech-to-Text Transcription (`get_transcriptions_on_language.ipynb`)

This notebook transcribes audio files based on their identified language using OpenAI's Whisper model.

### Key components:

- **Model**: OpenAI's `whisper-tiny` model (smaller version of Whisper)
- **Data**: Uses `file_language.csv` from the statistical analysis
- **Process**:
  1. Groups audio files by language
  2. For each language:
     - Sets up language-specific decoding
     - Processes each audio file
     - Generates and saves transcriptions
  3. Tracks unsupported languages

### Output:
- `transcriptions.pkl`: A dictionary mapping file names to transcriptions
- `unsupported_languages.pkl`: List of languages not supported by Whisper

### Notes:
- The Whisper model supports multilingual transcription
- Results are saved periodically to prevent data loss during long processing runs
- Language-specific decoder prompts improve transcription accuracy

## 4. Translation Pipeline (`get_translations.ipynb`)

This notebook translates the transcriptions to English, making the content accessible regardless of the original language.

### Key components:

- **Model**: Facebook's `nllb-200-distilled-600M` (No Language Left Behind)
- **Data**: Uses transcriptions from the previous step in `full_db.csv`
- **Process**:
  1. Maps language names to model-specific language codes
  2. For each language:
     - Creates a translation pipeline for that language to English
     - Translates all transcriptions for that language
     - Handles missing or unavailable languages
  3. Merges translations back into the dataset

### Output:
- `results_trans4.pkl` and `results_trans5.pkl`: Intermediate translation results
- `full_db1.csv`: Final dataset with original transcriptions and English translations

### Notes:
- The NLLB model supports 200+ languages
- Translations are done in batches by language
- The pipeline handles cases where translation isn't possible

## 5. Content Analysis and Tagging (`blind_wiki_test.ipynb`)

This notebook explores text analysis techniques to process transcriptions, including preprocessing and embedding generation for potential tagging.

### Key components:

- **Speech-to-Text**: Tests Whisper models for Spanish transcription
- **Text Preprocessing**:
  1. Tokenization
  2. Punctuation removal
  3. Stop word removal
  4. Lemmatization
- **Embedding Generation**:
  - Word2Vec embeddings for tokens
  - Average embeddings for document representation
- **Tag Analysis**:
  - Processes existing tags from the BlindWiki platform
  - Removes special characters
  - Filters for relevant tokens

### Notes:
- This notebook is more experimental, testing approaches for content understanding
- Could be used to automatically suggest tags based on audio content
- Uses Spanish-specific NLP tools for preprocessing

## Complete Pipeline Flow

Here's how the components work together:

1. **Audio Collection**: Voice notes are collected through the BlindWiki application

2. **Language Identification**: Each audio file is analyzed to determine its language

3. **Statistical Analysis**: Language distribution is analyzed to understand the dataset

4. **Transcription**: Audio files are transcribed based on their identified language

5. **Translation**: Transcriptions are translated to English for universal accessibility

6. **Content Analysis**: Text is analyzed for meaningful content and potential tagging

7. **Integration**: Results can be integrated back into the BlindWiki platform

This pipeline enables automatic processing of multilingual audio content, making it more accessible and searchable within the BlindWiki ecosystem.

## Future Work and Improvements

Based on the current implementation, here are potential areas for improvement:

1. **Model Upgrades**:
   - Use larger Whisper models for better transcription accuracy
   - Explore fine-tuning on domain-specific audio

2. **Pipeline Integration**:
   - Create an automated end-to-end pipeline
   - Add API endpoints for real-time processing

3. **Tag Generation**:
   - Implement automatic tagging based on content
   - Use topic modeling or keyword extraction

4. **User Feedback**:
   - Create mechanisms for users to correct transcriptions/translations
   - Use this feedback to improve models

5. **Performance Optimization**:
   - Optimize for mobile devices
   - Add caching mechanisms for frequently accessed content

6. **Database Integration**:
   - Move from file-based storage to a proper database
   - Implement efficient search and retrieval

7. **Content Summarization**:
   - Add automatic summarization of longer recordings
   - Generate short descriptions for improved browsability