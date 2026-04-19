package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.FeedbackDto;
import CS431.Style_Finder.dto.FilterRequestDto;
import CS431.Style_Finder.dto.OutfitSuggestionDto;
import CS431.Style_Finder.service.AlgorithmService;
import CS431.Style_Finder.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/suggestions")
public class SuggestionController {
    private final AlgorithmService algorithmService;
    private final FeedbackService feedbackService;

    @PostMapping("/hub/{userId}")
    public ResponseEntity<List<OutfitSuggestionDto>> getHub(
            @PathVariable Long userId,
            @RequestBody FilterRequestDto filter) {
        return ResponseEntity.ok(
                algorithmService.generateSuggestionHub(userId, filter.getLocation(),
                        filter.getEvent(), filter.isMemory()));
    }

    @PostMapping("/feedback")
    public ResponseEntity<Void> submitFeedback(@RequestBody FeedbackDto feedback) {
        feedbackService.processFeedback(feedback);
        System.out.println("Feedback received: " + feedback.getSuggestionId());
        return ResponseEntity.ok().build();
    }
}
