package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.UserDto;
import CS431.Style_Finder.dto.auth.LoginRequestDto;
import CS431.Style_Finder.dto.auth.LoginResponseDto;
import CS431.Style_Finder.model.enums.Role;
import CS431.Style_Finder.service.UserService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    //register
    @Test
    void testCreateUser() {
        UserDto input = new UserDto();
        input.setUsername("stella");
        input.setPassword("password");
        input.setRole(Role.USER);

        LoginResponseDto mockResponse =
                new LoginResponseDto("token", 1L, "stella", "USER");

        when(userService.createUser(input)).thenReturn(mockResponse);

        ResponseEntity<LoginResponseDto> response =
                userController.createUser(input);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals("token", response.getBody().getToken());
    }

    //LOGIN SUCCESS
    @Test
    void testLoginSuccess() {
        LoginRequestDto request = new LoginRequestDto();
        request.setUsername("stella");
        request.setPassword("password");

        LoginResponseDto mockResponse =
                new LoginResponseDto("token", 1L, "stella", "USER");

        when(userService.login("stella", "password"))
                .thenReturn(mockResponse);

        ResponseEntity<LoginResponseDto> response =
                userController.login(request);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("token", response.getBody().getToken());
    }

    //LOGIN FAILURE
    @Test
    void testLoginFailure() {
        LoginRequestDto request = new LoginRequestDto();
        request.setUsername("wrong");
        request.setPassword("wrong");

        when(userService.login("wrong", "wrong"))
                .thenThrow(new RuntimeException("Invalid credentials"));

        assertThrows(RuntimeException.class, () -> {
            userController.login(request);
        });
    }

    //GET USER
    @Test
    void testGetUserById() {
        UserDto user = new UserDto();
        user.setUsername("stella");

        when(userService.getUserById(1L)).thenReturn(user);

        ResponseEntity<UserDto> response = userController.getUserById(1L);

        assertEquals(200, response.getStatusCodeValue());
    }

    //get all users
    @Test
    void testGetAllUsers() {
        when(userService.getAllUsers()).thenReturn(List.of(new UserDto()));

        ResponseEntity<List<UserDto>> response =
                userController.getAllUsers();

        assertEquals(200, response.getStatusCodeValue());
    }

    //delete user
    @Test
    void testDeleteUser() {
        doNothing().when(userService).deleteUser(1L);

        ResponseEntity<String> response =
                userController.deleteUser(1L);

        assertEquals(200, response.getStatusCodeValue());
    }
}