import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.neighbors import NearestNeighbors
import os

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

# 2 y 3. Cargar MP3 y leer transcripción
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

# 4. Calcular embeddings
def compute_embeddings(texts, model_name='all-MiniLM-L6-v2'):
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
    mp3_file = "uploads/barcelona_JuanNuez_m70566_a87310_audio_converted.mp3"
    transcriptions_file = "data/transcriptions.csv"
    
    # 1. Cargar y preprocesar tags
    print("Cargando y preprocesando etiquetas...")
    tags = load_and_preprocess_tags(tags_file)
    print(f"Se cargaron {len(tags)} etiquetas únicas")
    
    # 2 y 3. Obtener transcripción
    print("\nObteniendo transcripción del archivo MP3...")
    transcription = get_transcription(mp3_file, transcriptions_file)
    if transcription:
        print(f"Transcripción: {transcription}")
    else:
        print("No se encontró la transcripción para este archivo")
        exit(1)
    
    # 4. Calcular embeddings
    print("\nCalculando embeddings...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    tag_embeddings = model.encode(tags)
    transcription_embedding = model.encode(transcription)
    
    # 5. Encontrar etiquetas usando KNN
    print("\nEncontrando etiquetas más cercanas (K=5)...")
    nearest_tags, distances = find_knn_tags(tag_embeddings, transcription_embedding, tags, k=5)
    
    # Mostrar resultados
    print("\nEtiquetas más cercanas a la transcripción:")
    for i, (tag, distance) in enumerate(zip(nearest_tags, distances)):
        similarity = 1 - distance  # Convertir distancia coseno a similitud
        print(f"{i+1}. {tag} (Similitud: {similarity:.4f})")
