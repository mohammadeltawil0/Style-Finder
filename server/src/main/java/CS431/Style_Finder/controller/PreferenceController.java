package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.PreferenceDto;
import CS431.Style_Finder.service.PreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/preferences")
@RequiredArgsConstructor
public class PreferenceController {

    private final PreferenceService preferenceService;

    @PostMapping
    public PreferenceDto createOrUpdatePreference(@RequestBody PreferenceDto dto) {
        return preferenceService.createOrUpdatePreference(dto);
    }

    @GetMapping("/{userId}")
    public PreferenceDto getPreference(@PathVariable Long userId) {
        return preferenceService.getPreferenceByUserId(userId);
    }

    @DeleteMapping("/{preferenceId}")
    public void deletePreference(@PathVariable Long preferenceId) {
        preferenceService.deletePreference(preferenceId);
    }
}