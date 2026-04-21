package CS431.Style_Finder.model.converter;

import CS431.Style_Finder.model.enums.MaterialType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class MaterialTypeConverter implements AttributeConverter<MaterialType, String> {

    @Override
    public String convertToDatabaseColumn(MaterialType attribute) {
        if (attribute == null) {
            return null;
        }

        return Integer.toString(attribute.ordinal());
    }

    @Override
    public MaterialType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }

        String cleaned = dbData.trim();

        try {
            int ordinal = Integer.parseInt(cleaned);
            MaterialType[] values = MaterialType.values();
            if (ordinal >= 0 && ordinal < values.length) {
                return values[ordinal];
            }
        } catch (NumberFormatException ignored) {
            // Fall through to enum-name parsing.
        }

        return MaterialType.valueOf(cleaned);
    }
}