package CS431.Style_Finder.mapper;

import CS431.Style_Finder.dto.PreferenceDto;
import CS431.Style_Finder.model.Preference;
import org.springframework.stereotype.Component;
import CS431.Style_Finder.model.User;
@Component
public class PreferenceMapper {

    public PreferenceDto toDto(Preference preference) {
        return PreferenceDto.builder()
                .preferenceId(preference.getPreferenceId())
                .userId(preference.getUser().getUserId())
                .colorOftenWear(preference.getColorOftenWear())
                .preferFit(preference.getPreferFit())
                .fabricPrefer(preference.getFabricPrefer())
                .outfitNeedMost(preference.getOutfitNeedMost())
                .gender(preference.getGender())
                .build();
    }

    public Preference toEntity(PreferenceDto dto, User user) {
        return Preference.builder()
                .preferenceId(dto.getPreferenceId())
                .user(user)
                .colorOftenWear(dto.getColorOftenWear())
                .preferFit(dto.getPreferFit())
                .fabricPrefer(dto.getFabricPrefer())
                .outfitNeedMost(dto.getOutfitNeedMost())
                .gender(dto.getGender())
                .build();
    }
}