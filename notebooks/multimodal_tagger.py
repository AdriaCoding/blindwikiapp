import pandas as pd
import numpy as np
import os
import torch
from transformers import ClapModel, ClapProcessor
from sklearn.neighbors import NearestNeighbors
from tqdm.auto import tqdm
import matplotlib.pyplot as plt
import librosa

class ClapTagger:
    def __init__(self, model_name="laion/clap-htsat-unfused", device=None):
        """
        Inicializador del tagger basado en CLAP
        
        Args:
            model_name: Nombre del modelo CLAP a usar
            device: Dispositivo (cuda o cpu)
        """
        # Configurar dispositivo
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
            
        print(f"Usando dispositivo: {self.device}")
        
        # Cargar modelo CLAP
        print(f"Cargando modelo CLAP: {model_name}...")
        self.model = ClapModel.from_pretrained(model_name).to(self.device)
        self.processor = ClapProcessor.from_pretrained(model_name)
        self.model_name = model_name
            
        print("Inicialización completada")
    
    def get_audio_embedding(self, audio_path):
        """Obtener embedding de audio usando CLAP"""
        try:
            # Cargar audio usando librosa para asegurar compatibilidad
            print(f"Cargando audio: {audio_path}")
            waveform, sr = librosa.load(audio_path, sr=48000, mono=True)
            
            # Procesar con CLAP
            # Nota: El procesador espera la forma correcta del audio
            inputs = self.processor(
                audios=waveform,
                sampling_rate=48000,
                return_tensors="pt"
            ).to(self.device)
            
            with torch.no_grad():
                audio_embedding = self.model.get_audio_features(**inputs)
                # Normalizar embeddings
                audio_embedding = audio_embedding / torch.norm(audio_embedding, dim=1, keepdim=True)
            
            return audio_embedding.cpu().numpy()[0]
        except Exception as e:
            print(f"Error al procesar {audio_path}: {str(e)}")
            return None
    
    def get_text_embedding(self, text):
        """Obtener embedding de texto usando CLAP"""
        try:
            # Procesar texto con CLAP
            inputs = self.processor(text=text, return_tensors="pt").to(self.device)
            with torch.no_grad():
                text_embedding = self.model.get_text_features(**inputs)
                # Normalizar embeddings
                text_embedding = text_embedding / torch.norm(text_embedding, dim=1, keepdim=True)
            return text_embedding.cpu().numpy()[0]
        except Exception as e:
            print(f"Error al procesar texto '{text}': {e}")
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
    
    def calculate_tag_embeddings(self, tags):
        """Calcular embeddings para todas las etiquetas"""
        tag_embeddings = []
        
        print("Calculando embeddings para etiquetas...")
        for tag in tqdm(tags):
            embedding = self.get_text_embedding(tag)
            if embedding is not None:
                tag_embeddings.append(embedding)
            else:
                # Si no se pudo obtener embedding, agregar un vector de ceros
                if len(tag_embeddings) > 0:
                    tag_embeddings.append(np.zeros_like(tag_embeddings[0]))
                else:
                    # Dimensión del embedding de CLAP
                    tag_embeddings.append(np.zeros(512))
        
        return np.array(tag_embeddings)
    
    def save_tag_embeddings(self, tag_embeddings, tags, save_dir, model_name=None):
        """
        Guardar embeddings de etiquetas en un archivo
        
        Args:
            tag_embeddings: Array de embeddings
            tags: Lista de etiquetas correspondientes
            save_dir: Directorio donde guardar
            model_name: Nombre del modelo para el nombre del archivo
        """
        if model_name is None:
            model_name = self.model_name.replace('/', '_')
        
        # Crear directorio si no existe
        os.makedirs(save_dir, exist_ok=True)
        
        # Guardar embeddings
        np.save(os.path.join(save_dir, f"tag_embeddings_{model_name}.npy"), tag_embeddings)
        
        # Guardar etiquetas correspondientes
        with open(os.path.join(save_dir, f"tags_{model_name}.txt"), 'w', encoding='utf-8') as f:
            f.write('\n'.join(tags))
        
        print(f"Embeddings de etiquetas guardados en {save_dir}")
    
    def load_tag_embeddings(self, load_dir, model_name=None, tags=None):
        """
        Cargar embeddings de etiquetas desde un archivo
        
        Args:
            load_dir: Directorio desde donde cargar
            model_name: Nombre del modelo para el nombre del archivo
            tags: Lista de etiquetas actuales para verificar consistencia
            
        Returns:
            tuple: (embeddings, lista de etiquetas)
        """
        if model_name is None:
            model_name = self.model_name.replace('/', '_')
        
        embeddings_file = os.path.join(load_dir, f"tag_embeddings_{model_name}.npy")
        tags_file = os.path.join(load_dir, f"tags_{model_name}.txt")
        
        # Verificar que ambos archivos existen
        if not os.path.exists(embeddings_file) or not os.path.exists(tags_file):
            print(f"No se encontraron embeddings guardados en {load_dir}")
            return None, None
        
        # Cargar etiquetas guardadas
        with open(tags_file, 'r', encoding='utf-8') as f:
            saved_tags = f.read().splitlines()
        
        # Si se proporcionaron etiquetas, verificar que coincidan con las guardadas
        if tags is not None:
            if len(tags) != len(saved_tags) or set(tags) != set(saved_tags):
                print("Las etiquetas actuales no coinciden con las guardadas. Recalculando embeddings...")
                return None, None
        
        # Cargar embeddings
        try:
            embeddings = np.load(embeddings_file)
            print(f"Embeddings de etiquetas cargados desde {embeddings_file}")
            return embeddings, saved_tags
        except Exception as e:
            print(f"Error al cargar embeddings: {e}")
            return None, None
    
    def find_similar_tags(self, audio_embedding, tag_embeddings, tags, k=5):
        """Encontrar etiquetas más similares a un audio"""
        # Crear modelo KNN
        knn = NearestNeighbors(n_neighbors=min(k, len(tags)), metric='cosine')
        knn.fit(tag_embeddings)
        
        # Encontrar los k vecinos más cercanos
        distances, indices = knn.kneighbors(audio_embedding.reshape(1, -1))
        
        # Obtener las etiquetas correspondientes
        nearest_tags = [tags[idx] for idx in indices[0]]
        
        return nearest_tags, distances[0]

def load_or_calculate_tag_embeddings(tagger, tags, tmp_dir):
    """
    Intenta cargar embeddings guardados o los calcula si no existen
    
    Args:
        tagger: Instancia de ClapTagger
        tags: Lista de etiquetas
        tmp_dir: Directorio para guardar/cargar embeddings temporales
        
    Returns:
        np.array: Embeddings de etiquetas
    """
    # Intentar cargar embeddings guardados
    tag_embeddings, saved_tags = tagger.load_tag_embeddings(tmp_dir, tags=tags)
    
    # Si no se pudieron cargar, calcularlos
    if tag_embeddings is None:
        tag_embeddings = tagger.calculate_tag_embeddings(tags)
        
        # Guardar para uso futuro
        tagger.save_tag_embeddings(tag_embeddings, tags, tmp_dir)
    
    return tag_embeddings

def process_audios_with_clap(audio_dir, tags_file, output_file, tmp_dir=None, model_name="laion/clap-htsat-unfused", batch_size=10):
    """
    Procesa archivos de audio usando el modelo CLAP para generar etiquetas
    
    Args:
        audio_dir: Directorio con archivos de audio
        tags_file: Archivo con etiquetas
        output_file: Archivo para guardar resultados
        tmp_dir: Directorio para guardar/cargar embeddings temporales
        model_name: Nombre del modelo CLAP
        batch_size: Tamaño de lote para barra de progreso
    """
    # Inicializar el tagger CLAP
    tagger = ClapTagger(model_name=model_name)
    
    # Cargar etiquetas
    print("Cargando etiquetas...")
    tags = tagger.load_and_preprocess_tags(tags_file)
    print(f"Se cargaron {len(tags)} etiquetas únicas")
    
    # Calcular o cargar embeddings de etiquetas
    if tmp_dir:
        tag_embeddings = load_or_calculate_tag_embeddings(tagger, tags, tmp_dir)
    else:
        tag_embeddings = tagger.calculate_tag_embeddings(tags)
    
    # Listar archivos de audio
    audio_files = [f for f in os.listdir(audio_dir) if f.endswith(('.mp3', '.wav', '.ogg'))]
    print(f"Se encontraron {len(audio_files)} archivos de audio")
    
    # Procesar cada archivo
    results = []
    
    print("\nProcesando archivos de audio...")
    for idx, file_name in enumerate(tqdm(audio_files)):
        audio_path = os.path.join(audio_dir, file_name)
        
        # Verificar que el archivo existe
        if not os.path.exists(audio_path):
            print(f"Archivo no encontrado: {audio_path}, omitiendo...")
            continue
            
        # Obtener embedding de audio
        audio_embedding = tagger.get_audio_embedding(audio_path)
        
        if audio_embedding is None:
            print(f"No se pudo obtener embedding para {file_name}, omitiendo...")
            continue
        
        # Encontrar etiquetas similares
        nearest_tags, distances = tagger.find_similar_tags(
            audio_embedding, tag_embeddings, tags, k=5)
        
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
        
        # Mostrar progreso detallado cada cierto número de archivos
        if (idx + 1) % batch_size == 0 or idx == len(audio_files) - 1:
            print(f"Procesados {idx + 1}/{len(audio_files)} archivos")
    
    # Convertir a DataFrame
    results_df = pd.DataFrame(results)
    
    # Guardar a CSV
    print(f"\nGuardando resultados en {output_file}...")
    if not results_df.empty:
        results_df.to_csv(output_file, index=False)
        print(f"Proceso completado. Se procesaron {len(results_df)} archivos.")
        
        # Mostrar las etiquetas más frecuentes
        visualize_tag_frequencies(results_df)
    else:
        print("No se procesaron archivos correctamente. No se generará archivo CSV ni visualizaciones.")
    
    return results_df

def visualize_tag_frequencies(results_df, top_n=20):
    """
    Visualiza las etiquetas más frecuentes encontradas por CLAP
    
    Args:
        results_df: DataFrame con resultados
        top_n: Número de etiquetas principales a mostrar
    """
    # Verificar que el DataFrame no esté vacío
    if results_df.empty:
        print("No hay datos para visualizar.")
        return
    
    # Verificar que existan columnas de etiquetas
    required_columns = [f'tag_{i+1}' for i in range(5)]
    if not all(col in results_df.columns for col in required_columns):
        print("El DataFrame no contiene las columnas de etiquetas necesarias.")
        return
    
    # Contar frecuencia de cada etiqueta
    tag_counts = {}
    for i in range(5):  # 5 etiquetas por audio
        tag_col = f'tag_{i+1}'
        for tag in results_df[tag_col].dropna().values:
            if tag in tag_counts:
                tag_counts[tag] += 1
            else:
                tag_counts[tag] = 1
    
    # Verificar que hay etiquetas para mostrar
    if not tag_counts:
        print("No se encontraron etiquetas para visualizar.")
        return
    
    # Ordenar por frecuencia
    sorted_tags = sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:top_n]
    
    # Preparar datos para visualización
    tags = [item[0] for item in sorted_tags]
    counts = [item[1] for item in sorted_tags]
    
    # Crear gráfico de barras horizontales
    plt.figure(figsize=(12, 8))
    plt.barh(tags, counts, color='skyblue')
    plt.xlabel('Frecuencia')
    plt.ylabel('Etiquetas')
    plt.title(f'Top {top_n} etiquetas más frecuentes (CLAP)')
    plt.tight_layout()
    
    # Guardar gráfico
    plt.savefig('data/clap_tag_frequencies.png')
    print("Gráfico de frecuencias guardado en data/clap_tag_frequencies.png")
    
    # Mostrar top etiquetas
    print(f"\nTop {top_n} etiquetas más frecuentes:")
    for tag, count in sorted_tags:
        print(f"  {tag}: {count}")

def calculate_similarity_matrix(results_df, output_file='data/clap_similarity_matrix.png'):
    """
    Calcula matriz de similitud entre audios basándose en etiquetas comunes
    
    Args:
        results_df: DataFrame con resultados de CLAP
        output_file: Ruta para guardar la visualización
    """
    # Verificar que hay suficientes datos
    if results_df.empty:
        print("No hay datos suficientes para calcular la matriz de similitud.")
        return None
    
    # Obtener nombres de archivos
    files = results_df['file'].tolist()
    
    # Crear matriz de similitud
    n = len(files)
    sim_matrix = np.zeros((n, n))
    
    print("Calculando matriz de similitud entre audios...")
    for i in tqdm(range(n)):
        for j in range(i, n):
            # Obtener etiquetas para cada archivo
            tags_i = set()
            tags_j = set()
            
            for t in range(5):
                tag_col = f'tag_{t+1}'
                if not pd.isna(results_df.iloc[i][tag_col]) and results_df.iloc[i][tag_col] != "":
                    tags_i.add(results_df.iloc[i][tag_col])
                if not pd.isna(results_df.iloc[j][tag_col]) and results_df.iloc[j][tag_col] != "":
                    tags_j.add(results_df.iloc[j][tag_col])
            
            # Calcular similitud Jaccard
            intersection = len(tags_i.intersection(tags_j))
            union = len(tags_i.union(tags_j))
            similarity = intersection / union if union > 0 else 0
            
            # La matriz es simétrica
            sim_matrix[i, j] = similarity
            sim_matrix[j, i] = similarity
    
    # Visualizar matriz como mapa de calor (solo si hay menos de 50 archivos)
    if n <= 50:
        plt.figure(figsize=(12, 10))
        plt.imshow(sim_matrix, cmap='viridis')
        plt.colorbar(label='Índice de similitud Jaccard')
        plt.title('Similitud entre audios basada en etiquetas CLAP')
        plt.tight_layout()
        plt.savefig(output_file)
        print(f"Matriz de similitud guardada en {output_file}")
    
    return sim_matrix

if __name__ == "__main__":
    # Configuración
    audio_dir = "uploads"  # Directorio con archivos de audio
    tmp_dir = "tmp" # Directorio para guardar los embeddings de los tags
    tags_file = "tags_text.txt"  # Archivo con etiquetas
    output_file = "data/clap_tags.csv"  # Archivo para guardar resultados
    
    # Asegurar que existen las carpetas necesarias
    os.makedirs("data", exist_ok=True)
    os.makedirs(tmp_dir, exist_ok=True)
    
    # Procesar audios con CLAP
    results = process_audios_with_clap(
        audio_dir=audio_dir, 
        tags_file=tags_file, 
        output_file=output_file,
        tmp_dir=tmp_dir
    )
    
    # Calcular matriz de similitud entre audios (opcional)
    # Solo ejecutar si hay resultados
    if not results.empty:
        calculate_similarity_matrix(results) 