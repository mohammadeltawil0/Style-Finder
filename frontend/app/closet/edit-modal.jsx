import { Modal, Pressable, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { ThemedText } from "../../components";
import { useEffect, useState } from "react";

export default function EditModal({
    modalVisible,
    setModalVisible,
    value,
    onSelect,
    options,
    title,
    isSaving = false,
}) {
    const [localValue, setLocalValue] = useState(value);
    const theme = useTheme();
    
    useEffect(() => {
        if (modalVisible) {
            setLocalValue(value);
        }
    }, [modalVisible, value]);
    const resolvedOptions = Array.isArray(options)
        ? options
            .map((option) => {
                if (typeof option === "string") {
                    return { label: option, value: option };
                }

                if (option && typeof option === "object") {
                    return {
                        label: option.label ?? String(option.value ?? ""),
                        value: option.value,
                    };
                }

                return null;
            })
            .filter((option) => option && option.value) : [];

    return (
        <Modal
            animationType="fade"
            transparent
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
        >
            <View
                style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.35)",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 24,
                }}
            >
                <View
                    style={{
                        width: "100%",
                        borderRadius: 12,
                        backgroundColor: theme.colors.card,
                        padding: 20,
                        gap: 10,
                    }}
                >
                    <ThemedText
                        style={{
                            fontSize: theme.sizes.h2,
                            marginBottom: 4,
                            fontFamily: theme.fonts.bold,
                        }}
                    >
                        {title}
                    </ThemedText>

                    {resolvedOptions.map((option) => {
                        const selected = localValue === option.value;
                        return (
                            <Pressable
                                key={option.value}
                                onPress={() => {
                                    setLocalValue(option.value);
                                }}
                                disabled={isSaving}
                                style={{
                                    borderRadius: 10,
                                    paddingVertical: 12,
                                    paddingHorizontal: 14,
                                    backgroundColor: selected
                                        ? theme.colors.tabIconSelected
                                        : theme.colors.lightBrown,
                                }}
                            >
                                <ThemedText
                                    style={{
                                        color: theme.colors.text,
                                    }}
                                >
                                    {option.label}
                                </ThemedText>
                            </Pressable>
                        );
                    })}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                        <Pressable
                            onPress={() => {
                                setLocalValue(value);
                                setModalVisible(false);
                            }}
                            disabled={isSaving}
                            style={{
                                marginTop: 4,
                                borderRadius: 10,
                                paddingVertical: 12,
                                alignItems: "center",
                                backgroundColor: theme.colors.transparent,
                                opacity: isSaving ? 0.6 : 1,
                                width: "40%",
                                borderWidth: 2,
                                borderColor: theme.colors.text,
                            }}
                        >
                            <ThemedText style={{ fontFamily: theme.fonts.bold }}>
                                Cancel
                            </ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={() => {
                                onSelect(localValue);
                                setModalVisible(false);
                            }}
                            disabled={isSaving}
                            style={{
                                marginTop: 4,
                                borderRadius: 10,
                                paddingVertical: 12,
                                alignItems: "center",
                                opacity: isSaving ? 0.6 : 1,
                                width: "40%",
                                borderWidth: 2,
                                borderColor: theme.colors.text,
                            }}
                        >
                            <ThemedText style={{ fontFamily: theme.fonts.bold }}>
                                Save
                            </ThemedText>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}