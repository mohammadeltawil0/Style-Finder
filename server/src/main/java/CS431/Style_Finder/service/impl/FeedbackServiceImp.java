package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.FeedbackDTO;
import CS431.Style_Finder.model.Item;
import CS431.Style_Finder.model.OutfitCase;
import CS431.Style_Finder.model.UserWeights;
import CS431.Style_Finder.repository.ItemRepository;
import CS431.Style_Finder.repository.OutfitCaseRepository;
import CS431.Style_Finder.repository.UserWeightsRepository;
import CS431.Style_Finder.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImp implements FeedbackService {
    private final OutfitCaseRepository cbrDb;
    private final ItemRepository wardrobeDb;
    private final UserWeightsRepository weightsDb;

    @Transactional
    public void processFeedback(FeedbackDTO feedback) {
        UserWeights vw = weightsDb.findById(feedback.getUserId()).orElseThrow(() -> new RuntimeException("User weights not found."));

        // EXPLICIT MEMORY: Create a new CBR Case
        if (feedback.getAction().equals("SAVE") || feedback.getAction().equals("EDIT_SAVE")) {
            OutfitCase newMemory = new OutfitCase();
            newMemory.setUserId(feedback.getUserId());
            newMemory.setTemperature(feedback.getContextTemp());
            newMemory.setOccasion(feedback.getContextOccasion());
            newMemory.setItemIds(feedback.getFinalItemIds());
            newMemory.setRating(5);
            cbrDb.save(newMemory);
        }

        // IMPLICIT MEMORY: Gradient Descent
        if (feedback.getAction().equals("EDIT_SAVE")) {
            List<Item> suggestedItems = wardrobeDb.findAllById(feedback.getOriginalItemIds());
            List<Item> finalItems = wardrobeDb.findAllById(feedback.getFinalItemIds());
            applyGradientDescent(vw, suggestedItems, finalItems, 0.1);
            weightsDb.save(vw);
        }
        else if (feedback.getAction().equals("REJECT")) {
            List<Item> rejectedItems = wardrobeDb.findAllById(feedback.getOriginalItemIds());
            applyGradientDescent(vw, rejectedItems, null, -0.05);
            weightsDb.save(vw);
        }
    }

    private void applyGradientDescent(UserWeights vw, List<Item> suggested, List<Item> actual, double delta) {
        Item suggestedTop = suggested.stream().filter(i -> "TOP".equals(i.getType().name())).findFirst().orElse(null);
        Item actualTop = (actual != null) ? actual.stream().filter(i -> "TOP".equals(i.getType().name())).findFirst().orElse(null) : null;

        if (suggestedTop != null) {
            // Adjust Fit Weights
            if (actualTop != null && !suggestedTop.getFit().equals(actualTop.getFit())) {
                adjustWeight(vw.getFitWeights(), suggestedTop.getFit().toString(), -delta);
                adjustWeight(vw.getFitWeights(), String.valueOf(actualTop.getFit()), delta);
            } else if (actualTop == null) {
                adjustWeight(vw.getFitWeights(), String.valueOf(suggestedTop.getFit()), delta);
            }

            // Adjust Color Weights
            if (actualTop != null && !suggestedTop.getColorCategory().equals(actualTop.getColorCategory())) {
                adjustWeight(vw.getColorWeights(), suggestedTop.getColorCategory(), -delta);
                adjustWeight(vw.getColorWeights(), actualTop.getColorCategory(), delta);
            } else if (actualTop == null) {
                adjustWeight(vw.getColorWeights(), suggestedTop.getColorCategory(), delta);
            }

            // Adjust Pattern Weights
            if (actualTop != null && !suggestedTop.getPattern().equals(actualTop.getPattern())) {
                adjustWeight(vw.getPatternWeights(), suggestedTop.getPattern().name(), -delta);
                adjustWeight(vw.getPatternWeights(), actualTop.getPattern().name(), delta);
            } else if (actualTop == null) {
                adjustWeight(vw.getPatternWeights(), suggestedTop.getPattern().name(), delta);
            }
        }
    }

    private void adjustWeight(Map<String, Double> map, String key, double delta) {
        if (key == null) return;
        double current = map.getOrDefault(key, 1.0);
        double newWeight = Math.max(0.1, Math.min(2.0, current + delta));
        map.put(key, newWeight);
    }
}
