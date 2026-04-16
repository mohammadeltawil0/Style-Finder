import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ThemedView } from "../../../components";
import { apiClient } from "../../../scripts/apiClient";

export default function AdminUserDetail() {
  const { userId } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await apiClient.get(`/api/users/${userId}`);
      setUser(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Account",
      `Permanently delete @${user.username}? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await apiClient.delete(`/api/admin/users/${userId}`);
              Toast.show({ type: "success", text1: "Account Deleted" });
              router.back();
            } catch {
              Toast.show({ type: "error", text1: "Failed to delete account" });
            }
          },
        },
      ],
    );
  };

  if (!user) return null;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile image */}
        {user.profileImageUrl ? (
          <Image
            source={{ uri: user.profileImageUrl }}
            style={styles.profileImg}
          />
        ) : (
          <View style={[styles.profileImg, styles.profilePlaceholder]}>
            <Text style={styles.profileInitial}>
              {user.username[0].toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={[styles.name, { color: colors.text }]}>
          {user.firstName}
        </Text>
        <Text style={[styles.subUsername, { color: colors.text }]}>
          @{user.username}
        </Text>

        {/* Info card */}
        <View style={styles.card}>
          {[
            ["Email", user.email],
            ["Role", user.role],
            [
              "Member since",
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "—",
            ],
          ].map(([label, value]) => (
            <View key={label} style={styles.infoRow}>
              <Text style={styles.label}>{label}</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Delete only */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={18} color="#e53935" />
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 20, paddingTop: 50 },
  profileImg: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  profilePlaceholder: {
    backgroundColor: "#D4B8A8",
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: { fontSize: 36, fontWeight: "bold", color: "#5a3e35" },
  name: { fontSize: 22, fontWeight: "bold" },
  subUsername: { fontSize: 15, opacity: 0.6, marginBottom: 20 },
  card: {
    width: "100%",
    backgroundColor: "#E3D5CA",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#ccc",
  },
  label: { fontSize: 14, color: "#888" },
  value: { fontSize: 14, fontWeight: "500" },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#e53935",
    borderRadius: 12,
    padding: 14,
    backgroundColor: "#E3D5CA",
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#e53935",
    textAlign: "center",
  },
});
