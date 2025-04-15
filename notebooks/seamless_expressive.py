# %%
# Importaciones necesarias
import os
import glob
import torch
import torchaudio
from tqdm import tqdm
from transformers import AutoProcessor, SeamlessM4Tv2ForSpeechToSpeech

# Configurar dispositivo (CPU/GPU)
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Configurar directorios
base_dir = os.path.dirname(os.getcwd())
uploads_dir = os.path.join(os.getcwd(), "uploads")
data_dir = os.path.join(os.getcwd(), "data")
translations_dir = os.path.join(uploads_dir, "expressive_translations")

# Crear directorios si no existen
os.makedirs(data_dir, exist_ok=True)
os.makedirs(translations_dir, exist_ok=True)

print(f"Buscando archivos MP3 en: {uploads_dir}")

# %%
# Cargar el modelo Seamless-Expressive
print("Cargando modelo Seamless-Expressive...")
model_name = "facebook/seamless-expressive"
processor = AutoProcessor.from_pretrained(model_name)
model = SeamlessM4Tv2ForSpeechToSpeech.from_pretrained(model_name).to(device)
print("Modelo cargado correctamente")

# %%
def translate_audio_expressive(file_path, target_lang="eng", speaker_id=0, speed_factor=1.0):
    """
    Traduce un archivo de audio usando el modelo Seamless-Expressive.
    Args:
        file_path (str): Ruta al archivo de audio
        target_lang (str): Código del idioma de destino (por defecto: 'eng')
        speaker_id (int): ID del estilo de voz (0-9)
        speed_factor (float): Factor de velocidad (0.5-2.0)
    Returns:
        str: Ruta al archivo de audio traducido
    """
    try:
        # Cargar archivo de audio
        waveform, sample_rate = torchaudio.load(file_path)
       
        # Resamplear a 16000 Hz si es necesario
        if sample_rate != 16000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)
            waveform = resampler(waveform)
       
        # Convertir array a tensor de torch
        audio_tensor = waveform.to(device)
        
        # Preparar entrada para el modelo
        inputs = processor(
            audios=audio_tensor,
            sampling_rate=16000,
            return_tensors="pt"
        ).to(device)
        
        # Generar traducción de audio con características expresivas
        with torch.no_grad():
            outputs = model.generate(
                **inputs, 
                tgt_lang=target_lang, 
                speaker_id=speaker_id,
                speed_factor=speed_factor
            )
            translated_audio = outputs[0].cpu().numpy().squeeze()
        
        # Guardar el audio traducido
        translated_file_name = os.path.basename(file_path).replace(
            ".mp3", 
            f"_translated_{target_lang}_style{speaker_id}_speed{speed_factor}.mp3"
        )
        translated_file_path = os.path.join(translations_dir, translated_file_name)
        torchaudio.save(translated_file_path, torch.tensor(translated_audio).unsqueeze(0), sample_rate=16000)
        
        return translated_file_path
    
    except Exception as e:
        print(f"Error procesando {file_path}: {str(e)}")
        return None

# Estilos de voz disponibles
VOICE_STYLES = {
    0: "Neutral",
    1: "Happy",
    2: "Sad",
    3: "Angry",
    4: "Surprised",
    5: "Whisper",
    6: "Fast",
    7: "Slow",
    8: "High Pitch",
    9: "Low Pitch"
}

def process_with_different_styles(file_path):
    """
    Procesa un archivo de audio con todos los estilos disponibles.
    Args:
        file_path (str): Ruta al archivo de audio
    Returns:
        list: Lista de tuplas (estilo, ruta_archivo)
    """
    results = []
    for style_id, style_name in VOICE_STYLES.items():
        print(f"\nProcesando con estilo: {style_name}")
        translated_path = translate_audio_expressive(
            file_path,
            speaker_id=style_id,
            speed_factor=1.0
        )
        if translated_path:
            results.append((style_name, translated_path))
    return results

# %%
# Procesar todos los archivos MP3 en el directorio de uploads
mp3_files = glob.glob(os.path.join(uploads_dir, "*.mp3"))
print(f"Se encontraron {len(mp3_files)} archivos MP3 para procesar")

# Procesar cada archivo
for file_path in tqdm(mp3_files):
    file_name = os.path.basename(file_path)
    print(f"\nProcesando archivo: {file_name}")
    print("-" * 50)
    
    # Procesar con todos los estilos
    results = process_with_different_styles(file_path)
    
    # Imprimir resultados
    if results:
        print("\nArchivos generados:")
        for style_name, translated_path in results:
            print(f"✓ {style_name}: {translated_path}")
    else:
        print("✗ Traducción fallida.")
    print("-" * 50)
# %% 