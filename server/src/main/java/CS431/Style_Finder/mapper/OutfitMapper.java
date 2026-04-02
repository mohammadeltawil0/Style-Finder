package CS431.Style_Finder.mapper;

import CS431.Style_Finder.dto.OutfitDto;
import CS431.Style_Finder.dto.OutfitSuggestionDTO;
import CS431.Style_Finder.model.Outfit;
import CS431.Style_Finder.model.OutfitCase;
import CS431.Style_Finder.model.User;
import org.springframework.stereotype.Component;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class OutfitMapper {

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
                .build();
    }

    // New mapper for suggestion dto
    public OutfitSuggestionDTO toDto(OutfitCase outfitCase) {
        OutfitSuggestionDTO dto = new OutfitSuggestionDTO();
        dto.setSuggestionId(UUID.randomUUID().toString());
        dto.setItemIds(outfitCase.getItemIds());
        dto.setScore(100.0);
        dto.setGenerationSource("CBR");
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
