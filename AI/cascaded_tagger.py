import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.neighbors import NearestNeighbors
import os
import torch
import json
import argparse
import sys

# Añadir la ruta del directorio padre al path para poder importar desde AI
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from AI.ASR import WhisperASR

class AudioTagger:
    """
    Clase para etiquetar archivos de audio utilizando embeddings de etiquetas y ASR.
    """
    
    def __init__(self, taxonomy_file, model_name='paraphrase-multilingual-mpnet-base-v2', 
                 embeddings_dir='AI/embeddings', whisper_model="openai/whisper-large-v3"):
        """
        Inicializa el sistema de etiquetado.
        
        Args:
            taxonomy_file (str): Ruta al archivo de taxonomía de etiquetas
            model_name (str): Nombre del modelo de embeddings a utilizar
            embeddings_dir (str): Directorio donde guardar/cargar los embeddings
            whisper_model (str): Modelo de ASR a utilizar
        """
        self.taxonomy_file = taxonomy_file
        self.model_name = model_name
        self.embeddings_dir = embeddings_dir
        self.whisper_model = whisper_model
        
        # Cargar etiquetas
        self.tags = self.load_tags(taxonomy_file)
        
        # Inicializar modelo de embeddings
        self.embedding_model = SentenceTransformer(model_name)
        
        # Cargar o calcular embeddings
        self.tag_embeddings = self.load_or_compute_embeddings()
        
        # Inicializar ASR
        device = "cuda" if torch.cuda.is_available() else "cpu"
        self.asr = WhisperASR(model_name=whisper_model, device=device)
        
        # Inicializar KNN
        self.knn = NearestNeighbors(n_neighbors=min(5, len(self.tags)), metric='cosine')
        self.knn.fit(self.tag_embeddings)
    
    def load_tags(self, taxonomy_file):
        """
        Carga y preprocesa las etiquetas desde un archivo de taxonomía.
        
        Args:
            taxonomy_file (str): Ruta al archivo de taxonomía
            
        Returns:
            list: Lista de etiquetas procesadas
        """
        with open(taxonomy_file, 'r', encoding='utf-8') as f:
            tags = [line.strip().lower() for line in f.readlines()]
        
        return tags
    
    def compute_embeddings(self, texts):
        """
        Calcula embeddings para una lista de textos.
        
        Args:
            texts (list): Lista de textos
            
        Returns:
            numpy.ndarray: Matriz de embeddings
        """
        return self.embedding_model.encode(texts)
    
    def load_or_compute_embeddings(self):
        """
        Carga embeddings existentes o los calcula si no existen.
        
        Returns:
            numpy.ndarray: Matriz de embeddings de etiquetas
        """
        # Crear directorio de embeddings si no existe
        os.makedirs(self.embeddings_dir, exist_ok=True)
        
        # Generar nombre de archivo basado en el archivo de taxonomía y modelo
        taxonomy_name = os.path.splitext(os.path.basename(self.taxonomy_file))[0]
        embeddings_file = os.path.join(self.embeddings_dir, f"{taxonomy_name}_{self.model_name.replace('/', '_')}_embeddings.npz")
        
        # Verificar si el archivo de embeddings existe
        if os.path.exists(embeddings_file):
            print(f"Cargando embeddings existentes desde {embeddings_file}")
            data = np.load(embeddings_file)
            return data['embeddings']
        else:
            print(f"Calculando embeddings para {len(self.tags)} etiquetas...")
            embeddings = self.compute_embeddings(self.tags)
            
            # Guardar embeddings
            np.savez(embeddings_file, embeddings=embeddings, tags=np.array(self.tags))
            print(f"Embeddings guardados en {embeddings_file}")
            
            return embeddings
    
    def transcribe_audio(self, audio_file, language="en"):
        """
        Transcribe un archivo de audio usando WhisperASR.
        
        Args:
            audio_file (str): Ruta al archivo de audio
            language (str, optional): Idioma para la transcripción
            
        Returns:
            str: Texto transcrito
        """
        result = self.asr.transcribe(audio_file, language=language)
        return result["text"]
    
    def tag_audio(self, audio_file, language=None, k=5):
        """
        Etiqueta un archivo de audio.
        
        Args:
            audio_file (str): Ruta al archivo de audio
            language (str, optional): Idioma para la transcripción
            k (int): Número de etiquetas a devolver
            
        Returns:
            dict: Diccionario con transcripción y etiquetas recomendadas
        """
        # Asegurar que k no sea mayor que el número de etiquetas disponibles
        k = min(k, len(self.tags))
        
        # Transcribir audio
        print(f"Transcribiendo archivo: {audio_file}")
        transcription = self.transcribe_audio(audio_file, language)
        
        # Calcular embedding para la transcripción
        print("Calculando embedding para la transcripción...")
        transcription_embedding = self.embedding_model.encode(transcription)
        
        # Encontrar etiquetas más cercanas
        distances, indices = self.knn.kneighbors(transcription_embedding.reshape(1, -1))
        
        # Obtener etiquetas y calcular similitudes
        nearest_tags = [self.tags[idx] for idx in indices[0]]
        similarities = [float(1 - distance) for distance in distances[0]]
        
        # Crear resultado
        result = {
            'file': os.path.basename(audio_file),
            'transcription': transcription,
            'tags': []
        }
        
        # Añadir tags con similitudes
        for i in range(len(nearest_tags)):
            result['tags'].append({
                'tag': nearest_tags[i],
                'similarity': similarities[i]
            })
        
        return result

def main():
    # Configurar argumentos
    parser = argparse.ArgumentParser(description="Etiquetar archivos de audio utilizando ASR y embeddings")
    
    parser.add_argument("--audio_file", type=str, default="audios_test/message_66563_author_Paula_83315.wav",
                       help="Ruta al archivo de audio a etiquetar")
    parser.add_argument("--taxonomy_file", type=str, default="taxonomies/16tags.txt",
                       help="Ruta al archivo de taxonomía de etiquetas")
    parser.add_argument("--language", type=str, default=None,
                       help="Idioma para la transcripción (ej: es, en). Si no se especifica, se detecta automáticamente")
    parser.add_argument("--embedding_model", type=str, default="paraphrase-multilingual-mpnet-base-v2",
                       help="Modelo de embeddings a utilizar")
    parser.add_argument("--whisper_model", type=str, default="openai/whisper-small",
                       help="Modelo de Whisper a utilizar para ASR")
    parser.add_argument("--top_k", type=int, default=5,
                       help="Número de etiquetas a devolver")
    parser.add_argument("--output", type=str, default=None,
                       help="Ruta para guardar el resultado en formato JSON. Si no se especifica, se muestra en consola")
    
    args = parser.parse_args()
    
    # Verificar que el archivo de audio existe
    if not os.path.exists(args.audio_file):
        print(f"Error: El archivo de audio {args.audio_file} no existe.")
        return
    
    # Verificar que el archivo de taxonomía existe
    if not os.path.exists(args.taxonomy_file):
        print(f"Error: El archivo de taxonomía {args.taxonomy_file} no existe.")
        return
    
    # Inicializar tagger
    tagger = AudioTagger(
        taxonomy_file=args.taxonomy_file,
        model_name=args.embedding_model,
        whisper_model=args.whisper_model
    )
    
    # Etiquetar audio
    result = tagger.tag_audio(
        audio_file=args.audio_file,
        language=args.language,
        k=args.top_k
    )
    
    # Guardar o mostrar resultado
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        print(f"Resultado guardado en {args.output}")
    else:
        print("\nResultado:")
        print(f"Archivo: {result['file']}")
        print(f"Transcripción: {result['transcription']}")
        print("Etiquetas recomendadas:")
        for i, tag_info in enumerate(result['tags']):
            print(f"  {i+1}. {tag_info['tag']} (similitud: {tag_info['similarity']:.4f})")

if __name__ == "__main__":
    main()
