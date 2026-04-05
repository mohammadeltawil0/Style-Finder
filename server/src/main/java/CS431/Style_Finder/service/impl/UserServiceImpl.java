package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.UserDto;
import CS431.Style_Finder.exception.DuplicateUsernameException;
import CS431.Style_Finder.exception.InvalidUserDataException;
import CS431.Style_Finder.exception.ResourceNotFoundException;
import CS431.Style_Finder.exception.UserCreationException;
import CS431.Style_Finder.mapper.UserMapper;
import CS431.Style_Finder.model.User;
import CS431.Style_Finder.repository.UserRepository;
import CS431.Style_Finder.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserDto createUser(UserDto dto) {
        if (dto == null) {
            throw new InvalidUserDataException("User data cannot be null");
        }

        if (dto.getUsername() == null || dto.getUsername().isBlank()) {
            throw new InvalidUserDataException("Username is required");
        }

        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new InvalidUserDataException("Password is required");
        }

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new DuplicateUsernameException(dto.getUsername());
        }

        try {
            User saved = userRepository.save(userMapper.toEntity(dto));
            return userMapper.toDto(saved);
        } catch (Exception e) {
            throw new UserCreationException("Failed to create user", e);
        }
    }

    @Override
    public UserDto getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return userMapper.toDto(user);
    }

    @Override
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public UserDto updateUser(Long userId, UserDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        user.setFirstName(dto.getFirstName());
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        if (dto.getRole() != null) user.setRole(dto.getRole());
        return userMapper.toDto(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userRepository.deleteById(userId);
    }

    public UserDto login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if(!user.getPassword().equals(password)){
            throw new RuntimeException("Invalid password");
        }

        return userMapper.toDto(user);
    }

    @Override
    public Boolean duplicateUsername(String username) {
        return userRepository.existsByUsername(username);
    }
}
