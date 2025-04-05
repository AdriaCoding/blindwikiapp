import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, Text } from "react-native";
import { Tag } from "@/models/tag";
import { TagsList } from "@/components/TagsView";
import StyledInput from "@/components/StyledInput";
import StyledButton from "@/components/StyledButton";
import { InstructionsText } from "@/components/StyledText";
import { useTranslation } from "react-i18next";
import Colors from "@/constants/Colors";

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
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [newTagInput, setNewTagInput] = useState("");

  // Seleccionar todas las etiquetas propuestas por defecto
  useEffect(() => {
    if (allTags.length > 0) {
      setSelectedTagIds(new Set(allTags.map(tag => tag.id)));
    }
  }, [allTags]);

  // Actualizar las etiquetas en el componente padre cuando cambian las seleccionadas
  useEffect(() => {
    // Crear una copia de las etiquetas con la propiedad selected
    const updatedTags = allTags.map(tag => ({
      ...tag,
      selected: selectedTagIds.has(tag.id)
    }));
    
    onTagsChange(updatedTags);
  }, [selectedTagIds, allTags, onTagsChange]);

  const handleTagSelect = (tag: Tag) => {
    setSelectedTagIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag.id)) {
        newSet.delete(tag.id);
      } else {
        newSet.add(tag.id);
      }
      return newSet;
    });
  };

  const handleAddCustomTag = () => {
    if (!newTagInput.trim()) return;

    const customTags = newTagInput.split(",").map(t => t.trim()).filter(t => t);
    const newCustomTags: Tag[] = customTags.map(tagName => ({
      id: `custom-${tagName}-${Date.now()}`,
      name: tagName,
      asString: tagName
    }));

    // Añadir nuevas etiquetas al conjunto
    const updatedTags = [...allTags, ...newCustomTags];
    onTagsChange(updatedTags);
    
    // Seleccionar automáticamente las nuevas etiquetas
    setSelectedTagIds(prev => {
      const newSet = new Set(prev);
      newCustomTags.forEach(tag => newSet.add(tag.id));
      return newSet;
    });

    setNewTagInput("");
  };

  return (
    <>
      <ScrollView style={styles.tagListContainer}>
        {/* Tags Section */}
        {isLoadingTags ? (
          <Text style={styles.loadingText}>{t("edit.loadingTags")}</Text>
        ) : allTags.length > 0 ? (
          <View>
            <InstructionsText>{t("edit.proposedTagsInstructions")}</InstructionsText>
            <TagsList
              tags={allTags}
              selectedTags={allTags.filter(tag => selectedTagIds.has(tag.id))}
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
    height: 40,
    backgroundColor: Colors.light.button.background,
  },
  addTagButtonText: {
    color: Colors.light.button.text,
    fontSize: 14,
  },
}); 