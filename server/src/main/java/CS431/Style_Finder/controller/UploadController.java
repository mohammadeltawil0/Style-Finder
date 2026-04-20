package CS431.Style_Finder.controller;

import CS431.Style_Finder.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor

public class UploadController {

    private final FileUploadService fileUploadService;

    @GetMapping("/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(
            @RequestParam String filename,
            @RequestParam String contentType) {

        Map<String, String> urls = fileUploadService.getPresignedUploadUrl(filename, contentType);
        return ResponseEntity.ok(urls);
    }
}
