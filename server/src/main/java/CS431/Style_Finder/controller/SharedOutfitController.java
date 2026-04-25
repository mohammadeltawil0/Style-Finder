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

    @GetMapping("/view/{token}")
    public ResponseEntity<String> viewSharedOutfit(@PathVariable String token) {

        OutfitDto outfit = sharedOutfitService.getSharedOutfit(token);

        StringBuilder html = new StringBuilder();

        html.append("<html><body style='font-family:sans-serif;'>");

        //Title
        html.append("<h2>Shared Outfit</h2>");

        //Basic details
        html.append("<p><strong>Outfit ID:</strong> ").append(outfit.getOutfitId()).append("</p>");
        html.append("<p><strong>Created:</strong> ").append(outfit.getCreatedAt()).append("</p>");
        html.append("<p><strong>Total Items:</strong> ").append(outfit.getItemIds() != null ? outfit.getItemIds().size() : 0).append("</p>");

        //Images
        if (outfit.getImageUrls() != null) {
            html.append("<div style='display:flex;flex-wrap:wrap;'>");
            for (String url : outfit.getImageUrls()) {
                html.append("<div style='margin:10px;'>")
                    .append("<img src='")
                    .append(url)
                    .append("' style='width:200px;height:200px;border-radius:10px;'/>")
                    .append("</div>");
            }
            html.append("</div>");
        }
        html.append("</body></html>");
        return ResponseEntity.ok().header("Content-Type", "text/html").body(html.toString());
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<Void> revokeShareLink(@PathVariable String token) {
        sharedOutfitService.revokeShareLink(token);
        return ResponseEntity.noContent().build();
    }
}