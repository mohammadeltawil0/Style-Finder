package CS431.Style_Finder.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreferenceDto {
    private Long preferenceId;
    private Long userId;
    private String colorOftenWear;
    private String preferFit;
    private String fabricPrefer;
    private String outfitNeedMost;
    private String gender;
}