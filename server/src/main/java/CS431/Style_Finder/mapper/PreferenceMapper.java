package CS431.Style_Finder.mapper;

import CS431.Style_Finder.dto.PreferenceDto;
import CS431.Style_Finder.model.Preference;

import java.util.Arrays;
import java.util.List;

public class PreferenceMapper {

    // ENTITY ➜ DTO
    public static PreferenceDto toDto(Preference pref) {
        if (pref == null) return null;

        return PreferenceDto.builder()
                .preferenceId(pref.getPreferenceId())
                .userId(pref.getUser() != null ? pref.getUser().getUserId() : null)

                .comfort(pref.getComfort())
                .weather(pref.getWeather())
                .preferFit(pref.getPreferFit())
                .tripPriority(pref.getTripPriority())

                .occasion(stringToList(pref.getOccasion()))
                .style(stringToList(pref.getStyle()))
                .items(stringToList(pref.getItems()))
                .avoidItems(stringToList(pref.getAvoidItems()))
                .colorsWear(stringToList(pref.getColorsWear()))
                .colorsAvoid(stringToList(pref.getColorsAvoid()))
                .build();
    }


    // DTO ➜ ENTITY
    public static Preference toEntity(PreferenceDto dto) {
        if (dto == null) return null;

        return Preference.builder()
                .preferenceId(dto.getPreferenceId())

                .comfort(dto.getComfort())
                .weather(dto.getWeather())
                .preferFit(dto.getPreferFit())
                .tripPriority(dto.getTripPriority())

                .occasion(listToString(dto.getOccasion()))
                .style(listToString(dto.getStyle()))
                .items(listToString(dto.getItems()))
                .avoidItems(listToString(dto.getAvoidItems()))
                .colorsWear(listToString(dto.getColorsWear()))
                .colorsAvoid(listToString(dto.getColorsAvoid()))
                .build();
    }

    //helpers
    public static List<String> stringToList(String str) {
        if (str == null || str.isEmpty()) return null;
        return Arrays.asList(str.split(","));
    }

    public static String listToString(List<String> list) {
        if (list == null || list.isEmpty()) return null;
        return String.join(",", list);
    }
}