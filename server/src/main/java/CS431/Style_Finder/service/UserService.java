package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.UserDto;
import CS431.Style_Finder.dto.auth.LoginResponseDto;

import java.util.List;

public interface UserService {
    UserDto getUserById(Long userId);
    List<UserDto> getAllUsers();
    UserDto updateUser(Long userId, UserDto dto);
    void deleteUser(Long userId);
    LoginResponseDto login(String username, String password);
    LoginResponseDto createUser(UserDto dto);
    Boolean duplicateUsername(String username);
    UserDto getUserByUsername(String username);
    boolean usernameExists(String username);
}