import torch
from transformers import pipeline
import argparse
import os
import textwrap

# Lista de modelos Whisper disponibles
SUPPORTED_MODELS = [
    "openai/whisper-tiny",      # 39M parámetros
    #"openai/whisper-base",      # 74M parámetros
    #"openai/whisper-small",     # 244M parámetros
    #"openai/whisper-medium",    # 769M parámetros
    #"openai/whisper-large-v2",  # 1550M parámetros
    "openai/whisper-large-v3",  # 1550M parámetros, mejor rendimiento
    #"openai/whisper-large-v3-turbo"  # versión optimizada para mejor velocidad
]

class WhisperASR:
    """
    Clase para realizar reconocimiento automático de voz (ASR) utilizando el modelo Whisper.
    """
    
    def __init__(self, model_name="openai/whisper-large-v3", device=None):
        """
        Inicializa el modelo Whisper para transcripción de audio.
        
        Args:
            model_name (str): Nombre del modelo Whisper a utilizar.
                             Opciones: "openai/whisper-tiny", "openai/whisper-base", 
                                      "openai/whisper-small", "openai/whisper-medium",
                                      "openai/whisper-large-v2", "openai/whisper-large-v3"
            device (str, optional): Dispositivo a utilizar ('cuda' o 'cpu'). 
                                   Si es None, se autodetecta.
        """
        # Autodetectar dispositivo si no se especifica
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
                        
        # Inicializar pipeline de ASR
        self.asr_model = pipeline(
            task="automatic-speech-recognition",
            model=model_name,
            device=self.device
        )
        
        self.model_name = model_name
        
    def transcribe(self, audio_file, language=None, **kwargs):
        """
        Transcribe un archivo de audio a texto.
        
        Args:
            audio_file (str): Ruta al archivo de audio a transcribir
            language (str, optional): Idioma para la transcripción ('es', 'en', etc.).
                                     Si es None, Whisper intentará detectar el idioma.
            **kwargs: Argumentos adicionales para pasar al pipeline
        
        Returns:
            str: Texto transcrito del audio
        """
        generate_kwargs = kwargs.pop('generate_kwargs', {})
        
        # Si se especifica un idioma, usarlo
        if language:
            generate_kwargs['language'] = language
            
        # Asegurarse de que return_timestamps esté habilitado para archivos largos
        generate_kwargs['return_timestamps'] = True
        
        # Transcribir audio
        result = self.asr_model(audio_file, generate_kwargs=generate_kwargs, **kwargs)
        
        # Si el resultado incluye timestamps, extraer solo el texto
        if isinstance(result, dict) and 'text' in result:
            return result
        elif isinstance(result, str):
            return {"text": result}
        else:
            return {"text": str(result)}
    
    def get_info(self):
        """
        Obtiene información sobre el modelo ASR actual.
        
        Returns:
            dict: Información del modelo (nombre y dispositivo)
        """
        return {
            "model_name": self.model_name,
            "device": self.device
        }

# Función simple para transcribir un archivo de audio sin crear una instancia de clase
def transcribe_audio(audio_file, model_name="openai/whisper-large-v3", language=None, device=None):
    """
    Transcribe un archivo de audio usando Whisper sin crear una instancia de clase.
    
    Args:
        audio_file (str): Ruta al archivo de audio
        model_name (str): Nombre del modelo Whisper a utilizar
        language (str, optional): Idioma para la transcripción. Si es None, se detecta automáticamente.
        device (str, optional): Dispositivo a utilizar ('cuda' o 'cpu'). Si es None, se autodetecta.
    
    Returns:
        str: Texto transcrito del audio
    """
    # Crear instancia temporal de WhisperASR
    asr = WhisperASR(model_name=model_name, device=device)
    
    # Transcribir audio
    result = asr.transcribe(audio_file, language=language)
    print(result)
    return result["text"]

# Uso de ejemplo
if __name__ == "__main__":
    # Configurar el parser de argumentos con RawTextHelpFormatter para preservar saltos de línea
    parser = argparse.ArgumentParser(
        description="Transcribe audio usando el modelo Whisper",
        formatter_class=argparse.RawTextHelpFormatter
    )
    
    # Argumentos disponibles
    parser.add_argument("--audio_file_path", type=str, help="Ruta relativa al archivo de audio", 
                       default="audios_test/message_67207_author_Manuelb_83952.wav")
    parser.add_argument("--language", type=str, help="Idioma de transcripción (ej: en, es, fr). Dejar vacío para auto-detección", 
                       default=None)
    
    # Crear el mensaje de ayuda para los modelos
    model_help = "Modelo Whisper a utilizar. Opciones disponibles:\n"
    for model in SUPPORTED_MODELS:
        model_help += f"  - {model}\n"
    
    parser.add_argument("--model_name", type=str, 
                       help=model_help,
                       default="openai/whisper-tiny")
    parser.add_argument("--device", type=str, 
                       help="Dispositivo a utilizar (cuda, cpu). Si no se especifica, se autodetecta", 
                       default=None)
    
    # Parsear argumentos
    args = parser.parse_args()
    
    # Convertir ruta relativa a absoluta si es necesario
    audio_path = args.audio_file_path
    if not os.path.isabs(audio_path):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        audio_path = os.path.join(base_dir, audio_path)
    
    # Verificar si el archivo existe
    if os.path.exists(audio_path):
        print(f"Transcribiendo archivo: {audio_path}")
        print(f"Usando modelo: {args.model_name}")
        
        if args.language:
            print(f"Idioma especificado: {args.language}")
        else:
            print("Modo: Detección automática de idioma")
        
        # Transcribir audio
        transcription = transcribe_audio(audio_path, model_name=args.model_name, 
                                        language=args.language, device=args.device)
        
        # Mostrar resultados
        print(f"\nTranscripción: {transcription}")
    else:
        print(f"Error: El archivo {audio_path} no existe.")
        print("Verifica la ruta o proporciona una ruta absoluta con --audio_file_path.")
