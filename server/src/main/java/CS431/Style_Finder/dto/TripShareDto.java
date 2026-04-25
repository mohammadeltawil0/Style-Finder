package CS431.Style_Finder.dto;

import lombok.*;
import java.util.List;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripShareDto {
    private String tripLocation;  
    private LocalDate startDate;    
    private LocalDate endDate;      
    private List<TripDayDto> days;  
    private String shareLink;
    private String token; 
}