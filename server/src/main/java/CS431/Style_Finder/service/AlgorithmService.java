package CS431.Style_Finder.service;
import CS431.Style_Finder.dto.OutfitSuggestionDTO;
import java.util.List;

public interface AlgorithmService {
    List<OutfitSuggestionDTO> generateSuggestionHub(Long userId, String location, String event);
}
