package CS431.Style_Finder.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitDto {
    private Long outfitId;
    private Long userId;
    private Boolean saved;
    private String comments;
    private LocalDateTime createdAt;
    private List<Long> itemIds;
    private List<String> imageUrls;
    private String coverImageUrl;
}