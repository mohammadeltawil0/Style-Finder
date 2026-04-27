package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.OutfitSuggestionDto;
import CS431.Style_Finder.mapper.OutfitMapper;
import CS431.Style_Finder.model.*;
import CS431.Style_Finder.model.enums.ColorCategory;
import CS431.Style_Finder.model.enums.Formality;
import CS431.Style_Finder.repository.ItemRepository;
import CS431.Style_Finder.repository.OutfitCaseRepository;
import CS431.Style_Finder.repository.UserRepository;
import CS431.Style_Finder.repository.UserWeightsRepository;
import CS431.Style_Finder.service.AlgorithmService;
import CS431.Style_Finder.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AlgorithmServiceImpl implements AlgorithmService {
    private final OutfitCaseRepository cbrDb;
    private final ItemRepository wardrobeDb;
    private final UserWeightsRepository weightsDb;
    private final UserRepository userDb;
    private final WeatherService weatherService;
    private final OutfitMapper mapper;

    @Override
    // Method to generate a list of outfits based on user weights, weather conditions, and occasion.
    public List<OutfitSuggestionDto> generateSuggestionHub(Long userId, String location, String event, boolean useMemory) {
        List<OutfitSuggestionDto> hub = new ArrayList<>();
        UserWeights vw = weightsDb.findUserWeightsByUser_UserId(userId)
            .orElseGet(() -> createDefaultWeights(userId));

        WeatherService.WeatherContext weather = weatherService.getWeatherForLocation(location);
        String occasion = (event != null && !event.isEmpty()) ? event : "Casual";

        // PHASE 1: Episodic Retrieval (CBR) - ONLY EXECUTES IF TOGGLE IS ON!
        if (useMemory) {
            List<OutfitCase> memories =
                    cbrDb.findMatchingMemory(userId, occasion,
                            weather.temp() - 5, weather.temp() + 5);
            for (OutfitCase memory : memories) {
                OutfitSuggestionDto dto = mapper.toDto(memory);
                if (dto.getItemIds() != null && !dto.getItemIds().isEmpty()) {
                    if (hub.size() < 15) {
                        hub.add(dto);
                    }
                }
            }
        }

        // PHASE 2: Parametric Generation (Fills the rest, or does 100% of the work if useMemory is false)
        if (hub.size() < 15) {
            List<Item> closet = wardrobeDb.findByUser_UserId(userId);
            List<OutfitSuggestionDto> generated = runParametricFallback(closet, vw, weather.temp(), occasion, 15 - hub.size());

            for(OutfitSuggestionDto genDto : generated) {
                if (genDto.getItemIds() != null && !genDto.getItemIds().isEmpty()) {
                    hub.add(genDto);
                }
            }
        }
        return hub;
    }

    private UserWeights createDefaultWeights(Long userId) {
        User user = userDb.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found."));

        UserWeights newWeights = new UserWeights();
        newWeights.setUser(user);
        user.setUserWeights(newWeights);
        return weightsDb.save(newWeights);
    }

    private List<OutfitSuggestionDto> runParametricFallback(List<Item> closet, UserWeights vw, int targetTemp, String occasion, int limit) {
        List<OutfitSuggestionDto> validOutfits = new ArrayList<>();
        List<OutfitCombo> allCombos = generateCombinations(closet);

        for (OutfitCombo combo : allCombos) {
            // 1. HARD CONSTRAINTS
            if (combo.over() != null && combo.over().getBulk() < combo.top().getBulk()) continue;
            if (combo.bottom() != null && getWeight(vw.getFitWeights(), combo.bottom().getFit()) == 0.0) continue;
            if (occasion.equals("Formal") && combo.top().getFormality() == Formality.FORMAL) continue;

            // 2. THE GRANULAR SCORING FUNCTION
            double rawThermalDiff = Math.abs(targetTemp - combo.calculateTotalWarmth());
            double thermalPenalty = (rawThermalDiff / 25.0) * vw.getThermalBias();

            double colorHarmonyScore = combo.calculateColorHarmony() * vw.getColorHarmonyWeight();

            double specificColorScore = evaluateComboAverage(vw.getColorWeights(),
                    combo.top().getColorCategory(),
                    combo.bottom() != null ? combo.bottom().getColorCategory() : null);

            double fitScore = evaluateComboAverage(vw.getFitWeights(),
                    combo.top().getFit(),
                    combo.bottom() != null ? combo.bottom().getFit() : null);

            double patternScore = evaluateComboAverage(vw.getPatternWeights(),
                    combo.top().getPattern(),
                    combo.bottom() != null ? combo.bottom().getPattern() : null);

            double materialScore = evaluateComboAverage(vw.getMaterialWeights(),
                    combo.top().getMaterial(),
                    combo.bottom() != null ? combo.bottom().getMaterial() : null);

            double finalScore = (fitScore + patternScore + materialScore + colorHarmonyScore + specificColorScore) - thermalPenalty;

            OutfitSuggestionDto dto = new OutfitSuggestionDto();
            dto.setSuggestionId(UUID.randomUUID().toString());
            dto.setItemIds(combo.getItemIds());
            dto.setScore(finalScore);
            dto.setGenerationSource("PARAMETRIC");

            validOutfits.add(dto);
        }

        validOutfits.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        if (validOutfits.isEmpty()) {
            return Collections.emptyList();
        }
        return validOutfits.subList(0, Math.min(limit, validOutfits.size()));
    }

    private <T extends Enum<T>> double getWeight(Map<T, Double> weightMap, T attribute) {
        if (attribute == null) return 1.0;
        return weightMap.getOrDefault(attribute, 1.0);
    }

    private <T extends Enum<T>> double evaluateComboAverage(Map<T, Double> weightMap, T topAttr, T bottomAttr) {
        if (weightMap == null) return 1.0;
        if (topAttr != null && bottomAttr != null) {
            double topWeight = getWeight(weightMap, topAttr);
            double bottomWeight = getWeight(weightMap, bottomAttr);

            if (topWeight == 0.0 || bottomWeight == 0.0) return 0.0;
            return (topWeight + bottomWeight) / 2.0;
        }
        if (topAttr != null) return getWeight(weightMap, topAttr);
        if (bottomAttr != null) return getWeight(weightMap, bottomAttr);

        return 1.0;
    }

    private List<OutfitCombo> generateCombinations(List<Item> closet) {
        List<OutfitCombo> allCombos = new ArrayList<>();

        List<Item> tops = new ArrayList<>();
        List<Item> bottoms = new ArrayList<>();
        List<Item> overs = new ArrayList<>();
        List<Item> fullBodies = new ArrayList<>();

        for (Item item : closet) {
            if (item.getType() == null) continue;

            switch (item.getType().name()) {
                case "TOP": tops.add(item); break;
                case "BOTTOM": bottoms.add(item); break;
                case "OVER":
                case "OUTERWEAR": overs.add(item); break;
                case "FULL_BODY": fullBodies.add(item); break;
            }
        }

        overs.add(null);

        // Generate Standard Outfits (Top + Bottom + Optional Over)
        for (Item top : tops) {
            for (Item bottom : bottoms) {
                for (Item over : overs) {
                    allCombos.add(new OutfitCombo(top, bottom, over, null));
                }
            }
        }

        // Generate Full Body Outfits (Dress/Jumpsuit + Optional Over)
        for (Item fullBody : fullBodies) {
            for (Item over : overs) {
                allCombos.add(new OutfitCombo(null, null, over, fullBody));
            }
        }
        return allCombos;
    }

    private record OutfitCombo(Item top, Item bottom, Item over, Item fullBody) {

        @Override
        public Item top() {
            return top != null ? top : fullBody;
        }

        public List<Long> getItemIds() {
            List<Long> ids = new ArrayList<>();
            if (top != null) ids.add(top.getItemId());
            if (bottom != null) ids.add(bottom.getItemId());
            if (fullBody != null) ids.add(fullBody.getItemId());
            if (over != null) ids.add(over.getItemId());
            return ids;
        }

        public double calculateTotalWarmth() {
            double total = 0.0;
            if (top != null) total += top.getWarmthScore();
            if (bottom != null) total += bottom.getWarmthScore();
            if (fullBody != null) total += fullBody.getWarmthScore();
            if (over != null) total += over.getWarmthScore();
            return total;
        }

        public double calculateColorHarmony() {
            // If it's just a dress/jumpsuit with no jacket, color harmony is inherently perfect.
            if (fullBody != null && over == null) return 1.0;

            double harmonyScore = 1.0;

            // Extract the color strings
            ColorCategory topColor = (top != null) ? top.getColorCategory() : ((fullBody != null) ? fullBody.getColorCategory() : null);
            ColorCategory bottomColor = (bottom != null) ? bottom.getColorCategory() : null;
            ColorCategory overColor = (over != null) ? over.getColorCategory() : null;

            // Evaluate Top vs. Bottom (if neither is null)
            if (topColor != null && bottomColor != null) {
                harmonyScore *= compareTwoColors(topColor, bottomColor);
            }

            // Evaluate the Overlayer vs. the rest of the outfit
            if (overColor != null) {
                if (topColor != null) {
                    harmonyScore *= compareTwoColors(overColor, topColor);
                }
                // If wearing a top and bottom, the jacket must also match the pants
                if (bottomColor != null && fullBody == null) {
                    harmonyScore *= compareTwoColors(overColor, bottomColor);
                }
            }
            return harmonyScore;
        }

        /**
         * Evaluates two color strings (e.g., "Dark Blue" and "Light Red")
         * Returns a multiplier: > 1.0 is great, 1.0 is neutral, < 1.0 is bad.
         */
        private double compareTwoColors(ColorCategory c1, ColorCategory c2) {
            if (c1 == null || c2 == null) return 1.0;

            // Define Neutrals using an EnumSet for lightning-fast lookups
            EnumSet<ColorCategory> neutrals = EnumSet.of(
                    ColorCategory.BLACK, ColorCategory.WHITE, ColorCategory.GREY,
                    ColorCategory.BEIGE, ColorCategory.BROWN, ColorCategory.CREAM, ColorCategory.NAVY
            );

            // RULE 1: Neutrals
            if (neutrals.contains(c1) && neutrals.contains(c2)) {
                if ((c1 == ColorCategory.BLACK && c2 == ColorCategory.BROWN) ||
                        (c1 == ColorCategory.BROWN && c2 == ColorCategory.BLACK)) {
                    return 0.8; // Slight penalty for Black + Brown
                }
                return 1.1;
            }

            // RULE 2: A Neutral matching with a Bright Color is universally safe (e.g., White + Red)
            if (neutrals.contains(c1) || neutrals.contains(c2)) {
                return 1.05;
            }

            // RULE 3: Monochromatic (Exact same base color)
            if (c1 == c2) {
                return 1.1; // Monochromatic boost
            }

            // RULE 4: The Clashes (Traditional fashion faux pas)
            if (isClashing(c1, c2)) {
                return 0.5; // Heavy penalty
            }

            return 0.95; // Default for non-clashing brights
        }

        // Helper to define hardcoded color clashes
        private boolean isClashing(ColorCategory c1, ColorCategory c2) {
            // Evaluates pairs simultaneously regardless of order
            return (c1 == ColorCategory.RED && c2 == ColorCategory.GREEN) || (c1 == ColorCategory.GREEN && c2 == ColorCategory.RED) ||
                    (c1 == ColorCategory.ORANGE && c2 == ColorCategory.PINK) || (c1 == ColorCategory.PINK && c2 == ColorCategory.ORANGE) ||
                    (c1 == ColorCategory.PURPLE && c2 == ColorCategory.YELLOW) || (c1 == ColorCategory.YELLOW && c2 == ColorCategory.PURPLE) ||
                    (c1 == ColorCategory.RED && c2 == ColorCategory.PINK) || (c1 == ColorCategory.PINK && c2 == ColorCategory.RED);
        }
    }
}
