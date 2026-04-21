package CS431.Style_Finder.mapper;

import CS431.Style_Finder.dto.OutfitDto;
import CS431.Style_Finder.dto.OutfitSuggestionDto;
import CS431.Style_Finder.model.*;
import CS431.Style_Finder.repository.ItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OutfitMapper {

    private final ItemRepository itemRepository;

    private String coverImageUrl(Outfit outfit){
        String coverUrl = null;

        if (outfit.getOutfitItems() != null) {
            for (OutfitItem item : outfit.getOutfitItems()) {
                if ("FULL_BODY".equals(item.getItem().getType().name())) {
                    coverUrl = item.getItem().getImageUrl();
                    break;
                }
                else if ("TOP".equals(item.getItem().getType().name()) && coverUrl == null) {
                    coverUrl = item.getItem().getImageUrl();
                }
                else if (coverUrl == null && item.getItem().getImageUrl() != null) {
                    coverUrl = item.getItem().getImageUrl();
                }
            }
        }

        return coverUrl;
    }

    private String coverImageUrlFromIds(List<Long> itemIds) {
        if (itemIds == null || itemIds.isEmpty()) return null;

        // Fetch the full Item objects from the database using their IDs
        List<Item> items = itemRepository.findAllById(itemIds);
        String coverUrl = null;

        for (Item item : items) {
            if ("FULL_BODY".equals(item.getType().name())) {
                coverUrl = item.getImageUrl();
                break;
            }
            else if ("TOP".equals(item.getType().name()) && coverUrl == null) {
                coverUrl = item.getImageUrl();
            }
            else if (coverUrl == null && item.getImageUrl() != null) {
                coverUrl = item.getImageUrl();
            }
        }
        return coverUrl;
    }

    public OutfitDto toDto(Outfit outfit) {
        List<Long> itemIds = outfit.getOutfitItems() == null
                ? Collections.emptyList()
                : outfit.getOutfitItems().stream()
                .map(oi -> oi.getItem().getItemId())
                .collect(Collectors.toList());


        return OutfitDto.builder()
                .outfitId(outfit.getOutfitId())
                .userId(outfit.getUser().getUserId())
                .saved(outfit.getSaved())
                .comments(outfit.getComments())
                .createdAt(outfit.getCreatedAt())
                .itemIds(itemIds)
                .coverImageUrl(coverImageUrl(outfit))
                .build();
    }

    // New mapper for suggestion dto
    public OutfitSuggestionDto toDto(OutfitCase outfitCase) {
        OutfitSuggestionDto dto = new OutfitSuggestionDto();
        dto.setSuggestionId(UUID.randomUUID().toString());
        dto.setItemIds(outfitCase.getItemIds());
        dto.setScore(100.0);
        dto.setGenerationSource("CBR");
        dto.setCoverImageUrl(coverImageUrlFromIds(outfitCase.getItemIds()));
        return dto;
    }

    public Outfit toEntity(OutfitDto dto, User user) {
        return Outfit.builder()
                .outfitId(dto.getOutfitId())
                .user(user)
                .saved(dto.getSaved() != null ? dto.getSaved() : false)
                .comments(dto.getComments())
                .build();
    }
}
