package CS431.Style_Finder.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SharedOutfitDto {

    private String shareLink;   
    private String token;       // optional (for debugging)
    private Long outfitId;

}