package CS431.Style_Finder.dto;

import lombok.*;
import CS431.Style_Finder.model.enums.Role;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long userId;
    private String firstName;
    private String username;
    private String email;
    private String password;
    private Role role;
    private LocalDateTime createdAt;
}
