import { View, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";

export const SearchBar = ({ value, onChangeText, onSubmit, placeholder  }) => {
    const theme = useTheme();
    const [localText, setLocalText] = useState(value);
    useEffect(() => {
        const delay = setTimeout(() => {onChangeText(localText); }, 300);
        return () => clearTimeout(delay);
    }, [localText]);

    //TO DO: implement search backend/api here!
    const typeMap = {
        tops: "TOP",
        bottoms: "BOTTOM",
        dresses: "DRESS",
        outerwear: "OUTERWEAR",
    };
    const fetchFilteredItems = async () => {
        if (!userId) return [];

        const response = await apiClient.get("/api/items/filter", {
            params: {
            userId,
            search: searchText || null,
            type:
                category !== "all" ? typeMap[category] : null
            },
        });
        return response.data;
    };

    return (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.lightBrown,
            // borderWidth: 1,
            // borderColor: theme.colors.border,
            borderRadius: 10,
            marginHorizontal: 30,
            marginTop: 30
        }}>
            <Ionicons style={{ padding: 10 }} name="search" size={20} color="#7F5539" />
            <TextInput
                style={{
                    color: '#424242',
                    fontFamily: theme.fonts.regular,
                    flex: 1,
                    height: 50,
                    paddingTop: 10,
                    paddingRight: 10,
                    paddingBottom: 10,
                    paddingLeft: 0,
                    width: "100%",
                }}
                placeholder={placeholder}
                value={localText}
                onChangeText={setLocalText}
                onSubmitEditing={onSubmit}
                underlineColorAndroid="transparent"
            />
        </View >
    );
};
