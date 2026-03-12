package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.PreferenceDto;
import CS431.Style_Finder.exception.ResourceNotFoundException;
import CS431.Style_Finder.mapper.PreferenceMapper;
import CS431.Style_Finder.model.Preference;
import CS431.Style_Finder.model.User;
import CS431.Style_Finder.repository.PreferenceRepository;
import CS431.Style_Finder.repository.UserRepository;
import CS431.Style_Finder.service.PreferenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PreferenceServiceImpl implements PreferenceService {

    private final PreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final PreferenceMapper preferenceMapper;

    @Override
    public PreferenceDto createOrUpdatePreference(PreferenceDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));

        // If a preference already exists for this user, update it; otherwise create new
        Preference preference = preferenceRepository.findByUser_UserId(dto.getUserId())
                .orElse(new Preference());

        preference.setUser(user);
        preference.setColorOftenWear(dto.getColorOftenWear());
        preference.setPreferFit(dto.getPreferFit());
        preference.setFabricPrefer(dto.getFabricPrefer());
        preference.setOutfitNeedMost(dto.getOutfitNeedMost());
        preference.setGender(dto.getGender());

        return preferenceMapper.toDto(preferenceRepository.save(preference));
    }

    @Override
    public PreferenceDto getPreferenceByUserId(Long userId) {
        Preference preference = preferenceRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Preference not found for user: " + userId));
        return preferenceMapper.toDto(preference);
    }

    @Override
    public void deletePreference(Long preferenceId) {
        preferenceRepository.findById(preferenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Preference not found with id: " + preferenceId));
        preferenceRepository.deleteById(preferenceId);
    }
}