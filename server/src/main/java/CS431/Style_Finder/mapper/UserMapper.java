package CS431.Style_Finder.mapper;

import CS431.Style_Finder.dto.UserDto;
import CS431.Style_Finder.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserDto toDto(User user) {
        return UserDto.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .username(user.getUsername())
                .email(user.getEmail())
                .password(user.getPassword())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public User toEntity(UserDto dto) {
        return User.builder()
                .userId(dto.getUserId())
                .firstName(dto.getFirstName())
                .username(dto.getUsername())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .role(dto.getRole())
                .build();
    }
}