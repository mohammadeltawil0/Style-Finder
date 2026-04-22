
import { useLocalSearchParams, useRouter } from "expo-router";
import EditItemsModal from "../closet/edit-items-modal";
import { useCallback, useEffect } from "react";

export default function EditItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // The item is passed as a JSON string in the route params
  let item = null;
  try {
    if (params.item) {
      item = JSON.parse(params.item);
    }
  } catch (e) {
    item = null;
  }

  // When modal closes, go back
  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <EditItemsModal item={item} setModalVisible={handleClose} isEditing={true} />
  );
}
