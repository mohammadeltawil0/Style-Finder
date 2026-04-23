package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.UserDto;
import CS431.Style_Finder.dto.auth.LoginResponseDto;
import CS431.Style_Finder.model.User;
import CS431.Style_Finder.model.enums.Role;
import CS431.Style_Finder.repository.UserRepository;
import CS431.Style_Finder.repository.UserWeightsRepository;
import CS431.Style_Finder.security.JwtUtil;
import CS431.Style_Finder.service.impl.UserServiceImpl;
import CS431.Style_Finder.mapper.UserMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserWeightsRepository userWeightsRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    //register
    @Test
    void testCreateUserReturnsJwt() {
        UserDto dto = new UserDto();
        dto.setUsername("stella");
        dto.setPassword("password");
        dto.setRole(Role.USER);

        User user = new User();
        user.setUsername("stella");
        user.setRole(Role.USER);

        User saved = new User();
        saved.setUserId(1L);
        saved.setUsername("stella");
        saved.setRole(Role.USER);

        when(userMapper.toEntity(dto)).thenReturn(user);
        when(passwordEncoder.encode("password")).thenReturn("hashed");
        when(userRepository.save(user)).thenReturn(saved);
        when(jwtUtil.generateToken("stella", "USER")).thenReturn("token");

        LoginResponseDto response = userService.createUser(dto);

        assertNotNull(response.getToken());
        assertEquals(1L, response.getUserId());
        assertEquals("stella", response.getUsername());
        assertEquals("USER", response.getRole());
    }

    //LOGIN SUCCESS
    @Test
    void testLoginReturnsJwtToken() {
        User user = new User();
        user.setUserId(1L);
        user.setUsername("stella");
        user.setPassword("hashed");
        user.setRole(Role.USER);

        when(userRepository.findByUsername("stella"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("password", "hashed"))
                .thenReturn(true);

        when(jwtUtil.generateToken("stella", "USER"))
                .thenReturn("token");

        LoginResponseDto response =
                userService.login("stella", "password");

        assertEquals("token", response.getToken());
    }

    //LOGIN WRONG PASSWORD
    @Test
    void testLoginInvalidPassword() {
        User user = new User();
        user.setUsername("stella");
        user.setPassword("hashed");

        when(userRepository.findByUsername("stella"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches("wrong", "hashed"))
                .thenReturn(false);

        assertThrows(RuntimeException.class, () -> {
            userService.login("stella", "wrong");
        });
    }

    //LOGIN USER NOT FOUND
    @Test
    void testLoginUserNotFound() {
        when(userRepository.findByUsername("stella"))
                .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            userService.login("stella", "password");
        });
    }
}