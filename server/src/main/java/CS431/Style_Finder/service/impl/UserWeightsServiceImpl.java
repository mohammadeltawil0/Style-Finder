package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.service.UserWeightsService;
import CS431.Style_Finder.dto.SurveyWeightsUpdateDto;
import CS431.Style_Finder.mapper.UserWeightsMapper;
import CS431.Style_Finder.model.User;
import CS431.Style_Finder.model.UserWeights;
import CS431.Style_Finder.repository.UserRepository;
import CS431.Style_Finder.repository.UserWeightsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserWeightsServiceImpl implements UserWeightsService {
    private final UserWeightsRepository userWeightsRepository;
    private final UserRepository userRepository;
    private final UserWeightsMapper weightsMapper;

    @Override
    @Transactional
    public void updateWeightsFromSurvey(SurveyWeightsUpdateDto payload) {
        // 1. Ensure the user exists
        User user = userRepository.findById(payload.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + payload.getUserId()));

        // 2. Fetch existing weights or create a new one if it's their first time
        UserWeights vw = userWeightsRepository.findUserWeightsByUser_UserId(user.getUserId())
                .orElseGet(() -> {
                    UserWeights newWeights = new UserWeights();
                    newWeights.setUser(user);
                    user.setUserWeights(newWeights);
                    return newWeights;
                });

        // 3. Use the mapper to translate the raw strings into Enum weights
        weightsMapper.mapSurveyToWeights(payload, vw);

        // 4. Save the updated algorithm profile
        userWeightsRepository.save(vw);
    }
}
