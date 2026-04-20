package CS431.Style_Finder.mapper;

import CS431.Style_Finder.dto.SurveyWeightsUpdateDto;
import CS431.Style_Finder.model.UserWeights;
import CS431.Style_Finder.model.enums.ColorCategory;
import CS431.Style_Finder.model.enums.Fit;
import CS431.Style_Finder.model.enums.MaterialType;
import CS431.Style_Finder.model.enums.PatternType;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
public class UserWeightsMapper {
    public void mapSurveyToWeights(SurveyWeightsUpdateDto dto, UserWeights vw) {

// 1. Map Comfort vs Style
        if ("Comfort is my top priority".equals(dto.getComfort())) {
            vw.getFitWeights().put(Fit.LOOSE, 1.2);
            vw.getFitWeights().put(Fit.REGULAR, 1.2);
            vw.getFitWeights().put(Fit.SLIM, 0.5);
        } else if ("Style over comfort".equals(dto.getComfort())) {
            vw.getFitWeights().put(Fit.SLIM, 1.3);
        }

        // 2. Map Weather (Thermal Bias)
        if ("Always prioritize weather".equals(dto.getWeather())) {
            vw.setThermalBias(1.5);
        } else if ("Style over weather".equals(dto.getWeather())) {
            vw.setThermalBias(0.5);
        } else {
            vw.setThermalBias(1.0);
        }

        // 3. Map Everyday Style (Exhaustive List)
        if (dto.getStyle() != null) {
            for (String style : dto.getStyle()) {
                switch (style) {
                    case "Minimalist" -> {
                        // vw.setPatternTolerance(0.1);
                        vw.setColorHarmonyWeight(1.5);
                        vw.getPatternWeights().put(PatternType.SOLID, 1.5);
                    }
                    case "Trendy / Fashion-forward", "Edgy" -> {
                        // vw.setPatternTolerance(1.2);
                        vw.setColorHarmonyWeight(0.7);
                    }
                    case "Casual & Comfortable", "Sporty / Athleisure" -> {
                        vw.getFitWeights().put(Fit.LOOSE, 1.3);
                        vw.getMaterialWeights().put(MaterialType.COTTON, 1.3);
                        vw.getMaterialWeights().put(MaterialType.FLEECE, 1.3);
                    }
                    case "Business / Professional" -> {
                        vw.getFitWeights().put(Fit.REGULAR, 1.3);
                        vw.getFitWeights().put(Fit.SLIM, 1.2);
                        vw.getPatternWeights().put(PatternType.GRAPHIC, 0.2); // Penalty
                    }
                    case "Streetwear" -> {
                        vw.getFitWeights().put(Fit.LOOSE, 1.5);
                        vw.getPatternWeights().put(PatternType.GRAPHIC, 1.3);
                    }
                    case "Preppy" -> {
                        vw.getPatternWeights().put(PatternType.PLAID_OR_FLANNEL, 1.4);
                        vw.getPatternWeights().put(PatternType.STRIPED, 1.2);
                    }
                }
            }
        }

        // 4. Map Preferred Fit
        if (dto.getPreferFit() != null) {
            switch (dto.getPreferFit()) {
                case "Loose/Oversized" -> vw.getFitWeights().put(Fit.LOOSE, 1.5);
                case "Relaxed", "Structured/Tailored" -> vw.getFitWeights().put(Fit.REGULAR, 1.5);
                case "Fitted" -> vw.getFitWeights().put(Fit.SLIM, 1.5);
            }
        }

        // 5. Map Dealbreakers (Avoid Items) & Apply Absolute 0.0 Penalties
        if (dto.getAvoidItems() != null) {
            vw.setDealbreakers(dto.getAvoidItems());

            if (dto.getAvoidItems().contains("Skinny Jeans")) {
                vw.getFitWeights().put(Fit.SLIM, 0.0); // 0.0 = Dealbreaker
            }
            if (dto.getAvoidItems().contains("Baggy / Oversized Clothes")) {
                vw.getFitWeights().put(Fit.LOOSE, 0.0);
            }
            if (dto.getAvoidItems().contains("Bright Neon Colors")) {
                // Penalize extremely bright tones
                vw.getColorWeights().put(ColorCategory.YELLOW, 0.2);
                vw.getColorWeights().put(ColorCategory.PINK, 0.2);
            }
        }

        // 6. Map Color Preferences
        applyColorPalettes(vw.getColorWeights(), dto.getColorsWear(), 1.5);  // Boost
        applyColorPalettes(vw.getColorWeights(), dto.getColorsAvoid(), 0.1); // Dealbreaker/Penalty
    }

    // Helper to translate "Palettes" from UI into individual Enum base colors
    private void applyColorPalettes(Map<ColorCategory, Double> colorMap, List<String> palettes, double weightValue) {
        if (palettes == null) return;

        for (String palette : palettes) {
            switch (palette) {
                case "Neutral tones" -> Arrays.asList(ColorCategory.BLACK, ColorCategory.WHITE, ColorCategory.GREY, ColorCategory.BEIGE)
                        .forEach(c -> colorMap.put(c, weightValue));
                case "Earth tones" -> Arrays.asList(ColorCategory.OLIVE, ColorCategory.BROWN, ColorCategory.RUST, ColorCategory.GREEN)
                        .forEach(c -> colorMap.put(c, weightValue));
                case "Cool tones" -> Arrays.asList(ColorCategory.BLUE, ColorCategory.PURPLE, ColorCategory.GREEN)
                        .forEach(c -> colorMap.put(c, weightValue));
                case "Warm tones" -> Arrays.asList(ColorCategory.RED, ColorCategory.ORANGE, ColorCategory.YELLOW)
                        .forEach(c -> colorMap.put(c, weightValue));
                case "Pastels" -> Arrays.asList(ColorCategory.PINK, ColorCategory.CREAM)
                        .forEach(c -> colorMap.put(c, weightValue));
                case "Bright colors" -> Arrays.asList(ColorCategory.RED, ColorCategory.YELLOW, ColorCategory.ORANGE, ColorCategory.PINK)
                        .forEach(c -> colorMap.put(c, weightValue));
            }
        }
    }
}

