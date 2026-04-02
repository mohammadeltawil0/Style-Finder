package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.OutfitSuggestionDTO;
import CS431.Style_Finder.mapper.OutfitMapper;
import CS431.Style_Finder.model.Item;
import CS431.Style_Finder.model.OutfitCase;
import CS431.Style_Finder.model.UserWeights;
import CS431.Style_Finder.repository.ItemRepository;
import CS431.Style_Finder.repository.OutfitCaseRepository;
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
    private final WeatherService weatherService;
    private final OutfitMapper mapper;

    @Override
    // Method to generate a list of outfits based on user weights, weather conditions, and occasion.
    public List<OutfitSuggestionDTO> generateSuggestionHub(Long userId, String location, String event) {
        List<OutfitSuggestionDTO> hub = new ArrayList<>();
        UserWeights vw = weightsDb.findUserWeightsByUser_UserId(userId).orElseThrow(() -> new RuntimeException("User weights not found."));

        WeatherService.WeatherContext weather = weatherService.getWeatherForLocation(location);
        String occasion = (event != null && !event.isEmpty()) ? event : "Casual";

        // PHASE 1: Episodic Retrieval (CBR)
        List<OutfitCase> memories = cbrDb.findMatchingMemory(userId, occasion, weather.temp() - 5, weather.temp() + 5);
        for (OutfitCase memory : memories) {
            if (hub.size() < 15) {
                hub.add(mapper.toDto(memory));
            }
        }

        // PHASE 2: Parametric Generation
        if (hub.size() < 15) {
            List<Item> closet = wardrobeDb.findByUser_UserId(userId);
            List<OutfitSuggestionDTO> generated = runParametricFallback(closet, vw, weather.temp(), occasion, 15 - hub.size());
            hub.addAll(generated);
        }
        return hub;
    }

    private List<OutfitSuggestionDTO> runParametricFallback(List<Item> closet, UserWeights vw, int targetTemp, String occasion, int limit) {
        List<OutfitSuggestionDTO> validOutfits = new ArrayList<>();
        List<OutfitCombo> allCombos = generateCombinations(closet);

        for (OutfitCombo combo : allCombos) {
            // 1. HARD CONSTRAINTS
            if (combo.over() != null && combo.over().getBulk() < combo.top().getBulk()) continue;
            if (getWeight(vw.getFitWeights(), String.valueOf(combo.bottom().getFit())) == 0.0) continue;
            if (occasion.equals("Formal") && combo.top().getFormality().equals("Casual")) continue;

            // 2. THE GRANULAR SCORING FUNCTION
            double thermalScore = Math.abs(targetTemp - combo.calculateTotalWarmth()) * vw.getThermalBias();

            double colorHarmonyScore = combo.calculateColorHarmony() * vw.getColorHarmonyWeight();
            double specificColorScore = evaluateComboAverage(vw.getColorWeights(), combo.top().getColorCategory(), combo.bottom().getColorCategory());

            double fitScore = evaluateComboAverage(vw.getFitWeights(), combo.top().getFit().toString(), combo.bottom().getFit().toString());
            double patternScore = evaluateComboAverage(vw.getPatternWeights(), combo.top().getPattern(), combo.bottom().getPattern());
            double materialScore = evaluateComboAverage(vw.getMaterialWeights(), combo.top().getMaterial().toString(), combo.bottom().getMaterial().toString());

            double finalScore = (fitScore + patternScore + materialScore + colorHarmonyScore + specificColorScore) - thermalScore;

            OutfitSuggestionDTO dto = new OutfitSuggestionDTO();
            dto.setSuggestionId(UUID.randomUUID().toString());
            dto.setItemIds(combo.getItemIds());
            dto.setScore(finalScore);
            dto.setGenerationSource("PARAMETRIC");

            validOutfits.add(dto);
        }

        validOutfits.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        return validOutfits.subList(0, Math.min(limit, validOutfits.size()));
    }

    private double getWeight(Map<String, Double> weightMap, String attribute) {
        if (attribute == null) return 1.0;
        return weightMap.getOrDefault(attribute, 1.0);
    }

    private double evaluateComboAverage(Map<String, Double> weightMap, String topAttr, String bottomAttr) {
        if (weightMap == null) return 1.0;
        if (topAttr != null && bottomAttr != null) {
            double topWeight = getWeight(weightMap, topAttr);
            double bottomWeight = getWeight(weightMap, bottomAttr);

            if (topWeight == 0.0 || bottomWeight == 0.0) {
                return 0.0;
            }
            return (topWeight + bottomWeight) / 2.0;
        }
        if (topAttr != null) {
            return getWeight(weightMap, topAttr);
        }
        if (bottomAttr != null) {
            return getWeight(weightMap, bottomAttr);
        }
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
                case "FULLBODY": fullBodies.add(item); break;
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
            String topColor = (top != null) ? top.getColorCategory() : ((fullBody != null) ? fullBody.getColorCategory() : null);
            String bottomColor = (bottom != null) ? bottom.getColorCategory() : null;
            String overColor = (over != null) ? over.getColorCategory() : null;

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
        private double compareTwoColors(String color1, String color2) {
            if (color1 == null || color2 == null) return 1.0;

            String[] parts1 = color1.split(" ");
            String[] parts2 = color2.split(" ");

            String base1 = parts1[parts1.length - 1].toLowerCase();
            String base2 = parts2[parts2.length - 1].toLowerCase();

            List<String> neutrals = Arrays.asList("black", "white", "grey", "gray", "beige", "brown", "cream", "navy");

            // RULE 1: Neutrals matching with Neutrals is very safe and stylish (e.g., Black + Grey)
            if (neutrals.contains(base1) && neutrals.contains(base2)) {
                // Minor fashion rule: Black and Brown traditionally clash unless managed well.
                if ((base1.equals("black") && base2.equals("brown")) || (base1.equals("brown") && base2.equals("black"))) {
                    return 0.8; // Slight penalty
                }
                return 1.1;
            }

            // RULE 2: A Neutral matching with a Bright Color is universally safe (e.g., White + Red)
            if (neutrals.contains(base1) || neutrals.contains(base2)) {
                return 1.05;
            }

            // RULE 3: Monochromatic Harmony (Same base color, different shades)
            // E.g., "Light Blue" + "Dark Blue" looks fantastic.
            if (base1.equals(base2)) {
                // If they are the exact same shade and base (e.g., Standard Red + Standard Red)
                if (color1.equalsIgnoreCase(color2)) {
                    return 0.9; // Looks a bit like a uniform, slight penalty
                }
                return 1.2; // Monochromatic boost!
            }

            // RULE 4: The Clashes (Traditional fashion faux pas)
            if (isClashing(base1, base2)) {
                return 0.5; // Heavy penalty. Will likely drop the outfit out of the top 15.
            }

            // Default: Two different, non-clashing bright colors (e.g., Blue + Yellow)
            return 0.95;
        }

        // Helper to define hardcoded color clashes
        private boolean isClashing(String base1, String base2) {
            String pair = base1 + "-" + base2;
            String reversePair = base2 + "-" + base1;

            List<String> clashingPairs = Arrays.asList(
                    "red-green",    // Christmas tree effect
                    "orange-pink",  // Visual vibration
                    "purple-yellow",// Highly jarring contrast
                    "red-pink"      // Too close on the color wheel, but not monochromatic
            );

            return clashingPairs.contains(pair) || clashingPairs.contains(reversePair);
        }
    }
}
