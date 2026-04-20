package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.UserDto;
import CS431.Style_Finder.dto.auth.LoginResponseDto;
import CS431.Style_Finder.dto.auth.LoginRequestDto;
import CS431.Style_Finder.service.UserService;
import CS431.Style_Finder.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // POST /api/users
    // Body: { "firstName":"Stella", "username":"stella123", "passwordHash":"abc", "role":"ROLE_USER" }
    @PostMapping("/register")
    public ResponseEntity<LoginResponseDto> createUser(@RequestBody UserDto dto) {

        UserDto user = userService.createUser(dto);

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        LoginResponseDto response = new LoginResponseDto(
            token,
            user.getUserId(),
            user.getUsername()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody LoginRequestDto request) {
        UserDto user = userService.login(request.getUsername(), request.getPassword());

        LoginResponseDto response = new LoginResponseDto(
                user.getUserId(),
                user.getUsername(),
            user.getRole() != null ? user.getRole().name() : null
        );

        return ResponseEntity.ok(userService.login(request.getUsername(), request.getPassword()));
    }

    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    // GET /api/users/by-username?username={username}
    @GetMapping("/by-username")
    public ResponseEntity<UserDto> getUserByUsername(@RequestParam String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    // GET /api/users
    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /api/users/exists?username=...
    @GetMapping("/exists")
    public ResponseEntity<Boolean> usernameExists(@RequestParam String username) {
        return ResponseEntity.ok(userService.usernameExists(username));
    }



    // PUT /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @RequestBody UserDto dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully.");
    }

    // GET /api/users/check-username?username={username}
    @GetMapping("/check-username")
    public ResponseEntity<Void> checkDuplicateUsername(@RequestParam String username) {
        System.out.println(">>> check-username hit with: " + username);
        if (userService.duplicateUsername(username)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        return ResponseEntity.ok().build();
    }
}