import pandas as pd
import os
import time
from ASR import WhisperASR, SUPPORTED_MODELS
from tqdm import tqdm
import warnings
import librosa

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
                y las filas son los modelos, incluyendo métricas RTF.
    """
    # Usar todos los modelos si no se especifican
    if models is None:
        models = SUPPORTED_MODELS
    
    # Obtener lista de archivos de audio en la carpeta
    audio_files = [f for f in os.listdir(path_to_folder) if f.endswith('.wav')]
    
    # Obtener duración de cada archivo de audio
    audio_durations = {}
    for audio_file in audio_files:
        try:
            audio_path = os.path.join(path_to_folder, audio_file)
            duration = librosa.get_duration(path=audio_path)
            audio_durations[audio_file] = duration
            print(f"Duración de {audio_file}: {duration:.2f} segundos")
        except Exception as e:
            print(f"Error al obtener duración de {audio_file}: {str(e)}")
            audio_durations[audio_file] = 0
    
    # Crear diccionario para almacenar resultados, donde cada clave es un modelo
    results_dict = {model_name: {} for model_name in models}
    
    # Procesar cada modelo
    for model_name in tqdm(models, desc="Procesando modelos"):
        print(f"\nProcesando con modelo: {model_name}")
        asr = WhisperASR(model_name=model_name, device=device)
        
        # Procesar cada archivo de audio
        for audio_file in tqdm(audio_files, desc=f"Archivos con {model_name}", leave=False):
            try:
                # Medir tiempo de procesamiento
                start_time = time.time()
                transcription = asr.transcribe(os.path.join(path_to_folder, audio_file), language=language)
                end_time = time.time()
                
                # Calcular tiempo de procesamiento y RTF
                process_time = end_time - start_time
                rtf = audio_durations[audio_file] / process_time if process_time > 0 else 0
                rtf = round(rtf, 2)  # Redondear a 2 decimales
                
                # Guardar resultados
                results_dict[model_name][audio_file] = transcription["text"]
                results_dict[model_name][f"RTFx_{audio_file}"] = rtf
                
                print(f"  - RTFx para {audio_file} con {model_name}: {rtf:.2f}")
            except Exception as e:
                print(f"Error procesando {audio_file} con {model_name}: {str(e)}")
                results_dict[model_name][audio_file] = f"ERROR: {str(e)}"
                results_dict[model_name][f"RTFx_{audio_file}"] = 0
    
    # Convertir diccionario a DataFrame con modelos como índice (filas) y archivos como columnas
    results = pd.DataFrame(results_dict).T
    
    # Reordenar columnas para que cada archivo de audio sea seguido por su columna RTF
    ordered_columns = []
    for audio_file in audio_files:
        ordered_columns.append(audio_file)
        ordered_columns.append(f"RTFx_{audio_file}")
    
    # Asegurar que todas las columnas existen en el DataFrame
    existing_columns = set(results.columns)
    ordered_columns = [col for col in ordered_columns if col in existing_columns]
    
    # Reordenar columnas
    if ordered_columns:
        results = results[ordered_columns]
    
    # Guardar resultados
    output_file = os.path.join(path_to_folder, 'transcriptions.csv')
    results.to_csv(output_file, float_format='%.2f', index_label="Model")
    print(f"\nResultados guardados en: {output_file}")

    return results

if __name__ == "__main__":
    test_multiple_files("audios_test", device="cpu")
