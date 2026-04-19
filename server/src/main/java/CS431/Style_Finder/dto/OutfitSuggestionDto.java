package CS431.Style_Finder.dto;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitSuggestionDto {
    private String suggestionId;
    private List<Long> itemIds;
    private double score;
    private String generationSource;
}
