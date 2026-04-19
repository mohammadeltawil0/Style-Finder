import React from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, ThemedView } from "../../components";

export default function Settings(){
    const router = useRouter();

    return(
        <>
        <ThemedView
            gradient={true}
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <ThemedText style={{fontSize: 30, fontWeight: 'bold', marginBottom: 60, fontFamily: 'Helvetica'}}> Settings</ThemedText>
     
            <TouchableOpacity
                // TODO: once we have survey page then just link 
                onPress={() => router.replace("/screens/survey/preferences1")}
                activeOpacity={0.7}
                style={{
                backgroundColor: "#B49480",
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#B49480",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 40,
                marginBottom: 100,
                width: '70%'
                }}
            >
                <ThemedText style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Helvetica' }}> Survey </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
                // TODO: once we have login page ready then just link here
                onPress={() => router.replace("/")}
                activeOpacity={0.7}
                style={{
                backgroundColor: "#B49480",
                borderRadius: 12,
                borderWidth: 2,
                borderColor: "#B49480",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 40,
                width: '70%'
                }}
            >
                <ThemedText style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'Helvetica' }}> Log Out </ThemedText>
            </TouchableOpacity>
            
        </ThemedView>  
        </>
    );
}