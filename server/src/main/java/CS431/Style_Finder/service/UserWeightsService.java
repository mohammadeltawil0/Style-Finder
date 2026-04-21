package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.SurveyWeightsUpdateDto;

public interface UserWeightsService {
    void updateWeightsFromSurvey(SurveyWeightsUpdateDto payload);
}
