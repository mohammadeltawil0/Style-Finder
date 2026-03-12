package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.PreferenceDto;
import CS431.Style_Finder.service.PreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class PreferenceController {

    private final PreferenceService preferenceService;

    // POST /api/preferences
    // Creates a new preference or updates the existing one for that user.
    // Body: { "userId":1, "colorOftenWear":"black", "preferFit":"slim", "gender":"female", ... }
    @PostMapping
    public ResponseEntity<PreferenceDto> createOrUpdate(@RequestBody PreferenceDto dto) {
        return ResponseEntity.ok(preferenceService.createOrUpdatePreference(dto));
    }

    // GET /api/preferences/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<PreferenceDto> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(preferenceService.getPreferenceByUserId(userId));
    }

    // DELETE /api/preferences/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        preferenceService.deletePreference(id);
        return ResponseEntity.ok("Preference deleted successfully.");
    }
}