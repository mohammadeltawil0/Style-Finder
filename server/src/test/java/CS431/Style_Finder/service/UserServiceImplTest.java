package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.auth.LoginResponseDto;
import CS431.Style_Finder.model.User;
import CS431.Style_Finder.repository.UserRepository;
import CS431.Style_Finder.mapper.UserMapper;
import CS431.Style_Finder.security.JwtUtil;
import CS431.Style_Finder.service.impl.UserServiceImpl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import org.mockito.Mockito;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceImplTest {

    private UserRepository userRepository;
    private UserMapper userMapper;
    private JwtUtil jwtUtil;
    private PasswordEncoder passwordEncoder;

    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        userMapper = new UserMapper();
        jwtUtil = new JwtUtil();
        passwordEncoder = new BCryptPasswordEncoder();

        userService = new UserServiceImpl(
                userRepository,
                userMapper,
                passwordEncoder,
                jwtUtil
        );
    }

    @Test
    void testLoginReturnsJwtToken() {
        User user = new User();
        user.setUserId(1L);
        user.setUsername("stella");
        user.setPassword(passwordEncoder.encode("password"));

        when(userRepository.findByUsername("stella"))
                .thenReturn(Optional.of(user));

        LoginResponseDto response =
                userService.login("stella", "password");

        assertNotNull(response.getToken());
        assertEquals(1L, response.getUserId());
    }
}