package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.UserDto;

import java.util.List;

public interface UserService {
    UserDto createUser(UserDto dto);
    UserDto getUserById(Long userId);
    List<UserDto> getAllUsers();
    UserDto updateUser(Long userId, UserDto dto);
    void deleteUser(Long userId);
    UserDto login(String username, String password);
    boolean usernameExists(String username);
}