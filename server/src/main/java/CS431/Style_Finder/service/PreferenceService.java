package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.PreferenceDto;

public interface PreferenceService {
    PreferenceDto createOrUpdatePreference(PreferenceDto dto);
    PreferenceDto getPreferenceByUserId(Long userId);
    void deletePreference(Long preferenceId);
}