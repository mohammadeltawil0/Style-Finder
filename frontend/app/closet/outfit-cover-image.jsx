import { useQuery } from "@tanstack/react-query";
import { Image, View } from "react-native";
import { apiClient } from "../../scripts/apiClient";

const normalizeImageUrl = (item) => item?.imageUrl || item?.image_url || null;

export default function OutfitCoverImage({ imageUrls = [], itemIds = [], height = 120 }) {
  const providedUrls = (Array.isArray(imageUrls) ? imageUrls : [])
    .filter((url) => typeof url === "string" && url.trim().length > 0)
    .slice(0, 3);

  const shouldFetchByItemIds = providedUrls.length === 0 && Array.isArray(itemIds) && itemIds.length > 0;

  const { data: fetchedUrls = [], isLoading } = useQuery({
    queryKey: ["outfit-cover-images", itemIds],
    enabled: shouldFetchByItemIds,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const responses = await Promise.allSettled(
        itemIds.map((id) => apiClient.get(`/api/items/${id}`)),
      );

      return responses
        .filter((result) => result.status === "fulfilled")
        .map((result) => normalizeImageUrl(result.value?.data))
        .filter((url) => typeof url === "string" && url.trim().length > 0)
        .slice(0, 3);
    },
  });

  const urls = (providedUrls.length > 0 ? providedUrls : fetchedUrls).slice(0, 3);

  if (isLoading && shouldFetchByItemIds) {
    return (
      <View style={{
        width: "100%",
        height,
        borderRadius: 10,
        backgroundColor: "#e8ddd7",  // slightly different shade = loading feel
      }} />
    );
  }

  if (urls.length === 0) {
    return (
      <View
        style={{
          width: "100%",
          height,
          borderRadius: 10,
          backgroundColor: "#efe6df",
        }}
      >
      </View>
    );
  }

  if (urls.length === 1) {
    return (
      <View style={{ width: "100%", height, borderRadius: 10, overflow: "hidden" }}>
        <Image source={{ uri: urls[0] }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      </View>
    );
  }

  if (urls.length === 2) {
    return (
      <View style={{ width: "100%", height, borderRadius: 10, overflow: "hidden", flexDirection: "row" }}>
        <Image source={{ uri: urls[0] }} style={{ width: "50%", height: "100%" }} resizeMode="cover" />
        <Image source={{ uri: urls[1] }} style={{ width: "50%", height: "100%" }} resizeMode="cover" />
      </View>
    );
  }

  return (
    <View style={{ width: "100%", height, borderRadius: 10, overflow: "hidden", flexDirection: "row" }}>
      <Image source={{ uri: urls[0] }} style={{ width: "58%", height: "100%" }} resizeMode="cover" />
      <View style={{ width: "42%", height: "100%" }}>
        <Image source={{ uri: urls[1] }} style={{ width: "100%", height: "50%" }} resizeMode="cover" />
        <Image source={{ uri: urls[2] }} style={{ width: "100%", height: "50%" }} resizeMode="cover" />
      </View>
    </View>
  );
}