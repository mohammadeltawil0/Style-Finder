package CS431.Style_Finder.controller;
import CS431.Style_Finder.dto.SurveyWeightsUpdateDto;
import CS431.Style_Finder.service.UserWeightsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/weights")
public class UserWeightsController {

    private final UserWeightsService userWeightsService;

    @PostMapping("/update")
    public ResponseEntity<String> updateWeights(@RequestBody SurveyWeightsUpdateDto payload) {
        try {
            userWeightsService.updateWeightsFromSurvey(payload);
            return ResponseEntity.ok("Algorithm weights successfully updated.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update weights: " + e.getMessage());
        }
    }
}