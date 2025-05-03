import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import { Tag } from "@/models/tag";
import { TagsList } from "@/components/tags/TagsList";
import StyledInput from "@/components/StyledInput";
import StyledButton from "@/components/StyledButton";
import { InstructionsText } from "@/components/InstructionsText";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/Colors";
import { ActivityIndicator } from "react-native";
interface TagsEditProps {
  onTagsChange: (tags: Tag[]) => void;
  isLoadingTags: boolean;
  allTags: Tag[];
}

export default function TagsEdit({
  onTagsChange,
  isLoadingTags,
  allTags,
}: TagsEditProps) {
  const { t } = useTranslation();
  const [newTagInput, setNewTagInput] = useState("");

  // Seleccionar todas las etiquetas propuestas por defecto
  useEffect(() => {
    if (allTags.length > 0) {
      // Verificar si hay alguna etiqueta seleccionada
      const hasSelectedTags = allTags.some(tag => tag.selected);
      
      // Si no hay etiquetas seleccionadas, seleccionar todas por defecto
      if (!hasSelectedTags) {
        // Actualizar las etiquetas en el componente padre
        const updatedTags = allTags.map(tag => ({
          ...tag,
          selected: true
        }));
        onTagsChange(updatedTags);
      }
    }
  }, [allTags]);

  const handleTagSelect = (tag: Tag) => {
    // Invertir el estado de selección de la etiqueta
    const updatedTags = allTags.map(t => {
      if (t.id === tag.id) {
        return { ...t, selected: !t.selected };
      }
      return t;
    });
    
    // Actualizar el componente padre
    onTagsChange(updatedTags);
  };

  const handleAddCustomTag = () => {
    if (!newTagInput.trim()) return;

    const customTags = newTagInput.split(",").map(t => t.trim()).filter(t => t);
    const newCustomTags: Tag[] = customTags.map(tagName => ({
      id: `custom-${tagName}-${Date.now()}`,
      name: tagName,
      asString: tagName,
      selected: true
    }));

    // Añadir nuevas etiquetas y actualizar el padre
    const updatedTags = [...allTags, ...newCustomTags];
    onTagsChange(updatedTags);
    
    setNewTagInput("");
  };

  return (
    <>
      <ScrollView style={styles.tagListContainer}>
        {/* Tags Section */}
        {isLoadingTags ? (
          <ActivityIndicator size="large" color={Colors.light.activityIndicator} />
        ) : allTags.length > 0 ? (
          <View>
            <InstructionsText>{t("edit.proposedTagsInstructions")}</InstructionsText>
            <TagsList
              tags={allTags}
              onTagPress={handleTagSelect}
            />
          </View>
        ) : null}
      </ScrollView>
      <InstructionsText>{t("edit.additionalTagsInstructions")}</InstructionsText>
      
      {/* Custom Tags Input Section */}
      <View style={styles.customTagsContainer}>
        <StyledInput
          value={newTagInput}
          onChangeText={setNewTagInput}
          multiline={false}
          maxLength={100}
          numberOfLines={1}
          style={styles.customTagInput}
        />
        <StyledButton
          title={t("edit.addTags")}
          onPress={handleAddCustomTag}
          style={styles.addTagButton}
          textStyle={styles.addTagButtonText}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  tagListContainer: {
    marginBottom: 12,
  },
  loadingText: {
    color: Colors.light.text,
    fontSize: 14,
    marginBottom: 12,
  },
  customTagsContainer: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 16,
  },
  customTagInput: {
    width: "100%",
  },
  addTagButton: {
    paddingHorizontal: 16,
    backgroundColor: Colors.light.button.background,
  },
  addTagButtonText: {
    color: Colors.light.button.text,
    fontSize: 14,
  },
}); 