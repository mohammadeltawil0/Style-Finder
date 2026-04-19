package CS431.Style_Finder.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/test")
    public String adminTest() {
        return "Admin access granted";
    }
}