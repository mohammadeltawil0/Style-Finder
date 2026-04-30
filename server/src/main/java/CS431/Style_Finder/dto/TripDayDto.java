package CS431.Style_Finder.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripDayDto {
    private LocalDate date;
    private List<OutfitSuggestionDto> outfits;
    private List<String> imageUrls;

    public TripDayDto(LocalDate date, List<OutfitSuggestionDto> value) {
        this.date = date;
        this.outfits = value;
    }
}