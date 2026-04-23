package CS431.Style_Finder.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripShareDto {

    private Long tripId;
    private String tripLocation;
    private String shareLink;
    private String token;

    private List<TripDayDto> days;
}