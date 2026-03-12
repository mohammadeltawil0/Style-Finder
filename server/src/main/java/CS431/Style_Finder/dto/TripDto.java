package CS431.Style_Finder.dto;

import lombok.*;

import java.time.LocalDate;

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
}