package CS431.Style_Finder.dto;
import java.util.List;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeedbackDto {
    private Long userId;
    private String suggestionId;
    private List<Long> originalItemIds;
    private List<Long> finalItemIds;
    private String action; // SAVE, EDIT_FEEDBACK, REJECT
    private int contextTemp;
    private String contextOccasion;
}