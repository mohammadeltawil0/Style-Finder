package CS431.Style_Finder.mapper;

import CS431.Style_Finder.dto.ItemDto;
import CS431.Style_Finder.model.Item;
import CS431.Style_Finder.model.User;
import org.springframework.stereotype.Component;
import CS431.Style_Finder.model.enums.Fit;
import CS431.Style_Finder.model.enums.Formality;
import CS431.Style_Finder.model.enums.ItemType;
import CS431.Style_Finder.model.enums.Season;
import CS431.Style_Finder.model.enums.PatternType;
import CS431.Style_Finder.model.enums.LengthType;


@Component
public class ItemMapper {

    public ItemDto toDto(Item item) {
        return ItemDto.builder()
                .itemId(item.getItemId())
                .userId(item.getUser().getUserId())
                .type(item.getType())
                .color(item.getColor())
                .pattern(item.getPattern())
                .length(item.getLength())
                .material(item.getMaterial())
                .bulk(item.getBulk())
                .seasonWear(item.getSeasonWear())
                .formality(item.getFormality())
                .fit(item.getFit())
                .timesWorn(item.getTimesWorn())
                .imageUrl(item.getImageUrl())
                .build();
    }

    public Item toEntity(ItemDto dto, User user) {
        return Item.builder()
                .itemId(dto.getItemId())
                .user(user)
                .type(dto.getType())
                .color(dto.getColor())
                .pattern(dto.getPattern())
                .length(dto.getLength())
                .material(dto.getMaterial())
                .bulk(dto.getBulk())
                .seasonWear(dto.getSeasonWear())
                .formality(dto.getFormality())
                .fit(dto.getFit())
                .timesWorn(dto.getTimesWorn())
                .imageUrl(dto.getImageUrl())
                .build();
    }
}
