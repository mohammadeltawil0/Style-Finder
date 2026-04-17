package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.UserDto;
import CS431.Style_Finder.exception.DuplicateUsernameException;
import CS431.Style_Finder.exception.InvalidUserDataException;
import CS431.Style_Finder.exception.ResourceNotFoundException;
import CS431.Style_Finder.exception.UserCreationException;
import CS431.Style_Finder.exception.InvalidCredentialsException;
import CS431.Style_Finder.mapper.UserMapper;
import CS431.Style_Finder.model.User;
import CS431.Style_Finder.repository.UserRepository;
import CS431.Style_Finder.service.UserService;
import CS431.Style_Finder.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import CS431.Style_Finder.dto.auth.LoginResponseDto;


import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

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
            User user = userMapper.toEntity(dto);
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
            User saved = userRepository.save(user);
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
        try {
            if (dto.getFirstName() != null) {
                user.setFirstName(dto.getFirstName());
            }

            if (dto.getUsername() != null) {
                String newUsername = dto.getUsername().trim();
                if (newUsername.isEmpty()) {
                    throw new InvalidUserDataException("Username cannot be empty.");
                }

                if (!newUsername.equals(user.getUsername()) && userRepository.existsByUsername(newUsername)) {
                    throw new InvalidUserDataException("Username already taken: " + newUsername);
                }

                user.setUsername(newUsername);
            }

            if (dto.getEmail() != null) {
                String newEmail = dto.getEmail().trim();
                if (newEmail.isEmpty()) {
                    throw new InvalidUserDataException("Email cannot be empty.");
                }
                user.setEmail(newEmail);
            }

            if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(dto.getPassword()));
            }

            if (dto.getProfileImageUrl() != null) {
                user.setProfileImageUrl(dto.getProfileImageUrl());
            }

            if (dto.getRole() != null) {
                user.setRole(dto.getRole());
            }

            return userMapper.toDto(userRepository.save(user));
        } catch (DataIntegrityViolationException ex) {
            throw new InvalidUserDataException("Invalid or conflicting user data. Please check username/email.");
        }
    }

    @Override
    public void deleteUser(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userRepository.deleteById(userId);
    }

    private final JwtUtil jwtUtil;

    public LoginResponseDto login(String username, String password) {
        //System.out.println("LOGIN HIT with username: " + username);

        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new InvalidCredentialsException());

        //System.out.println("DB PASSWORD (hashed): " + user.getPassword());

        if (!passwordEncoder.matches(password, user.getPassword())) {
            //System.out.println("PASSWORD MISMATCH");
            throw new InvalidCredentialsException();
        }

        String token = jwtUtil.generateToken(user.getUsername());

        return new LoginResponseDto(token, user.getUserId(), user.getUsername());
    }

    @Override
    public UserDto getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return userMapper.toDto(user);
    }

    @Override
    public Boolean duplicateUsername(String username) {
        return userRepository.existsByUsername(username);
    }
    
    public boolean usernameExists(String username) {
        if (username == null || username.isBlank()) {
            return false;
        }

        return userRepository.existsByUsername(username.trim());
    }
}
