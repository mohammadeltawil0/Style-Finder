package CS431.Style_Finder.dto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterRequestDto {
    private String location;
    private String event;
    private boolean memory;
}
