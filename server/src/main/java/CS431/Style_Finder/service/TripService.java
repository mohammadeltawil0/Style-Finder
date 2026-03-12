package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.OutfitDto;
import CS431.Style_Finder.dto.TripDto;

import java.util.List;
import java.util.Map;

public interface TripService {
    TripDto createTrip(TripDto dto);
    TripDto getTripById(Long tripId);
    List<TripDto> getTripsByUserId(Long userId);
    TripDto updateTrip(Long tripId, TripDto dto);
    void deleteTrip(Long tripId);
}