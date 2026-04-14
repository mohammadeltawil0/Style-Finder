import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "./themed-text";
import ProfilePic from "./profile-pic";
import { FontAwesome } from '@expo/vector-icons';

export const CustomHeader = ({ page }) => {
  const theme = useTheme();
  const router = useRouter();

  const hideSettingsIcon =
    page === "Profile" ||
    page === "logIn" ||
    page === "register" ||
    page === "add-item" ||
    page === "survey" ||
    page === "EditProfile" ||
    page === "UpdatePassword";


  return (
    <SafeAreaView style={{ flex: 0, backgroundColor: page === "Profile" || page === "EditProfile" || page === "UpdatePassword" ? theme.colors.background : theme.colors.card }}>
      <View
        style={{
          backgroundColor: page === "Profile" || page === "EditProfile" || page === "UpdatePassword" ? theme.colors.background : theme.colors.card,
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 30,
        }}
      >
        <View
          className="logo-title"
          style={{
            flexDirection: "row",
            gap: 10,
            alignItems: "center",
          }}
        >
          {page === "home" && (
            <>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                HOME
              </ThemedText>
            </>
          )}
          {page === "closet" && (
            <ThemedText
              style={{
                fontSize: theme.sizes.h2,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            >
              CLOSET
            </ThemedText>
          )}
          {page === "recommendations" && (
            <ThemedText
              style={{
                fontSize: theme.sizes.h2,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            >
              GENERATE OUTFITS
            </ThemedText>
          )}
          {page === "add-item" && (
            <View style={{ flexDirection: "row", gap: 20, alignItems: "center" }}>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                ADD ITEM
              </ThemedText>
            </View>
          )}
          {page === "logIn" && (
            <ThemedText
              style={{
                fontSize: theme.sizes.h2,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            >
              LOG-IN
            </ThemedText>
          )}
          {page === "register" && (
            <ThemedText
              style={{
                fontSize: theme.sizes.h2,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            >
              SIGN UP
            </ThemedText>
          )}
          {page === "Profile" && (
            <>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                  marginLeft: 10
                }}
              >
                MANAGE ACCOUNT
              </ThemedText>
            </>
          )}
          {page === "AdditionalConstraints" && (
            <>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                GENERATE OUTFITS
              </ThemedText>
            </>
          )}
          {page === "OutfitswaitingScreen" && (
            <>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                Generating Outfits...
              </ThemedText>
            </>
          )}
          {page === "RegularOutfitDetail" && (
            <>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                Regular Outfit Details
              </ThemedText>
            </>
          )}
          {page === "TripOutfitDetail" && (
            <>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                Trip Outfit Details
              </ThemedText>
            </>
          )}
          {page === "survey" && (
            <>
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                PREFERENCE SURVEY
              </ThemedText>
            </>
          )}
          {page === "EditProfile" && (
            <>
              <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                EDIT ACCOUNT
              </ThemedText>
            </>
          )}
          {page === "UpdatePassword" && (
            <>
              <TouchableOpacity onPress={() => router.replace("/settings/Profile")}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                Back
              </ThemedText>
            </>
          )}
        </View>
        {!hideSettingsIcon && (
          <ProfilePic
            onPress={() => router.push("/settings/Profile")}
            style={{
              borderColor: theme.colors.text,
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};
