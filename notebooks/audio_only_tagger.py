import pandas as pd
import numpy as np
import os
import torch
from transformers import Wav2Vec2Model, HubertModel
from sklearn.neighbors import NearestNeighbors
import torchaudio
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import PCA

class AudioOnlyTagger:
    def __init__(self, 
                 audio_model_name="facebook/hubert-large-ll60k", 
                 use_pca=True,
                 embedding_dim=768,
                 device=None):
        """
        Inicializador del tagger basado solo en audio
        
        Args:
            audio_model_name: Nombre del modelo de audio preentrenado
            use_pca: Si se debe usar PCA para reducir dimensiones de embeddings
            embedding_dim: Dimensión objetivo para reducción PCA
            device: Dispositivo (cuda o cpu)
        """
        # Configurar dispositivo
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
            
        print(f"Usando dispositivo: {self.device}")
        
        # Cargar modelo de audio
        print(f"Cargando modelo de audio {audio_model_name}...")
        if "hubert" in audio_model_name.lower():
            self.audio_model = HubertModel.from_pretrained(audio_model_name).to(self.device)
        else:
            self.audio_model = Wav2Vec2Model.from_pretrained(audio_model_name).to(self.device)
        
        # Configuración de reducción de dimensionalidad
        self.use_pca = use_pca
        self.embedding_dim = embedding_dim
        self.pca = None
        
        print("Inicialización completada")
    
    def load_audio(self, audio_path, target_sr=16000):
        """Cargar archivo de audio y prepararlo para el modelo"""
        # Cargar audio
        waveform, sample_rate = torchaudio.load(audio_path)
        
        # Convertir a mono si es necesario
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)
        
        # Remuestrear si es necesario
        if sample_rate != target_sr:
            resampler = torchaudio.transforms.Resample(sample_rate, target_sr)
            waveform = resampler(waveform)
        
        return waveform.to(self.device)
    
    def get_audio_embedding(self, audio_path):
        """Obtener embedding directamente desde el audio"""
        try:
            waveform = self.load_audio(audio_path)
            
            # Obtener embedding
            with torch.no_grad():
                outputs = self.audio_model(waveform)
                # Promedio en la dimensión temporal para obtener un vector único
                embedding = torch.mean(outputs.last_hidden_state, dim=1).squeeze().cpu().numpy()
            
            return embedding
        except Exception as e:
            print(f"Error al procesar {audio_path}: {e}")
            return None
    
    def load_and_preprocess_tags(self, file_path):
        """Cargar y preprocesar etiquetas desde un archivo"""
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
    
    def project_tags_to_audio_space(self, tags, sample_audio_embeddings):
        """
        Proyecta etiquetas de texto al espacio de embeddings de audio
        
        Estrategia: Crear un mapping entre el espacio de embeddings de audio y una
        representación semántica de las etiquetas.
        """
        print("Proyectando etiquetas al espacio de embeddings de audio...")
        
        # Primero obtenemos embeddings textuales para las etiquetas
        # (Usamos un modelo de texto solo para esta proyección inicial)
        text_model = SentenceTransformer('paraphrase-multilingual-mpnet-base-v2')
        tag_text_embeddings = text_model.encode(tags)
        
        # Si tenemos suficientes muestras de audio, entrenamos un PCA 
        # para alinear los espacios de embedding
        if self.use_pca and len(sample_audio_embeddings) > 10:
            print("Entrenando PCA para alinear espacios de embedding...")
            # Aseguramos que la dimensión objetivo sea menor o igual a la dimensión original
            target_dim = min(self.embedding_dim, sample_audio_embeddings[0].shape[0], tag_text_embeddings.shape[1])
            
            # Entrenar PCA en los embeddings de audio
            self.pca = PCA(n_components=target_dim)
            audio_embeddings_pca = self.pca.fit_transform(np.vstack(sample_audio_embeddings))
            
            # Aplicar la misma transformación a los embeddings de texto
            tag_embeddings_pca = self.pca.transform(tag_text_embeddings)
            
            return tag_embeddings_pca
        else:
            # Si no podemos usar PCA, simplemente reducimos los embeddings de texto
            # a la misma dimensión que los de audio mediante truncamiento
            audio_dim = sample_audio_embeddings[0].shape[0]
            truncated_tag_embeddings = tag_text_embeddings[:, :audio_dim]
            return truncated_tag_embeddings
    
    def find_knn_tags(self, tag_embeddings, audio_embedding, tags, k=5):
        """Encontrar etiquetas más cercanas usando KNN"""
        # Crear modelo KNN
        knn = NearestNeighbors(n_neighbors=min(k, len(tags)), metric='cosine')
        knn.fit(tag_embeddings)
        
        # Si usamos PCA, transformar el embedding de audio
        if self.pca is not None:
            audio_embedding = self.pca.transform(audio_embedding.reshape(1, -1))
        
        # Encontrar los k vecinos más cercanos
        distances, indices = knn.kneighbors(audio_embedding.reshape(1, -1))
        
        # Obtener las etiquetas correspondientes
        nearest_tags = [tags[idx] for idx in indices[0]]
        
        return nearest_tags, distances[0]

def process_audio_files(audio_dir, tags_file, output_file, num_samples=50):
    """
    Procesar todos los archivos de audio en un directorio y generar etiquetas
    usando solo información de audio
    
    Args:
        audio_dir: Directorio con archivos de audio
        tags_file: Archivo con etiquetas
        output_file: Archivo de salida para guardar resultados
        num_samples: Número de muestras de audio para proyección de embeddings
    """
    # Inicializar el tagger
    tagger = AudioOnlyTagger()
    
    # Cargar etiquetas
    print("Cargando etiquetas...")
    tags = tagger.load_and_preprocess_tags(tags_file)
    print(f"Se cargaron {len(tags)} etiquetas únicas")
    
    # Listar archivos de audio
    audio_files = [f for f in os.listdir(audio_dir) if f.endswith(('.mp3', '.wav', '.ogg'))]
    print(f"Se encontraron {len(audio_files)} archivos de audio")
    
    # Recolectar muestras de embeddings de audio para proyección
    print(f"Recolectando {num_samples} muestras de embeddings de audio...")
    sample_audio_embeddings = []
    sample_files = np.random.choice(audio_files, min(num_samples, len(audio_files)), replace=False)
    
    for file_name in sample_files:
        audio_path = os.path.join(audio_dir, file_name)
        embedding = tagger.get_audio_embedding(audio_path)
        if embedding is not None:
            sample_audio_embeddings.append(embedding)
    
    # Proyectar etiquetas al espacio de embeddings de audio
    tag_embeddings = tagger.project_tags_to_audio_space(tags, sample_audio_embeddings)
    
    # Procesar cada archivo
    results = []
    for idx, file_name in enumerate(audio_files):
        print(f"Procesando {idx+1}/{len(audio_files)}: {file_name}")
        
        audio_path = os.path.join(audio_dir, file_name)
        
        # Obtener embedding de audio
        audio_embedding = tagger.get_audio_embedding(audio_path)
        
        if audio_embedding is None:
            print(f"No se pudo obtener embedding para {file_name}, omitiendo...")
            continue
        
        # Encontrar etiquetas cercanas
        nearest_tags, distances = tagger.find_knn_tags(
            tag_embeddings, audio_embedding, tags, k=5)
        
        # Calcular similitudes
        similarities = [1 - distance for distance in distances]
        
        # Crear registro para este archivo
        result = {
            'file': file_name,
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
    print(f"Guardando resultados en {output_file}...")
    results_df.to_csv(output_file, index=False)
    
    print(f"Proceso completado. Se procesaron {len(results_df)} archivos.")
    return results_df

def evaluate_vs_transcription_approach(audio_dir, transcriptions_file, tags_file, audio_output_file, 
                                    transcription_output_file="data/automatic_tags.csv"):
    """
    Compara el rendimiento del enfoque basado solo en audio vs el basado en transcripciones
    
    Args:
        audio_dir: Directorio con audios
        transcriptions_file: Archivo con transcripciones
        tags_file: Archivo con etiquetas
        audio_output_file: Archivo para resultados del enfoque de solo audio
        transcription_output_file: Archivo con resultados del enfoque de transcripción
    """
    # Procesar con enfoque de solo audio
    print("PROCESANDO CON ENFOQUE DE SOLO AUDIO...")
    audio_results = process_audio_files(
        audio_dir=audio_dir,
        tags_file=tags_file,
        output_file=audio_output_file
    )
    
    # Cargar resultados del enfoque de transcripción (debe haberse ejecutado antes)
    try:
        print("\nCargando resultados del enfoque basado en transcripción...")
        text_results = pd.read_csv(transcription_output_file)
        
        # Comparar resultados
        print("\nCOMPARACIÓN DE ENFOQUES:")
        
        # Encontrar archivos comunes
        common_files = set(audio_results['file']).intersection(set(text_results['file']))
        print(f"Archivos comunes para comparación: {len(common_files)}")
        
        if len(common_files) > 0:
            # Calcular coincidencia de etiquetas
            tag_matches = []
            for file in common_files:
                audio_tags = set([audio_results[audio_results['file'] == file][f'tag_{i+1}'].values[0] 
                                for i in range(5) if not pd.isna(audio_results[audio_results['file'] == file][f'tag_{i+1}'].values[0])])
                
                text_tags = set([text_results[text_results['file'] == file][f'tag_{i+1}'].values[0] 
                                for i in range(5) if not pd.isna(text_results[text_results['file'] == file][f'tag_{i+1}'].values[0])])
                
                # Calcular Jaccard similarity
                intersection = len(audio_tags.intersection(text_tags))
                union = len(audio_tags.union(text_tags))
                similarity = intersection / union if union > 0 else 0
                
                tag_matches.append(similarity)
            
            avg_similarity = np.mean(tag_matches)
            print(f"Similitud promedio entre etiquetas: {avg_similarity:.4f}")
            print(f"Desviación estándar: {np.std(tag_matches):.4f}")
    except FileNotFoundError:
        print(f"No se encontró el archivo {transcription_output_file} para comparación")
    except Exception as e:
        print(f"Error al comparar enfoques: {e}")
    
    return audio_results

if __name__ == "__main__":
    # Configuración
    audio_dir = "data/audios"  # Directorio con archivos de audio
    tags_file = "tags_text.txt"  # Archivo con etiquetas
    transcriptions_file = "data/transcriptions.csv"  # Transcripciones existentes
    output_file = "data/audio_only_tags.csv"  # Archivo de salida
    
    # Procesar audios (solo con enfoque de audio)
    # Si quieres también comparar con el enfoque de transcripción, usa evaluate_vs_transcription_approach
    run_comparison = True
    
    if run_comparison:
        results = evaluate_vs_transcription_approach(
            audio_dir=audio_dir,
            transcriptions_file=transcriptions_file,
            tags_file=tags_file, 
            audio_output_file=output_file
        )
    else:
        results = process_audio_files(
            audio_dir=audio_dir,
            tags_file=tags_file,
            output_file=output_file
        )
    
    # Mostrar ejemplo de resultados
    print("\nEjemplo de resultados:")
    print(results.head()) 