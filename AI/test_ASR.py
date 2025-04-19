import pandas as pd
import os
from ASR import WhisperASR, SUPPORTED_MODELS
from tqdm import tqdm
import warnings

# Suprimir todos los warnings
warnings.filterwarnings("ignore")

def test_multiple_files(path_to_folder, models=None, language=None, device=None):
    """
    Realiza transcripciones de todos los archivos de audio en una carpeta usando múltiples modelos.
    
    Args:
        path_to_folder (str): Ruta a la carpeta que contiene los archivos de audio.
        models (list, optional): Lista de modelos a probar. Si es None, se usan todos los modelos soportados.
        language (str, optional): Idioma para la transcripción. Si es None, se detecta automáticamente.
        device (str, optional): Dispositivo a utilizar ('cuda' o 'cpu'). Si es None, se autodetecta.

    Returns:
        results: Fichero .csv con las transcripciones donde las columnas son los archivos 
                y las filas son los modelos.
    """
    # Usar todos los modelos si no se especifican
    if models is None:
        models = SUPPORTED_MODELS
    
    # Obtener lista de archivos de audio en la carpeta
    audio_files = [f for f in os.listdir(path_to_folder) if f.endswith('.wav')]
    
    # Crear diccionario para almacenar resultados, donde cada clave es un modelo
    results_dict = {model_name: {} for model_name in models}
    
    # Procesar cada modelo
    for model_name in tqdm(models, desc="Procesando modelos"):
        print(f"\nProcesando con modelo: {model_name}")
        asr = WhisperASR(model_name=model_name, device=device)
        
        # Procesar cada archivo de audio
        for audio_file in tqdm(audio_files, desc=f"Archivos con {model_name}", leave=False):
            try:
                transcription = asr.transcribe(os.path.join(path_to_folder, audio_file), language=language)
                results_dict[model_name][audio_file] = transcription["text"]
            except Exception as e:
                print(f"Error procesando {audio_file} con {model_name}: {str(e)}")
                results_dict[model_name][audio_file] = f"ERROR: {str(e)}"
    
    # Convertir diccionario a DataFrame con modelos como índice (filas) y archivos como columnas
    results = pd.DataFrame(results_dict).T
    
    # Guardar resultados
    output_file = os.path.join(path_to_folder, 'transcriptions.csv')
    results.to_csv(output_file)
    print(f"\nResultados guardados en: {output_file}")

    return results

if __name__ == "__main__":
    test_multiple_files("audios_test", device="cpu")
