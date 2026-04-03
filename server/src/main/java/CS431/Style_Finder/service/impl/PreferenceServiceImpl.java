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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class PreferenceServiceImpl implements PreferenceService {

    private final PreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    @Override
    public PreferenceDto createOrUpdatePreference(PreferenceDto dto) {
                if (dto == null || dto.getUserId() == null) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "userId is required");
                }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found with id: " + dto.getUserId())
                );

        // update if exists, otherwise create new
        Preference preference = preferenceRepository.findByUser_UserId(dto.getUserId())
                .orElse(new Preference());

        preference.setUser(user);

        preference.setComfort(dto.getComfort());
        preference.setWeather(dto.getWeather());
        preference.setPreferFit(dto.getPreferFit());
        preference.setTripPriority(dto.getTripPriority());
        preference.setOccasion(PreferenceMapper.listToString(dto.getOccasion()));
        preference.setStyle(PreferenceMapper.listToString(dto.getStyle()));
        preference.setItems(PreferenceMapper.listToString(dto.getItems()));
        preference.setAvoidItems(PreferenceMapper.listToString(dto.getAvoidItems()));
        preference.setColorsWear(PreferenceMapper.listToString(dto.getColorsWear()));
        preference.setColorsAvoid(PreferenceMapper.listToString(dto.getColorsAvoid()));

        Preference saved = preferenceRepository.save(preference);
        return PreferenceMapper.toDto(saved);
    }

    @Override
    public PreferenceDto getPreferenceByUserId(Long userId) {

        Preference preference = preferenceRepository.findByUser_UserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Preference not found for user: " + userId)
                );

        return PreferenceMapper.toDto(preference);
    }

    @Override
    public void deletePreference(Long preferenceId) {

        preferenceRepository.findById(preferenceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Preference not found with id: " + preferenceId)
                );

        preferenceRepository.deleteById(preferenceId);
    }
}