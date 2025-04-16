import pandas as pd
import numpy as np
import os
import torch
from transformers import pipeline, Wav2Vec2Model, HubertModel, WhisperProcessor, WhisperForConditionalGeneration
from sentence_transformers import SentenceTransformer
from sklearn.neighbors import NearestNeighbors
import librosa
import torchaudio

class HybridTagger:
    def __init__(self, 
                 audio_model_name="facebook/hubert-base-ls960", 
                 text_model_name="paraphrase-multilingual-mpnet-base-v2",
                 asr_model_name="openai/whisper-large-v3",
                 audio_weight=0.3,
                 text_weight=0.7,
                 device=None):
        # Configurar dispositivo
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
            
        print(f"Usando dispositivo: {self.device}")
        
        # Cargar modelos
        print("Cargando modelos...")
        # Modelo para embeddings de audio
        if "hubert" in audio_model_name:
            self.audio_model = HubertModel.from_pretrained(audio_model_name).to(self.device)
        else:
            self.audio_model = Wav2Vec2Model.from_pretrained(audio_model_name).to(self.device)
            
        # Modelo para embeddings de texto
        self.text_model = SentenceTransformer(text_model_name)
        
        # Modelo ASR para transcripción
        self.asr_model = pipeline("automatic-speech-recognition", 
                                 model=asr_model_name,
                                 device=0 if self.device == "cuda" else -1)
        
        # Configuración de pesos para la combinación de embeddings
        self.audio_weight = audio_weight
        self.text_weight = text_weight
        
        # Asegurarse de que los pesos sumen 1
        total = self.audio_weight + self.text_weight
        self.audio_weight /= total
        self.text_weight /= total
        
        print(f"Inicialización completada. Pesos: Audio={self.audio_weight:.2f}, Texto={self.text_weight:.2f}")
    
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
        waveform = self.load_audio(audio_path)
        
        # Obtener embedding
        with torch.no_grad():
            outputs = self.audio_model(waveform)
            # Promedio en la dimensión temporal para obtener un vector único
            embedding = torch.mean(outputs.last_hidden_state, dim=1).squeeze().cpu().numpy()
        
        return embedding
    
    def get_text_embedding(self, text):
        """Obtener embedding desde texto"""
        return self.text_model.encode(text)
    
    def transcribe_audio(self, audio_path):
        """Transcribir audio usando el modelo ASR"""
        result = self.asr_model(audio_path)
        return result["text"]
    
    def get_hybrid_embedding(self, audio_path, transcription=None):
        """Obtener embedding híbrido combinando audio y texto"""
        # Obtener embedding de audio
        audio_embedding = self.get_audio_embedding(audio_path)
        
        # Si no se proporciona transcripción, generarla
        if transcription is None:
            transcription = self.transcribe_audio(audio_path)
            
        # Obtener embedding de texto
        text_embedding = self.get_text_embedding(transcription)
        
        # Asegurarse de que ambos embeddings tengan la misma dimensión
        # Si no, proyectar el de menor dimensión al espacio del otro
        if audio_embedding.shape[0] != text_embedding.shape[0]:
            # En este caso, simplemente usaremos el embedding de texto
            # y ajustaremos los pesos
            print(f"Dimensiones diferentes: Audio={audio_embedding.shape[0]}, Texto={text_embedding.shape[0]}")
            print("Usando solo el embedding de texto para este caso")
            return text_embedding, transcription
        
        # Combinar embeddings con los pesos configurados
        hybrid_embedding = (self.audio_weight * audio_embedding + 
                           self.text_weight * text_embedding)
        
        return hybrid_embedding, transcription

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
    
    def compute_tag_embeddings(self, tags):
        """Calcular embeddings para las etiquetas"""
        return self.text_model.encode(tags)
    
    def find_knn_tags(self, tag_embeddings, input_embedding, tags, k=5):
        """Encontrar etiquetas más cercanas usando KNN"""
        # Crear modelo KNN
        knn = NearestNeighbors(n_neighbors=k, metric='cosine')
        knn.fit(tag_embeddings)
        
        # Encontrar los k vecinos más cercanos
        distances, indices = knn.kneighbors(input_embedding.reshape(1, -1))
        
        # Obtener las etiquetas correspondientes
        nearest_tags = [tags[idx] for idx in indices[0]]
        
        return nearest_tags, distances[0]

def process_audio_files(audio_dir, tags_file, output_file, transcriptions_file=None):
    """
    Procesar todos los archivos de audio en un directorio y generar etiquetas
    
    Args:
        audio_dir: Directorio con archivos de audio
        tags_file: Archivo con etiquetas
        output_file: Archivo de salida para guardar resultados
        transcriptions_file: Archivo CSV opcional con transcripciones existentes
    """
    # Inicializar el tagger híbrido
    tagger = HybridTagger()
    
    # Cargar etiquetas
    print("Cargando etiquetas...")
    tags = tagger.load_and_preprocess_tags(tags_file)
    print(f"Se cargaron {len(tags)} etiquetas únicas")
    
    # Calcular embeddings para las etiquetas
    print("Calculando embeddings para las etiquetas...")
    tag_embeddings = tagger.compute_tag_embeddings(tags)
    
    # Cargar transcripciones existentes si se proporcionan
    transcriptions = {}
    if transcriptions_file:
        print("Cargando transcripciones existentes...")
        df = pd.read_csv(transcriptions_file)
        for _, row in df.iterrows():
            if not pd.isna(row['transcription']) and row['transcription'] != "":
                transcriptions[row['file']] = row['transcription']
        print(f"Se cargaron {len(transcriptions)} transcripciones")
    
    # Listar archivos de audio
    audio_files = [f for f in os.listdir(audio_dir) if f.endswith(('.mp3', '.wav', '.ogg'))]
    print(f"Se encontraron {len(audio_files)} archivos de audio")
    
    # Procesar cada archivo
    results = []
    for idx, file_name in enumerate(audio_files):
        print(f"Procesando {idx+1}/{len(audio_files)}: {file_name}")
        
        audio_path = os.path.join(audio_dir, file_name)
        
        # Usar transcripción existente si está disponible
        transcription = transcriptions.get(file_name)
        
        # Obtener embedding híbrido
        hybrid_embedding, actual_transcription = tagger.get_hybrid_embedding(
            audio_path, transcription)
        
        # Si no teníamos transcripción, usar la generada
        if transcription is None:
            transcription = actual_transcription
        
        # Encontrar etiquetas cercanas
        nearest_tags, distances = tagger.find_knn_tags(
            tag_embeddings, hybrid_embedding, tags, k=5)
        
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
    print(f"Guardando resultados en {output_file}...")
    results_df.to_csv(output_file, index=False)
    
    print(f"Proceso completado. Se procesaron {len(results_df)} archivos.")
    return results_df

if __name__ == "__main__":
    # Configuración
    audio_dir = "data/audios"  # Directorio con archivos de audio
    tags_file = "tags_text.txt"  # Archivo con etiquetas
    transcriptions_file = "data/transcriptions.csv"  # Transcripciones existentes
    output_file = "data/hybrid_tags.csv"  # Archivo de salida
    
    # Procesar audios
    results = process_audio_files(
        audio_dir=audio_dir,
        tags_file=tags_file,
        output_file=output_file,
        transcriptions_file=transcriptions_file
    )
    
    # Mostrar ejemplo de resultados
    print("\nEjemplo de resultados:")
    print(results.head()) 