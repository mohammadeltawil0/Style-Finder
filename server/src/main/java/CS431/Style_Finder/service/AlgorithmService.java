package CS431.Style_Finder.service;
import CS431.Style_Finder.dto.OutfitSuggestionDto;
import java.util.List;

public interface AlgorithmService {
    List<OutfitSuggestionDto> generateSuggestionHub(Long userId, String location, String event, boolean useMemory);

    List<OutfitSuggestionDto> generateTripSuggestions(Long userId, String location, String event, int totalOutfits);
}
