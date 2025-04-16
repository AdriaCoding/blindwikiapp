import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.neighbors import NearestNeighbors
import os
from transformers import pipeline
import torch

# 1. Cargar y preprocesar las etiquetas de tags_text.txt
def load_and_preprocess_tags(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        tags_text = f.read()
    
    tags_list, processed_tags = tags_text.split(" "), []
    non_supported_letters = set(["#","(",")","_"])
    
    for tag in tags_list:
        tmp_tag = ""
        for letter in tag:
            if letter not in non_supported_letters and not letter.isnumeric():
                tmp_tag += letter
        if len(tmp_tag) != 0:
            processed_tags.append(tmp_tag.lower())
    
    return processed_tags

# 2. Transcribir audio usando Whisper
def transcribe_audio(audio_file, asr_model=None):
    if asr_model is None:
        # Inicializar el modelo ASR si no se proporciona
        device = "cuda" if torch.cuda.is_available() else "cpu"
        asr_model = pipeline("automatic-speech-recognition", 
                           model="openai/whisper-large-v3",
                           device=device)
    
    # Transcribir el audio
    result = asr_model(audio_file)
    return result["text"]

# 3. Obtener transcripción desde CSV
def get_transcription(mp3_file, transcriptions_csv):
    # Obtener solo el nombre base del archivo
    mp3_basename = os.path.basename(mp3_file)
    
    # Leer el CSV
    df = pd.read_csv(transcriptions_csv)
    
    # Buscar la transcripción
    transcription = df[df['file'] == mp3_basename]['transcription'].values
    
    if len(transcription) > 0:
        return transcription[0]
    else:
        return None

# 4. Calcular embeddings con modelo mejorado
def compute_embeddings(texts, model_name='paraphrase-multilingual-mpnet-base-v2'):
    # Cargar modelo
    model = SentenceTransformer(model_name)
    
    # Calcular embeddings
    embeddings = model.encode(texts)
    
    return embeddings

# 5. Encontrar etiquetas usando KNN
def find_knn_tags(tag_embeddings, text_embedding, tags, k=5):
    # Crear modelo KNN
    knn = NearestNeighbors(n_neighbors=k, metric='cosine')
    knn.fit(tag_embeddings)
    
    # Encontrar los k vecinos más cercanos
    distances, indices = knn.kneighbors(text_embedding.reshape(1, -1))
    
    # Obtener las etiquetas correspondientes
    nearest_tags = [tags[idx] for idx in indices[0]]
    
    return nearest_tags, distances[0]

if __name__ == "__main__":
    # Rutas de archivos
    tags_file = "tags_text.txt"
    transcriptions_file = "data/transcriptions.csv"
    output_file = "data/automatic_tags.csv"
    
    # Configurar dispositivo
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Usando dispositivo: {device}")
    
    # 1. Cargar y preprocesar tags
    print("Cargando y preprocesando etiquetas...")
    tags = load_and_preprocess_tags(tags_file)
    print(f"Se cargaron {len(tags)} etiquetas únicas")
    
    # Cargar transcripciones
    print("\nCargando transcripciones...")
    transcriptions_df = pd.read_csv(transcriptions_file)
    print(f"Se encontraron {len(transcriptions_df)} transcripciones")
    
    # Inicializar el modelo ASR mejorado (si se van a transcribir audios directamente)
    # Si solo usamos transcripciones existentes, esto no es necesario
    use_direct_transcription = False  # Cambiar a True si quieres transcribir directamente
    asr_model = None
    if use_direct_transcription:
        print("\nCargando modelo ASR Whisper...")
        asr_model = pipeline("automatic-speech-recognition", 
                           model="openai/whisper-large-v3",
                           device=device)
    
    # Inicializar el modelo de embeddings mejorado
    print("\nCargando modelo de embeddings mejorado...")
    model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
    
    # Calcular embeddings para todas las etiquetas
    print("Calculando embeddings para las etiquetas...")
    tag_embeddings = model.encode(tags)
    
    # Crear DataFrame para resultados
    results = []
    
    # Procesar cada transcripción
    print("\nProcesando transcripciones...")
    for idx, row in transcriptions_df.iterrows():
        file_name = row['file']
        
        # Si tenemos transcripciones, usarlas; sino, transcribir directamente
        if use_direct_transcription:
            audio_path = os.path.join("data/audios", file_name)  # Ajustar ruta según sea necesario
            if os.path.exists(audio_path):
                transcription = transcribe_audio(audio_path, asr_model)
            else:
                print(f"Archivo de audio {audio_path} no encontrado, omitiendo...")
                continue
        else:
            transcription = row['transcription']
        
        if pd.isna(transcription) or transcription == "":
            print(f"Transcripción vacía para {file_name}, omitiendo...")
            continue
        
        print(f"Procesando {idx+1}/{len(transcriptions_df)}: {file_name}")
        
        # Calcular embedding para esta transcripción
        transcription_embedding = model.encode(transcription)
        
        # Encontrar etiquetas más cercanas
        nearest_tags, distances = find_knn_tags(tag_embeddings, transcription_embedding, tags, k=5)
        
        # Calcular similitudes
        similarities = [1 - distance for distance in distances]
        
        # Crear registro para este archivo
        result = {
            'file': file_name,
            'transcription': transcription,
        }
        
        # Agregar tags y similitudes
        for i in range(5):
            result[f'tag_{i+1}'] = nearest_tags[i] if i < len(nearest_tags) else ""
            result[f'similarity_{i+1}'] = similarities[i] if i < len(similarities) else 0.0
        
        # Agregar a resultados
        results.append(result)
    
    # Convertir a DataFrame
    results_df = pd.DataFrame(results)
    
    # Guardar a CSV
    print(f"\nGuardando resultados en {output_file}...")
    results_df.to_csv(output_file, index=False)
    
    print(f"Proceso completado. Se procesaron {len(results_df)} archivos.")
    
    # Mostrar primeros resultados como ejemplo
    print("\nEjemplo de resultados:")
    print(results_df.head())
