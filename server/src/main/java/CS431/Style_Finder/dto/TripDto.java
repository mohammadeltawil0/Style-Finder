package CS431.Style_Finder.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDto {
    private Long tripId;
    private Long userId;
    private String tripLocation;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<TripDayDto> days;
}