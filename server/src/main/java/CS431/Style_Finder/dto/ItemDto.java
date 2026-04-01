package CS431.Style_Finder.dto;

import java.util.regex.Pattern;

import CS431.Style_Finder.model.enums.Fit;
import CS431.Style_Finder.model.enums.Formality;
import CS431.Style_Finder.model.enums.ItemType;
import CS431.Style_Finder.model.enums.Season;
import CS431.Style_Finder.model.enums.PatternType;
import CS431.Style_Finder.model.enums.LengthType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemDto {
    private Long itemId;
    private Long userId;
    private ItemType type;
    private String color;
    private PatternType pattern;
    private LengthType length;
    private Integer material;
    private Integer bulk;
    private Season seasonWear;
    private Formality formality;
    private Fit fit;
    private Integer timesWorn;
    private String imageUrl;
}