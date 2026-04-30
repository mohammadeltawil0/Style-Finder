package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.OutfitDto;
import CS431.Style_Finder.service.OutfitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outfits")
@RequiredArgsConstructor
public class OutfitController {

    private final OutfitService outfitService;

    // POST /api/outfits
    // Body: { "userId":1, "saved":false, "comments":"Summer look",
    //         "itemIds":[1, 2, 3] }
    @PostMapping
    public ResponseEntity<OutfitDto> createOutfit(@RequestBody OutfitDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(outfitService.createOutfit(dto));
    }

    // GET /api/outfits/{id}
    @GetMapping("/{id}")
    public ResponseEntity<OutfitDto> getOutfitById(@PathVariable Long id) {
        return ResponseEntity.ok(outfitService.getOutfitById(id));
    }

    // GET /api/outfits/user/{userId}  — all outfits for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<OutfitDto>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(outfitService.getOutfitsByUserId(userId));
    }

    // GET /api/outfits/user/{userId}/saved  — only saved outfits
    @GetMapping("/user/{userId}/saved")
    public ResponseEntity<List<OutfitDto>> getSavedByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(outfitService.getSavedOutfitsByUserId(userId));
    }

    // PUT /api/outfits/{id}
    @PutMapping("/{id}")
    public ResponseEntity<OutfitDto> updateOutfit(@PathVariable Long id, @RequestBody OutfitDto dto) {
        return ResponseEntity.ok(outfitService.updateOutfit(id, dto));
    }

    // PATCH /api/outfits/{id}/save  — marks an outfit as saved (no body needed)
    @PatchMapping("/{id}/save")
    public ResponseEntity<OutfitDto> markAsSaved(@PathVariable Long id) {
        return ResponseEntity.ok(outfitService.markAsSaved(id));
    }

    // DELETE /api/outfits/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOutfit(@PathVariable Long id) {
        outfitService.deleteOutfit(id);
        //System.out.println("DELETE OUTFIT HIT: " + id);
        return ResponseEntity.ok("Outfit deleted successfully.");
    }

    // GET /api/outfits/user/{userId}/random3
    @GetMapping("/user/{userId}/random3")
    public ResponseEntity<List<OutfitDto>> getThreeOutfitsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(outfitService.find3Outfits(userId));
    }
}