//package CS431.Style_Finder.controller;
//
//import CS431.Style_Finder.dto.auth.LoginRequestDto;
//import CS431.Style_Finder.dto.auth.LoginResponseDto;
//import CS431.Style_Finder.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.PostMapping;
//import org.springframework.web.bind.annotation.RequestBody;
//import org.springframework.web.bind.annotation.RequestMapping;
//import org.springframework.web.bind.annotation.RestController;
//import CS431.Style_Finder.model.User;
//
//@RestController
//@RequestMapping("/api/auth")
//@RequiredArgsConstructor
//public class AuthController {
//
//    private final UserRepository userRepository;
//
////    @PostMapping("/register")
////    public ResponseEntity<?> register(@RequestBody User user){
////
////        User savedUser = userRepository.save(user);
////
////        return ResponseEntity.ok(savedUser);
////    }
//
//    @PostMapping("/login")
//    public ResponseEntity<?> login(@RequestBody LoginRequestDto request){
//
//        User user = userRepository.findByUsername(request.getUsername())
//                .orElseThrow(() -> new RuntimeException("User not found"));
//
//        if(!user.getPassword().equals(request.getPassword())){
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid password");
//        }
//
//        LoginResponseDto response = new LoginResponseDto();
//        response.setUserId(user.getUserId());
//        response.setUsername(user.getUsername());
//        return ResponseEntity.ok(response);
//    }
//}