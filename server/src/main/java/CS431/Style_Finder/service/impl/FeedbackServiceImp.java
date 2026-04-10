package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.FeedbackDto;
import CS431.Style_Finder.model.*;
import CS431.Style_Finder.model.enums.ItemType;
import CS431.Style_Finder.repository.*;
import CS431.Style_Finder.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImp implements FeedbackService {
    private final OutfitCaseRepository cbrDb;
    private final ItemRepository wardrobeDb;
    private final UserWeightsRepository weightsDb;
    private final OutfitRepository outfitRepository;
    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    @Transactional
    public void processFeedback(FeedbackDto feedback) {
        UserWeights vw = weightsDb.findById(feedback.getUserId())
                .orElseThrow(() -> new RuntimeException("User weights not found."));

        // EXPLICIT MEMORY: Create a new CBR Case
        if (feedback.getAction().equals("SAVE") || feedback.getAction().equals("EDIT_SAVE")) {
            OutfitCase newMemory = new OutfitCase();
            newMemory.setUserId(feedback.getUserId());
            newMemory.setTemperature(feedback.getContextTemp());
            newMemory.setOccasion(feedback.getContextOccasion());
            newMemory.setItemIds(feedback.getFinalItemIds());
            newMemory.setRating(5);
            cbrDb.save(newMemory);

            Outfit outfit = new Outfit();
            outfit.setSaved(true);
            ArrayList<OutfitItem> outfitItems = new ArrayList<>();
            for (int i = 0; i < feedback.getOriginalItemIds().size(); i++) {
                OutfitItem outfitItem = new OutfitItem();
                outfitItem.setItem(itemRepository.
                        findById(feedback.getOriginalItemIds().get(i)).orElse(null));
                outfitItem.setOutfit(outfit);
                outfitItems.add(outfitItem);
            }
            outfit.setOutfitItems(outfitItems);
            outfit.setUser(userRepository.findById(feedback.getUserId()).orElse(null));
            outfitRepository.save(outfit);
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
        // Enums allow us to use == instead of .equals() for the filter
        Item suggestedTop = suggested.stream().filter(i -> i.getType() == ItemType.TOP).findFirst().orElse(null);
        Item actualTop = (actual != null) ? actual.stream().filter(i -> i.getType() == ItemType.TOP).findFirst().orElse(null) : null;

        if (suggestedTop != null) {
            // Adjust Fit Weights
            if (actualTop != null && suggestedTop.getFit() != actualTop.getFit()) {
                adjustWeight(vw.getFitWeights(), suggestedTop.getFit(), -delta);
                adjustWeight(vw.getFitWeights(), actualTop.getFit(), delta);
            } else if (actualTop == null) {
                adjustWeight(vw.getFitWeights(), suggestedTop.getFit(), delta);
            }

            // Adjust Color Weights
            if (actualTop != null && suggestedTop.getColorCategory() != actualTop.getColorCategory()) {
                adjustWeight(vw.getColorWeights(), suggestedTop.getColorCategory(), -delta);
                adjustWeight(vw.getColorWeights(), actualTop.getColorCategory(), delta);
            } else if (actualTop == null) {
                adjustWeight(vw.getColorWeights(), suggestedTop.getColorCategory(), delta);
            }

            // Adjust Pattern Weights
            if (actualTop != null && suggestedTop.getPattern() != actualTop.getPattern()) {
                adjustWeight(vw.getPatternWeights(), suggestedTop.getPattern(), -delta);
                adjustWeight(vw.getPatternWeights(), actualTop.getPattern(), delta);
            } else if (actualTop == null) {
                adjustWeight(vw.getPatternWeights(), suggestedTop.getPattern(), delta);
            }

            // Adjust Material Weights
            if (actualTop != null && suggestedTop.getMaterial() != actualTop.getMaterial()) {
                adjustWeight(vw.getMaterialWeights(), suggestedTop.getMaterial(), -delta);
                adjustWeight(vw.getMaterialWeights(), actualTop.getMaterial(), delta);
            } else if (actualTop == null) {
                adjustWeight(vw.getMaterialWeights(), suggestedTop.getMaterial(), delta);
            }
        }
    }

    // Generic Enum setter
    private <T extends Enum<T>> void adjustWeight(Map<T, Double> map, T key, double delta) {
        if (key == null) return;
        double current = map.getOrDefault(key, 1.0);
        double newWeight = Math.max(0.1, Math.min(2.0, current + delta));
        map.put(key, newWeight);
    }
}
