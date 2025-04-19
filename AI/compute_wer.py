import pandas as pd
import numpy as np
import re
import os
from tqdm import tqdm

def normalize_text(text):
    """
    Normaliza el texto eliminando puntuación y convirtiendo a minúsculas.
    """
    # Convertir a minúsculas
    text = text.lower()
    # Eliminar puntuación
    text = re.sub(r'[^\w\s]', '', text)
    # Normalizar espacios
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def calculate_wer(reference, hypothesis):
    """
    Calcula el Word Error Rate entre la referencia y la hipótesis.
    
    WER = (S + I + D) / N
    
    Donde:
    S = sustituciones
    I = inserciones
    D = eliminaciones
    N = número de palabras en la referencia
    """
    # Normalizar textos
    reference = normalize_text(reference)
    hypothesis = normalize_text(hypothesis)
    
    # Convertir a listas de palabras
    ref_words = reference.split()
    hyp_words = hypothesis.split()
    
    # Longitud de las secuencias
    r_len = len(ref_words)
    h_len = len(hyp_words)
    
    # Crear matriz para programación dinámica
    distance = np.zeros((r_len + 1, h_len + 1), dtype=np.int32)
    
    # Inicializar primera fila y columna
    for i in range(r_len + 1):
        distance[i, 0] = i
    for j in range(h_len + 1):
        distance[0, j] = j
    
    # Calcular matriz de distancia
    for i in range(1, r_len + 1):
        for j in range(1, h_len + 1):
            if ref_words[i-1] == hyp_words[j-1]:
                distance[i, j] = distance[i-1, j-1]
            else:
                substitution = distance[i-1, j-1] + 1
                insertion = distance[i, j-1] + 1
                deletion = distance[i-1, j] + 1
                distance[i, j] = min(substitution, insertion, deletion)
    
    # El WER es la distancia final dividida por la longitud de la referencia
    wer = float(distance[r_len, h_len]) / r_len if r_len > 0 else 0
    return round(wer, 2)  # Redondear a 2 decimales

def process_transcriptions(csv_path):
    """
    Procesa el archivo CSV de transcripciones y añade columnas de WER.
    """
    print(f"Cargando transcripciones desde: {csv_path}")
    # Cargar el CSV
    df = pd.read_csv(csv_path, index_col=0)
    
    # Obtener lista de columnas
    columns = df.columns.tolist()
    audio_files = [col for col in columns if not col.startswith('RTFx_')]
    
    # Obtener modelo de referencia y verificar que existe
    reference_model = "openai/whisper-large-v3"
    if reference_model not in df.index:
        print(f"Error: El modelo de referencia {reference_model} no se encuentra en el CSV.")
        return
    
    print(f"Usando {reference_model} como referencia para calcular WER")
    
    # Para cada archivo de audio, calcular WER para cada modelo
    for audio_file in tqdm(audio_files, desc="Calculando WER"):
        # Obtener transcripción de referencia
        reference = df.loc[reference_model, audio_file]
        if pd.isna(reference) or not isinstance(reference, str):
            print(f"Advertencia: Transcripción de referencia no válida para {audio_file}")
            continue
        
        # Calcular WER para cada modelo
        wer_column = f"WER_{audio_file}"
        for model in df.index:
            hypothesis = df.loc[model, audio_file]
            if pd.isna(hypothesis) or not isinstance(hypothesis, str):
                df.loc[model, wer_column] = 1.0  # WER máximo para transcripciones inválidas
                continue
                
            if model == reference_model:
                df.loc[model, wer_column] = 0.0  # WER es 0 para el modelo de referencia
            else:
                df.loc[model, wer_column] = calculate_wer(reference, hypothesis)
    
    # Reordenar columnas para que cada audio tenga transcripción, RTF y WER juntos
    ordered_columns = []
    for audio_file in audio_files:
        ordered_columns.append(audio_file)
        rtf_col = f"RTFx_{audio_file}"
        wer_col = f"WER_{audio_file}"
        if rtf_col in df.columns:
            ordered_columns.append(rtf_col)
        if wer_col in df.columns:
            ordered_columns.append(wer_col)
    
    # Verificar que todas las columnas existen
    ordered_columns = [col for col in ordered_columns if col in df.columns]
    df = df[ordered_columns]
    
    # Guardar el DataFrame con las nuevas columnas de WER como XLSX
    output_path = csv_path.replace('.csv', '_with_wer.xlsx')
    df.to_excel(output_path)
    print(f"Resultados guardados en: {output_path}")
    
    return df

if __name__ == "__main__":
    # Ruta al archivo CSV de transcripciones
    csv_path = "audios_test/transcriptions.csv"
    
    # Verificar que el archivo existe
    if not os.path.exists(csv_path):
        # Intentar una ruta alternativa
        script_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(script_dir, csv_path)
        if not os.path.exists(csv_path):
            print(f"Error: No se encuentra el archivo {csv_path}")
            exit(1)
    
    # Procesar las transcripciones
    process_transcriptions(csv_path)
