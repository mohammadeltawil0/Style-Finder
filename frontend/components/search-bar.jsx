import { View, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from "@react-navigation/native";

export const SearchBar = ({ value, onChangeText, onSubmit }) => {
    const theme = useTheme();

    //TO DO: implement search backend/api here!

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
                placeholder="Search items inventory..."
                value={value}
                onChangeText={onChangeText}
                onSubmitEditing={onSubmit}
                underlineColorAndroid="transparent"
            />
        </View >
    );
};
