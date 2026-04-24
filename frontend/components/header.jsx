import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "@react-navigation/native";
import { useGlobalSearchParams, useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ProfilePic from "./profile-pic";
import { ThemedText } from "./themed-text";

export const CustomHeader = ({ page }) => {
  const theme = useTheme();
  const router = useRouter();
  const params = useGlobalSearchParams();
  const isNewUserSurveyFlow = params?.isNewUser === "true";

  const hideSettingsIcon =
    page === "Profile" ||
    page === "logIn" ||
    page === "register" ||
    page === "add-item" ||
    page === "Item" ||
    page === "survey" ||
    page === "EditProfile" ||
    page === "UpdatePassword" ||
    page === "adminSettings" ||
    page === "AdminChangePassword" ||
    page === "adminwelcomepage" ||
    page === "adminEditProfile" ||
    page === "adminUserDetail";

  const handleProfilePress = async () => {
    const role = await AsyncStorage.getItem("role");
    if (role === "ADMIN") {
      router.push("/settings/adminFolder/adminSettings");
      return;
    }
    router.push("/settings/Profile");
  };

  const handleSafeBack = (fallbackRoute = "/(tabs)") => {
    if (typeof router.canGoBack === "function" && router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallbackRoute);
  };

  return (
    <SafeAreaView
      style={{
        flex: 0,
        backgroundColor:
          page === "Profile" || page === "adminSettings"
            ? theme.colors.background
            : theme.colors.card,
        shadowColor: theme.colors.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
      }}
    >
      <View
        style={{
          backgroundColor:
            page === "Profile" || page == "adminSettings"
              ? theme.colors.background
              : theme.colors.card,
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
            <View
              style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
            >
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
                  marginLeft: 10,
                }}
              >
                MANAGE ACCOUNT
              </ThemedText>
            </>
          )}
          {page === "AdminPortal" && (
            <ThemedText
              style={{
                fontSize: theme.sizes.h2,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            >
              ADMIN PORTAL
            </ThemedText>
          )}
          {page === "adminSettings" && (
            <>
              <TouchableOpacity
                onPress={() =>
                  router.replace("/settings/adminFolder/adminUsers")
                }
              >
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
                MANAGE ADMIN
              </ThemedText>
            </>
          )}
          {page === "adminEditProfile" && (
            <>
              <TouchableOpacity
                onPress={() =>
                  router.replace("/settings/adminFolder/adminSettings")
                }
              >
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
          {page === "AdminChangePassword" && (
            <>
              <TouchableOpacity
                onPress={() =>
                  router.replace("/settings/adminFolder/adminSettings")
                }
              >
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
                BACK
              </ThemedText>
            </>
          )}
          {page === "adminwelcomepage" && (
            <ThemedText
              style={{
                fontSize: theme.sizes.h2,
                fontFamily: theme.fonts.bold,
                color: theme.colors.text,
              }}
            >
              ADMIN WELCOME PAGE
            </ThemedText>
          )}
          {page === "adminUserDetail" && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <TouchableOpacity
                onPress={() => router.back()}
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={theme.colors.text}
                />
                <ThemedText
                  style={{
                    fontSize: theme.sizes.h3,
                    fontFamily: theme.fonts.bold,
                    color: theme.colors.text,
                  }}
                >
                  BACK
                </ThemedText>
              </TouchableOpacity>
            </View>
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
                GENERATING OUTFITS...
              </ThemedText>
            </>
          )}
          {page === "item-details-modal" && (
            <>
              <ThemedText
                style={{
                  fontSize: theme.sizes.h2,
                  fontFamily: theme.fonts.bold,
                  color: theme.colors.text,
                }}
              >
                ITEM DETAILS
              </ThemedText>
            </>
          )}
          {page === "OutfitDetail" && (
            <>
              <TouchableOpacity
                onPress={() =>
                  router.replace({
                    pathname: "/(tabs)/closet",
                    params: { tab: "outfits" },
                  })
                }
              >
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
                OUTFIT DETAILS
              </ThemedText>
            </>
          )}
          {/* {page === "RegularOutfitDetail" && (
            <>
              <TouchableOpacity
                onPress={() =>
                  router.replace({
                    pathname: "/(tabs)/closet",
                    params: { tab: "outfits" },
                  })
                }
              >
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
                REGULAR OUTFIT DETAILS
              </ThemedText>
            </>
          )} */}
          {/* {page === "TripOutfitDetail" && (
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
                TRIP OUTFIT DETAILS
              </ThemedText>
            </>
          )} */}
          {page === "Item" && (
            <>
              <TouchableOpacity
                onPress={() => {
                  const parentOutfitId = params?.outfitId;
                  const parentItemIndex = params?.itemIndex;

                  if (parentOutfitId) {
                    router.replace({
                      pathname: "/closet/outfitsHistory/itemProperty",
                      params: {
                        outfitId: String(parentOutfitId),
                        isOutfit: "true",
                        itemIndex:
                          parentItemIndex !== undefined
                            ? String(parentItemIndex)
                            : "0",
                      },
                    });
                    return;
                  }

                  router.replace({
                    pathname: "/(tabs)/closet",
                    params: { tab: "outfits" },
                  });
                }}
              >
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
                ITEM
              </ThemedText>
            </>
          )}
          {page === "survey" && (
            <>
              {!isNewUserSurveyFlow && (
                <TouchableOpacity
                  onPress={() => handleSafeBack("/settings/Profile")}
                >
                  <Ionicons
                    name="arrow-back"
                    size={24}
                    color={theme.colors.text}
                  />
                </TouchableOpacity>
              )}
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
                EDIT ACCOUNT
              </ThemedText>
            </>
          )}
          {page === "UpdatePassword" && (
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
                BACK
              </ThemedText>
            </>
          )}
        </View>
        {!hideSettingsIcon && (
          <TouchableOpacity onPress={handleProfilePress}>
            <ProfilePic
              style={{ borderColor: theme.colors.text, width: 36, height: 36 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};
