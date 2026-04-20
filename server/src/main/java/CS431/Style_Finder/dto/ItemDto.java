package CS431.Style_Finder.dto;

import CS431.Style_Finder.model.enums.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDto {
    private Long itemId; // test
    private Long userId;
    private ItemType type;
    private String color;
    private PatternType pattern;
    private LengthType length;
    private MaterialType material;
    private Double bulk;
    private Season seasonWear;
    private Formality formality;
    private Fit fit;
    private Integer timesWorn;
    private String imageUrl;
}