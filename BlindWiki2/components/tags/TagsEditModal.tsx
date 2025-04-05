import React, { useState, useEffect } from "react";
import { Modal, View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Tag } from "@/models/tag";
import TagsEdit from "@/components/tags/TagsEdit";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/Colors";
import StyledButton from "../StyledButton";
import { getProposedTags } from "@/services/tagService";

interface TagsEditModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (tags: Tag[]) => void;
  initialTags?: Tag[];
}

export default function TagsEditModal({
  visible,
  onClose,
  onSave,
  initialTags = [],
}: TagsEditModalProps) {
  const { t } = useTranslation();
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar etiquetas propuestas y combinarlas con las etiquetas iniciales
  useEffect(() => {
    if (visible) {
      const loadTags = async () => {
        setIsLoading(true);
        try {
          // Obtener etiquetas propuestas
          const response = await getProposedTags();
          
          if (response.success) {
            // Marcar como no seleccionadas por defecto
            const proposedTags = response.tags.map(tag => ({
              ...tag,
              selected: false
            }));
            
            // Combinar con las etiquetas iniciales (eliminar duplicados)
            const combinedTags = [...proposedTags];
            
            // Agregar las etiquetas iniciales y marcarlas como seleccionadas
            initialTags.forEach(initialTag => {
              const existingIndex = combinedTags.findIndex(t => t.id === initialTag.id);
              if (existingIndex >= 0) {
                // Si la etiqueta ya existe, marcarla como seleccionada
                combinedTags[existingIndex].selected = true;
              } else {
                // Si no existe, añadirla como seleccionada
                combinedTags.push({
                  ...initialTag,
                  selected: true
                });
              }
            });
            
            setTags(combinedTags);
          }
        } catch (error) {
          console.error("Error loading tags:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadTags();
    }
  }, [visible, initialTags]);

  const handleSave = () => {
    // Filtrar solo las etiquetas seleccionadas para guardar
    const selectedTags = tags.filter(tag => tag.selected);
    onSave(selectedTags);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>{t("edit.tagsLabel")}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <TagsEdit
              allTags={tags}
              onTagsChange={setTags}
              isLoadingTags={isLoading}
            />
          </View>

          <View style={styles.footer}>
            <StyledButton
              title={t("common.cancel")}
              onPress={onClose}
              style={styles.cancelButton}
              textStyle={styles.cancelButtonText}
            />
            <StyledButton
              title={t("common.save")}
              onPress={handleSave}
              style={styles.saveButton}
              textStyle={styles.saveButtonText}
            />
          </View>
        </View>
      </View>
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
  saveButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: Colors.light.button.background,
  },
  saveButtonText: {
    color: Colors.light.button.text,
  },
}); 