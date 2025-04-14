# %%
# Importaciones necesarias
import os
import glob
import torch
import torchaudio
from tqdm import tqdm
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, VitsModel
import whisper

# Configurar dispositivo (CPU/GPU)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Configurar directorios
base_dir = os.path.dirname(os.getcwd())
uploads_dir = os.path.join(os.getcwd(), "uploads")
data_dir = os.path.join(os.getcwd(), "data")
translations_dir = os.path.join(uploads_dir, "cascaded_translations")

# Crear directorios si no existen
os.makedirs(data_dir, exist_ok=True)
os.makedirs(translations_dir, exist_ok=True)

print(f"Buscando archivos MP3 en: {uploads_dir}")

# %%
# Cargar los tres modelos necesarios para la cascada
print("Cargando modelos...")

# 1. Modelo de Reconocimiento de Voz (ASR) - Whisper
print("Cargando modelo de reconocimiento de voz (Whisper)...")
asr_model = whisper.load_model("base").to(device)

# 2. Modelo de Traducción - MarianMT
print("Cargando modelo de traducción (MarianMT)...")
translation_model_name = "Helsinki-NLP/opus-mt-mul-en"  # Modelo multilingüe a inglés
translation_tokenizer = AutoTokenizer.from_pretrained(translation_model_name)
translation_model = AutoModelForSeq2SeqLM.from_pretrained(translation_model_name).to(device)

# 3. Modelo de Síntesis de Voz (TTS) - VITS
print("Cargando modelo de síntesis de voz (VITS)...")
tts_model = VitsModel.from_pretrained("facebook/mms-tts-eng").to(device)
tts_processor = AutoTokenizer.from_pretrained("facebook/mms-tts-eng")

print("Todos los modelos cargados correctamente")

# %%
def translate_audio_cascaded(file_path):
    """
    Realiza la traducción de voz a voz en cascada:
    1. ASR: Convierte el audio a texto
    2. MT: Traduce el texto al inglés
    3. TTS: Convierte el texto traducido a audio
    
    Args:
        file_path (str): Ruta al archivo de audio original
    Returns:
        str: Ruta al archivo de audio traducido
    """
    try:
        # Paso 1: Reconocimiento de Voz (ASR)
        print("Paso 1: Transcribiendo audio a texto...")
        result = asr_model.transcribe(file_path)
        source_text = result["text"]
        print(f"Texto transcrito: {source_text}")
        
        # Paso 2: Traducción de Texto (MT)
        print("Paso 2: Traduciendo texto al inglés...")
        # Tokenizar y traducir
        inputs = translation_tokenizer(
            source_text,
            return_tensors="pt",
            padding=True
        ).to(device)
        
        # Generar traducción
        translated_tokens = translation_model.generate(
            **inputs,
            max_length=512,
            num_beams=5,
            early_stopping=True
        )
        translated_text = translation_tokenizer.decode(translated_tokens[0], skip_special_tokens=True)
        print(f"Texto traducido: {translated_text}")
        
        # Paso 3: Síntesis de Voz (TTS)
        print("Paso 3: Convirtiendo texto traducido a audio...")
        translated_file_name = os.path.basename(file_path).replace(".mp3", "_translated_eng.mp3")
        translated_file_path = os.path.join(translations_dir, translated_file_name)
        
        # Generar audio
        inputs = tts_processor(text=translated_text, return_tensors="pt").to(device)
        with torch.no_grad():
            output = tts_model(**inputs).waveform
        
        # Guardar el audio
        torchaudio.save(
            translated_file_path,
            output.cpu(),
            sample_rate=tts_model.config.sampling_rate
        )
        
        print("Proceso completado exitosamente")
        return translated_file_path
    
    except Exception as e:
        print(f"Error en el proceso de traducción: {str(e)}")
        return None

# %%
# Procesar todos los archivos MP3 en el directorio de uploads
mp3_files = glob.glob(os.path.join(uploads_dir, "*.mp3"))
print(f"Se encontraron {len(mp3_files)} archivos MP3 para procesar")

# Procesar cada archivo
for file_path in tqdm(mp3_files):
    file_name = os.path.basename(file_path)
    print(f"\nProcesando archivo: {file_name}")
    print("-" * 50)
    
    translated_file_path = translate_audio_cascaded(file_path)
    
    # Imprimir resultado
    if translated_file_path:
        print(f"✓ Audio traducido guardado en: {translated_file_path}")
    else:
        print("✗ Traducción fallida.")
    print("-" * 50)
# %%
