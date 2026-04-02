package CS431.Style_Finder.dto;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilterRequestDTO {
    private String location;
    private String event;
}
