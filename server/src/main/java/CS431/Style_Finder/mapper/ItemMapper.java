package CS431.Style_Finder.mapper;

import CS431.Style_Finder.dto.ItemDto;
import CS431.Style_Finder.model.Item;
import CS431.Style_Finder.model.User;
import CS431.Style_Finder.model.enums.*;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;


@Component
public class ItemMapper {

    // 1. Define the standard HEX anchors for your ColorCategory Enum
    private static final Map<ColorCategory, int[]> COLOR_ANCHORS = new HashMap<>();

    static {
        // Neutrals
        COLOR_ANCHORS.put(ColorCategory.BLACK, hexToRgb("#000000"));
        COLOR_ANCHORS.put(ColorCategory.WHITE, hexToRgb("#FFFFFF"));
        COLOR_ANCHORS.put(ColorCategory.GREY, hexToRgb("#808080"));
        COLOR_ANCHORS.put(ColorCategory.BEIGE, hexToRgb("#F5F5DC"));
        COLOR_ANCHORS.put(ColorCategory.BROWN, hexToRgb("#8B4513"));
        COLOR_ANCHORS.put(ColorCategory.CREAM, hexToRgb("#FFFDD0"));
        COLOR_ANCHORS.put(ColorCategory.NAVY, hexToRgb("#000080"));

        // Cool & Warm Tones
        COLOR_ANCHORS.put(ColorCategory.BLUE, hexToRgb("#0000FF"));
        COLOR_ANCHORS.put(ColorCategory.RED, hexToRgb("#FF0000"));
        COLOR_ANCHORS.put(ColorCategory.GREEN, hexToRgb("#008000"));
        COLOR_ANCHORS.put(ColorCategory.YELLOW, hexToRgb("#FFFF00"));
        COLOR_ANCHORS.put(ColorCategory.PURPLE, hexToRgb("#800080"));
        COLOR_ANCHORS.put(ColorCategory.ORANGE, hexToRgb("#FFA500"));
        COLOR_ANCHORS.put(ColorCategory.PINK, hexToRgb("#FFC0CB"));

        // Earth Tones
        COLOR_ANCHORS.put(ColorCategory.OLIVE, hexToRgb("#808000"));
        COLOR_ANCHORS.put(ColorCategory.RUST, hexToRgb("#B7410E"));
    }

    public ItemDto toDto(Item item) {
        return ItemDto.builder()
                .itemId(item.getItemId())
                .userId(item.getUser().getUserId())
                .type(item.getType())
                .color(item.getColor())
                .pattern(item.getPattern())
                .length(item.getLength())
                .material(item.getMaterial())
                .bulk(item.getBulk())
                .seasonWear(item.getSeasonWear())
                .formality(item.getFormality())
                .fit(item.getFit())
                .timesWorn(item.getTimesWorn())
                .imageUrl(item.getImageUrl())
                .build();
    }

    public Item toEntity(ItemDto dto, User user) {
        Item temp = Item.builder()
                .itemId(dto.getItemId())
                .user(user)
                .type(dto.getType())
                .color(dto.getColor())
                .colorCategory(determineColorCategory(dto.getColor()))
                .pattern(dto.getPattern())
                .length(dto.getLength())
                .material(dto.getMaterial())
                .bulk(dto.getBulk())
                .seasonWear(dto.getSeasonWear())
                .formality(dto.getFormality())
                .fit(dto.getFit())
                .timesWorn(dto.getTimesWorn())
                .imageUrl(dto.getImageUrl())
                .build();
        if (dto.getTimesWorn() == null) temp.setTimesWorn(0);
        else temp.setTimesWorn(dto.getTimesWorn());
        if (dto.getImageUrl() == null) temp.setImageUrl("https://i.imgur.com/0000000.png");
        else temp.setImageUrl(dto.getImageUrl());
        return temp;
    }

    private ColorCategory determineColorCategory(String hexColor) {
        if (hexColor == null || !hexColor.startsWith("#") || hexColor.length() != 7) {
            return null; // Handle patterns with no specific color
        }

        int[] targetRgb = hexToRgb(hexColor);
        ColorCategory closestCategory = null;
        double minDistance = Double.MAX_VALUE;

        // Find the closest standard color using 3D Euclidean distance in RGB space
        for (Map.Entry<ColorCategory, int[]> entry : COLOR_ANCHORS.entrySet()) {
            double distance = calculateColorDistance(targetRgb, entry.getValue());
            if (distance < minDistance) {
                minDistance = distance;
                closestCategory = entry.getKey();
            }
        }
        return closestCategory;
    }

    private static int[] hexToRgb(String hex) {
        return new int[]{
                Integer.valueOf(hex.substring(1, 3), 16),
                Integer.valueOf(hex.substring(3, 5), 16),
                Integer.valueOf(hex.substring(5, 7), 16)
        };
    }

    private double calculateColorDistance(int[] rgb1, int[] rgb2) {
        long rDiff = rgb1[0] - rgb2[0];
        long gDiff = rgb1[1] - rgb2[1];
        long bDiff = rgb1[2] - rgb2[2];
        // Standard Euclidean distance squared (sufficient for finding the minimum)
        return rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
    }
}
