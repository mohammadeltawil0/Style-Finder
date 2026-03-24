import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import { ThemedText, ThemedView, TogglePreview } from "../../components";
import { theme } from "../../constants";
import { useRouter } from "expo-router";

export default function ReviewPage({ setPage, uri, event, pattern, color, category }) {
    const { isWide } = useWindowDimensions();
    const isWeb = Platform.OS === "web";
    const buttonWidth = isWide ? 220 : "30%";
    const router = useRouter();

    const handleSubmit = () => {
        // TO DO: submit to backend, and navigate to inventory page!
        router.push({
            pathname: "/closet",
            params: { tab: "inventory" }
        });
    }

    return (
        <ThemedView gradient={true} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    isWide && styles.scrollContentWide,
                ]}
                keyboardShouldPersistTaps="handled"
            >
                <View
                    style={[
                        styles.contentContainer,
                        uri && styles.contentContainerWithPreview,
                    ]}
                >

                    <View
                        className="mainContent"
                        style={styles.mainContent}
                    >
                        <View
                            className="question"
                            style={[
                                styles.textBlock,
                                !uri && styles.textBlockNoImage,
                                isWide && styles.textBlockWide,
                            ]}
                        >
                            <ThemedText
                                style={{
                                    fontSize: theme.sizes.h1,
                                    color: theme.colors.text,
                                    fontFamily: theme.fonts.bold,
                                    alignText: "flex-start",
                                }}
                            >
                                Review Your Response
                            </ThemedText>
                        </View>

                        {uri && (<Image
                            source={{ uri }}
                            contentFit="contain"
                            style={{ width: "100%", height: 400 }}
                            onError={() => setImageFailed(true)}
                        />)}

                        <ThemedText>
                            Category: {category}
                        </ThemedText>
                        <ThemedText>
                            Pattern: {pattern}
                        </ThemedText>
                        {/* TO DO: add color look! */}
                        {color && (
                            <ThemedText>
                                Color: {color}
                            </ThemedText>
                        )}
                        <ThemedText>
                            Event: {event}
                        </ThemedText>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.navigationButtons}>
                <Pressable
                    onPress={() => setPage(4)}
                    //TO DO: if next is not visible, make this flex-start or figure it out
                    style={{
                        backgroundColor: theme.colors.card,
                        borderRadius: 10,
                        padding: 10,
                        width: "35%",
                    }}
                >
                    <ThemedText style={{ textAlign: "center" }}>Back</ThemedText>
                </Pressable>
                {event && (
                    <Pressable
                        style={{
                            backgroundColor: theme.colors.card,
                            borderRadius: 10,
                            padding: 10,
                            width: "35%",
                        }}
                        onPress={() => handleSubmit()}
                    >
                        <ThemedText style={{ textAlign: "center" }}>Submit</ThemedText>
                    </Pressable>
                )}
            </View>
        </ThemedView>
    )
}

const styles = {
    navigationButtons: {
        alignItems: "center",
        flexDirection: "row",
        gap: 40,
        justifyContent: "center",
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 30,
        width: "100%",
        flexWrap: "wrap",
    },
    navigationButtonsWeb: {
        paddingBottom: 28,
        marginLeft: 10
    },
    navigationButtonsSingle: {
        justifyContent: "center",
    },
    togglePreviewContainer: {
        position: "relative",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    scrollView: {
        flex: 1,
        width: "100%",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    scrollContentWide: {
        alignItems: "center",
    },
    contentContainer: {
        width: "100%",
        maxWidth: 700,
        alignSelf: "center",
        justifyContent: "center",
        gap: 8,
        position: "relative",
    },
    contentContainerWithPreview: {
        paddingTop: 90,
    },
    mainContent: {
        justifyContent: "center",
        paddingBottom: 16,
    },
    textBlock: {
        paddingBottom: 20,
        zIndex: 1,
    },
    textBlockNoImage: {
        marginTop: 8,
    },
    textBlockWide: {
        paddingHorizontal: 0,
    },
}