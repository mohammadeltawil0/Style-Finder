package CS431.Style_Finder.dto.auth;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequestDto {

    private String firstName;
    private String username;
    private String email;
    private String password;

}