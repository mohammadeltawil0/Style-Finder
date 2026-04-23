package CS431.Style_Finder.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDayDto {

    private LocalDate date;
    private OutfitDto outfit;
}