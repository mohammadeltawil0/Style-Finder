package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.OutfitSuggestionDto;
import CS431.Style_Finder.model.*;
import CS431.Style_Finder.model.enums.*;
import CS431.Style_Finder.repository.*;
import CS431.Style_Finder.service.impl.AlgorithmServiceImpl;
import CS431.Style_Finder.service.WeatherService;
import CS431.Style_Finder.mapper.OutfitMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AlgorithmServiceImplTest {

    @Mock private OutfitCaseRepository cbrDb;
    @Mock private ItemRepository wardrobeDb;
    @Mock private UserWeightsRepository weightsDb;
    @Mock private UserRepository userDb;
    @Mock private WeatherService weatherService;
    @Mock private OutfitMapper mapper;

    @InjectMocks
    private AlgorithmServiceImpl algorithmService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    //Basic generation test
    @Test
    void testGenerateSuggestionHub_basicFlow() {
        Long userId = 1L;

        // Mock weights
        UserWeights weights = new UserWeights();
        weights.setThermalBias(1.0);
        weights.setColorHarmonyWeight(1.0);
        weights.setFitWeights(new HashMap<>());
        weights.setPatternWeights(new HashMap<>());
        weights.setMaterialWeights(new HashMap<>());
        weights.setColorWeights(new HashMap<>());

        when(weightsDb.findUserWeightsByUser_UserId(userId))
                .thenReturn(Optional.of(weights));

        // Mock weather
        when(weatherService.getWeatherForLocation("NYC"))
                .thenReturn(new WeatherService.WeatherContext(70, Weather.SUNNY));

        // Mock items
        Item top = Item.builder()
            .itemId(1L)
            .type(ItemType.TOP)
            .bulk(10.0)
            .fit(Fit.REGULAR)
            .formality(Formality.CASUAL)
            .pattern(PatternType.SOLID)
            .material(MaterialType.COTTON)
            .colorCategory(ColorCategory.RED)
            .build();

        Item bottom = Item.builder()
            .itemId(2L)
            .type(ItemType.BOTTOM)
            .bulk(10.0)
            .fit(Fit.REGULAR)
            .formality(Formality.CASUAL)
            .pattern(PatternType.SOLID)
            .material(MaterialType.COTTON)
            .colorCategory(ColorCategory.BLACK)
            .build();

        when(wardrobeDb.findByUser_UserId(userId))
                .thenReturn(List.of(top, bottom));

        List<OutfitSuggestionDto> result = algorithmService.generateSuggestionHub(userId, "NYC", "Casual", false);

        assertTrue(result.size() >= 1);
        assertNotNull(result.get(0).getScore());
    }

    //empty closet → no outfits
    @Test
    void testGenerateSuggestionHub_emptyCloset() {
        Long userId = 1L;

        when(weightsDb.findUserWeightsByUser_UserId(userId))
                .thenReturn(Optional.of(new UserWeights()));

        when(weatherService.getWeatherForLocation(any()))
                .thenReturn(new WeatherService.WeatherContext(70, Weather.SUNNY));

        when(wardrobeDb.findByUser_UserId(userId))
                .thenReturn(Collections.emptyList());

        List<OutfitSuggestionDto> result =
                algorithmService.generateSuggestionHub(userId, "NYC", "Casual", false);

        assertTrue(result.isEmpty());
    }

    //memory toggle ON
    @Test
    void testGenerateSuggestionHub_withMemory() {
        Long userId = 1L;

        when(weightsDb.findUserWeightsByUser_UserId(userId)).thenReturn(Optional.of(new UserWeights()));

        when(weatherService.getWeatherForLocation(any())).thenReturn(new WeatherService.WeatherContext(70, Weather.SUNNY));

        OutfitCase mockCase = new OutfitCase();
        when(cbrDb.findMatchingMemory(any(), any(), anyInt(), anyInt())).thenReturn(List.of(mockCase));

        OutfitSuggestionDto dto = new OutfitSuggestionDto();
        dto.setItemIds(List.of(1L));
        when(mapper.toDto(mockCase)).thenReturn(dto);
        when(wardrobeDb.findByUser_UserId(userId)).thenReturn(Collections.emptyList());

        List<OutfitSuggestionDto> result = algorithmService.generateSuggestionHub(userId, "NYC", "Casual", true);

        assertFalse(result.isEmpty());
        assertEquals("PARAMETRIC".equals(result.get(0).getGenerationSource()), false);
    }

    //clashing colors reduce score
    @Test
    void testClashingColors_penaltyApplied() {
        Long userId = 1L;

        UserWeights weights = new UserWeights();
        weights.setThermalBias(1.0);
        weights.setColorHarmonyWeight(1.0);
        weights.setFitWeights(new HashMap<>());
        weights.setPatternWeights(new HashMap<>());
        weights.setMaterialWeights(new HashMap<>());
        weights.setColorWeights(new HashMap<>());

        when(weightsDb.findUserWeightsByUser_UserId(userId)).thenReturn(Optional.of(weights));
        when(weatherService.getWeatherForLocation(any())).thenReturn(new WeatherService.WeatherContext(70, Weather.SUNNY));

        Item redTop = Item.builder()
                .itemId(1L)
                .type(ItemType.TOP)
                .colorCategory(ColorCategory.RED)
                .bulk(10.0)
                .build();

        Item greenBottom = Item.builder()
                .itemId(2L)
                .type(ItemType.BOTTOM)
                .colorCategory(ColorCategory.GREEN)
                .bulk(10.0)
                .build();

        when(wardrobeDb.findByUser_UserId(userId)).thenReturn(List.of(redTop, greenBottom));

        List<OutfitSuggestionDto> result = algorithmService.generateSuggestionHub(userId, "NYC", "Casual", false);

        assertNotNull(result);
        assertFalse(result.isEmpty());

        //score should be relatively low due to clash
        assertTrue(result.get(0).getScore() < 1.0);
    }
}