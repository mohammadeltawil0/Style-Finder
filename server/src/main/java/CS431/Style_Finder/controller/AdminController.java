package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.UserDto;
import CS431.Style_Finder.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;

    // GET /api/admin/users
    // Returns all users for the admin user list screen
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // GET /api/admin/users/search?username=foo
    // Powers the search bar in adminUsers.jsx
    @GetMapping("/users/search")
    public ResponseEntity<UserDto> searchByUsername(@RequestParam String username) {
        return ResponseEntity.ok(userService.getUserByUsername(username));
    }

    @GetMapping("/test")
    public String adminTest() {
        return "Admin access granted";
    }

    // DELETE /api/admin/users/{id}
    // Called from adminUserDetail.jsx delete button
    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully.");
    }
}