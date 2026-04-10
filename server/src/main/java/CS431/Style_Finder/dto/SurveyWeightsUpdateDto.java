package CS431.Style_Finder.dto;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveyWeightsUpdateDto {
    private Long userId;
    private String comfort;
    private List<String> occasion;
    private String weather;
    private List<String> style;
    private String preferFit;
    private List<String> items;
    private List<String> avoidItems;
    private List<String> colorsWear;
    private List<String> colorsAvoid;
    private String tripPriority;
}
