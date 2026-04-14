package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.UserDto;
import CS431.Style_Finder.dto.auth.LoginResponseDto;
import CS431.Style_Finder.dto.auth.LoginRequestDto;
import CS431.Style_Finder.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserControllerTest {

    private UserService userService;
    private UserController userController;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        userController = new UserController(userService);
    }

    //create user
    @Test
    void testCreateUser() {
        UserDto input = new UserDto();
        input.setUsername("stella");

        when(userService.createUser(input)).thenReturn(input);

        ResponseEntity<UserDto> response = userController.createUser(input);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals("stella", response.getBody().getUsername());
    }

    //Get user by ID
    @Test
    void testGetUserById() {
        UserDto user = new UserDto();
        user.setUsername("stella");

        when(userService.getUserById(1L)).thenReturn(user);

        ResponseEntity<UserDto> response = userController.getUserById(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("stella", response.getBody().getUsername());
    }

    //Get all users
    @Test
    void testGetAllUsers() {
        UserDto user = new UserDto();
        user.setUsername("stella");

        when(userService.getAllUsers()).thenReturn(List.of(user));

        ResponseEntity<List<UserDto>> response = userController.getAllUsers();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    //Update user
    @Test
    void testUpdateUser() {
        UserDto updated = new UserDto();
        updated.setUsername("updated");

        when(userService.updateUser(1L, updated)).thenReturn(updated);

        ResponseEntity<UserDto> response = userController.updateUser(1L, updated);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("updated", response.getBody().getUsername());
    }

    //Delete user
    @Test
    void testDeleteUser() {
        doNothing().when(userService).deleteUser(1L);

        ResponseEntity<String> response = userController.deleteUser(1L);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals("User deleted successfully.", response.getBody());
    }

    //login success
    @Test
    void testLoginSuccess() {
        LoginRequestDto request = new LoginRequestDto();
        request.setUsername("stella");
        request.setPassword("password");

        LoginResponseDto mockResponse = new LoginResponseDto(1L, "fake-jwt-token");

        when(userService.login("stella", "password"))
                .thenReturn(mockResponse);

        ResponseEntity<LoginResponseDto> response = userController.login(request);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1L, response.getBody().getUserId());
        assertEquals("fake-jwt-token", response.getBody().getToken());
    }

    //Login failure
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
}