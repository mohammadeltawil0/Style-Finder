import { useState, useEffect, useCallback } from "react";
import {
  View, Text, TextInput, FlatList,
  TouchableOpacity, Image, StyleSheet
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedView } from "../../../components";
import { apiClient } from "../../../scripts/apiClient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@react-navigation/native";

export default function AdminUsers() {
  const router = useRouter();
  const { colors } = useTheme();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [search, setSearch] = useState("");
  const [adminImage, setAdminImage] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");


  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem("name");
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedName) {
          setName(storedName);
        }
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
      loadAdminImage();
    }, [])
  );

  const loadAdminImage = async () => {
    const img = await AsyncStorage.getItem("profileImageUrl");
    setAdminImage(img || "");
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const [storedUserId, storedUsername] = await Promise.all([
        AsyncStorage.getItem("userId"),
        AsyncStorage.getItem("username"),
      ]);
      const parsedCurrentUserId = Number(storedUserId);
      const currentUsername = (storedUsername || "").toLowerCase();

      const res = await apiClient.get("/api/admin/users");
      const visibleUsers = (res.data || []).filter((u) => {
        const isCurrentUser =
          (Number.isInteger(parsedCurrentUserId) && u.userId === parsedCurrentUserId) ||
          (u.username || "").toLowerCase() === currentUsername;
        const isAdminRole = (u.role || "").toUpperCase() === "ADMIN";
        return !isCurrentUser && !isAdminRole;
      });

      setUsers(visibleUsers);
      setFiltered(visibleUsers);
    } catch (e) {
      console.error(e);
      setUsers([]);
      setFiltered([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    if (!text) return setFiltered(users);
    setFiltered(
      users.filter(u => u.username.toLowerCase().includes(text.toLowerCase()))
    );
  };

  const handleOpenUserDetail = (userId) => {
    // Clear search before navigating so the list is reset when admin returns.
    setSearch("");
    setFiltered(users);
    router.push({
      pathname: "/settings/adminFolder/adminUserDetail",
      params: { userId }
    });
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => handleOpenUserDetail(item.userId)}
    >
      {item.profileImageUrl
        ? <Image source={{ uri: item.profileImageUrl }} style={styles.avatar} />
        : <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarInitial}>{item.username[0].toUpperCase()}</Text>
          </View>
      }
      <Text style={[styles.username, { color: colors.text }]}>{item.username}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.text} style={{ opacity: 0.4 }} />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}> Welcome, {name}!! </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
        <Ionicons name="search-outline" size={18} color={colors.text} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search users via username"
          placeholderTextColor="#999"
          value={search}
          onChangeText={handleSearch}
          style={{ flex: 1, color: colors.text, fontSize: 14 }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.userId)}
        renderItem={renderUser}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 40 }}>
            {isLoadingUsers ? "Loading..." : "No users found."}
          </Text>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", padding: 16, paddingTop: 50,
  },
  headerTitle: { fontSize: 30, fontWeight: "bold", marginBottom:"5%",},
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  searchBar: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginBottom: 8,
    borderRadius: 10, padding: 10,
  },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 0.5, borderColor: "#ddd",
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  avatarPlaceholder: {
    backgroundColor: "#D4B8A8",
    justifyContent: "center", alignItems: "center",
  },
  avatarInitial: { fontWeight: "bold", color: "#5a3e35" },
  username: { flex: 1, fontSize: 15 },
});