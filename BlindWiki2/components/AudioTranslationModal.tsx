import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import StyledButton from './StyledButton';
import AudioButton from './AudioButton'; // Assuming AudioButton is in the same directory or correctly pathed
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface AudioTranslationModalProps {
  visible: boolean;
  onClose: () => void;
  isProcessing: boolean;
  processedAudioUri: string | null;
  processingError: string | null;
  originalAudioUri: string | null; // To display something or retry?
}

const AudioTranslationModal: React.FC<AudioTranslationModalProps> = ({
  visible,
  onClose,
  isProcessing,
  processedAudioUri,
  processingError,
  originalAudioUri,
}) => {
  const { t } = useTranslation();

  let content;
  if (isProcessing) {
    content = (
      <>
        <ActivityIndicator size="large" color={Colors.light.activityIndicator} style={styles.activityIndicator} />
        <Text style={styles.statusText}>{t('modal.processingAudio')}</Text>
      </>
    );
  } else if (processingError) {
    content = (
      <>
        <Text style={styles.errorText}>{t('modal.processingError')}</Text>
        <Text style={styles.errorTextDetail}>{processingError}</Text>
      </>
    );
  } else if (processedAudioUri) {
    content = (
      <>
        <Text style={styles.statusText}>{t('modal.audioReady')}</Text>
        <AudioButton audioUri={processedAudioUri} autoPlay={false} style={styles.fullWidthButton} context="message" />
      </>
    );
  } else {
    content = (
      <Text style={styles.statusText}>{t('modal.readyToProcess')}</Text>
    );
  }

  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {content}
          <StyledButton title={t('common.close')} onPress={onClose} style={styles.fullWidthButton} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
    width: '80%',
    shadowColor: Colors.light.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 5,
  },
  statusText: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
    color: Colors.light.text,
  },
  errorText: {
    marginBottom: 4,
    textAlign: 'center',
    fontSize: 16,
    color: Colors.light.status.error,
    fontWeight: 'bold',
  },
  errorTextDetail: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
    color: Colors.light.text,
  },
  fullWidthButton: {
    width: '100%',
    marginTop: 10,
  },
  activityIndicator: {
    marginBottom: 16,
  },
});

export default AudioTranslationModal; 