package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.PreferenceDto;
import CS431.Style_Finder.service.PreferenceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PreferenceControllerTest {

    private PreferenceService preferenceService;
    private PreferenceController preferenceController;

    @BeforeEach
    void setUp() {
        preferenceService = mock(PreferenceService.class);
        preferenceController = new PreferenceController(preferenceService);
    }

    //Create or update preference
    @Test
    void testCreateOrUpdatePreference() {
        PreferenceDto input = PreferenceDto.builder()
                .userId(1L)
                .comfort("High")
                .occasion(List.of("Casual", "Work"))
                .weather("Warm")
                .style(List.of("Minimal", "Streetwear"))
                .preferFit("Loose")
                .items(List.of("Jeans", "T-Shirts"))
                .avoidItems(List.of("Formal Shoes"))
                .colorsWear(List.of("Black", "White"))
                .colorsAvoid(List.of("Neon"))
                .tripPriority("Light Packing")
                .build();

        when(preferenceService.createOrUpdatePreference(input))
                .thenReturn(input);

        PreferenceDto result = preferenceController.createOrUpdatePreference(input);

        assertNotNull(result);
        assertEquals(1L, result.getUserId());
        assertEquals("High", result.getComfort());
        assertEquals(2, result.getOccasion().size());

        verify(preferenceService, times(1)).createOrUpdatePreference(input);
    }

    //Get preference by user ID
    @Test
    void testGetPreference() {
        PreferenceDto preference = PreferenceDto.builder()
                .userId(1L)
                .style(List.of("Formal"))
                .weather("Cold")
                .build();

        when(preferenceService.getPreferenceByUserId(1L))
                .thenReturn(preference);

        PreferenceDto result = preferenceController.getPreference(1L);

        assertNotNull(result);
        assertEquals("Cold", result.getWeather());
        assertEquals("Formal", result.getStyle().get(0));

        verify(preferenceService, times(1)).getPreferenceByUserId(1L);
    }

    //delete preference
    @Test
    void testDeletePreference() {
        doNothing().when(preferenceService).deletePreference(1L);

        preferenceController.deletePreference(1L);

        verify(preferenceService, times(1)).deletePreference(1L);
    }

    //empty preference edge case
    @Test
    void testCreateEmptyPreference() {
        PreferenceDto empty = new PreferenceDto();

        when(preferenceService.createOrUpdatePreference(empty))
                .thenReturn(empty);

        PreferenceDto result = preferenceController.createOrUpdatePreference(empty);

        assertNotNull(result);
        verify(preferenceService).createOrUpdatePreference(empty);
    }
}