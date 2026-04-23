package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.OutfitDto;
import CS431.Style_Finder.dto.SharedOutfitDto;
import CS431.Style_Finder.service.SharedOutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
public class SharedOutfitController {
    private final SharedOutfitService sharedOutfitService;

    @PostMapping("/{outfitId}")
    public ResponseEntity<SharedOutfitDto> createShareLink(@PathVariable Long outfitId) {
        return ResponseEntity.ok(sharedOutfitService.createShareLink(outfitId));
    }

    @GetMapping("/{token}")
    public ResponseEntity<OutfitDto> getSharedOutfit(@PathVariable String token) {
        return ResponseEntity.ok(sharedOutfitService.getSharedOutfit(token));
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<Void> revokeShareLink(@PathVariable String token) {
        sharedOutfitService.revokeShareLink(token);
        return ResponseEntity.noContent().build();
    }
}