package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.OutfitItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OutfitItemRepository extends JpaRepository<OutfitItem, Long> {
    long deleteByItem_ItemId(Long itemId);

    // NEW: find all join rows for an item so we can get the outfit IDs
    List<OutfitItem> findByItem_ItemId(Long itemId);
    // NEW: delete all join rows for a whole outfit before deleting the outfit
    void deleteByOutfit_OutfitId(Long outfitId);
}