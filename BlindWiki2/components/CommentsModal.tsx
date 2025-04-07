import React, { useState, useEffect, useRef } from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Text, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/Colors";
import StyledButton from "./StyledButton";
import StyledInput from "./StyledInput";
import { Comment, Message } from "@/models/message";
import { postComment } from "@/services/messageService";
import { useAuth } from "@/contexts/AuthContext";
import AudioButton from "./AudioButton";

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  message: Message | null;
  onCommentAdded?: () => Promise<any>;
}

export default function CommentsModal({
  visible,
  onClose,
  message,
  onCommentAdded
}: CommentsModalProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Resetear estado cuando se abre/cierra el modal
  useEffect(() => {
    if (visible) {
      setNewComment("");
      setError(null);
    }
  }, [visible]);

  // Desplazar al final cuando hay nuevos comentarios
  useEffect(() => {
    if (visible && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [visible, message?.comments]);

  const handlePostComment = async () => {
    if (!message || !user || !newComment.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await postComment(message.id, newComment);
      
      if (response.success) {
        setNewComment("");
        if (onCommentAdded) {
          await onCommentAdded();
        }
      } else {
        setError(response.errorMessage || t("comments.errorPosting"));
      }
    } catch (err) {
      setError(t("comments.unexpectedError"));
      console.error("Error posting comment:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar si el botón de publicar está habilitado
  const isPostButtonEnabled = !isLoading && newComment.trim().length > 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("comments.title")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {!message ? (
              <Text style={styles.noDataText}>{t("comments.noMessageSelected")}</Text>
            ) : message.comments && message.comments.length > 0 ? (
              <ScrollView 
                ref={scrollViewRef}
                style={styles.commentsContainer}
                contentContainerStyle={styles.commentsContent}
              >
                {message.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{comment.authorUser.displayName}</Text>
                      <Text style={styles.commentDate}>
                        {new Date(comment.dateTime).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.commentText}>{comment.text}</Text>
                    {comment.audio_url && (
                      <AudioButton 
                        audioUri={comment.audio_url}
                        style={styles.audioButton}
                      />
                    )}
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.noDataText}>{t("comments.noComments")}</Text>
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.newCommentContainer}>
              <StyledInput
                value={newComment}
                onChangeText={setNewComment}
                placeholder={t("comments.writeComment")}
                multiline={true}
                numberOfLines={3}
                style={styles.commentInput}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <StyledButton
              title={t("common.cancel")}
              onPress={onClose}
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />
            {isPostButtonEnabled ? (
              <StyledButton
                title={t("comments.post")}
                onPress={handlePostComment}
                style={styles.postButton}
                textStyle={styles.postButtonText}
              />
            ) : (
              <View style={[styles.postButton, styles.disabledButton]}>
                <Text style={[styles.postButtonText, styles.disabledButtonText]}>
                  {t("comments.post")}
                </Text>
              </View>
            )}
          </View>
          
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    height: "80%",
    backgroundColor: Colors.light.background,
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
  },
  content: {
    flex: 1,
  },
  commentsContainer: {
    flex: 1,
    marginBottom: 10,
  },
  commentsContent: {
    paddingBottom: 10,
  },
  commentItem: {
    backgroundColor: "#f5f5f5", // Color de fondo sutil
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  commentAuthor: {
    fontWeight: "bold",
    color: Colors.light.text,
  },
  commentDate: {
    fontSize: 12,
    color: "#777777", // Color de texto gris
  },
  commentText: {
    marginBottom: 8,
  },
  audioButton: {
    alignSelf: "flex-start",
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 20,
    color: "#777777", // Color de texto gris
  },
  errorText: {
    color: Colors.light.status.error,
    textAlign: "center",
    marginVertical: 5,
  },
  newCommentContainer: {
    marginTop: 10,
  },
  commentInput: {
    width: "100%",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: Colors.light.button.background,
  },
  cancelButtonText: {
    color: Colors.light.button.text,
  },
  postButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: Colors.light.button.background,
  },
  disabledButton: {
    opacity: 0.5,
  },
  postButtonText: {
    color: Colors.light.button.text,
  },
  disabledButtonText: {
    textAlign: "center",
    fontSize: 16,
    padding: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
}); 