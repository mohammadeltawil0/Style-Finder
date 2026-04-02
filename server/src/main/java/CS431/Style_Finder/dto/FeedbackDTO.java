package CS431.Style_Finder.dto;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDTO {
    private Long userId;
    private String suggestionId;
    private List<Long> originalItemIds;
    private List<Long> finalItemIds;
    private String action; // SAVE, EDIT_SAVE, REJECT
    private int contextTemp;
    private String contextOccasion;
}
