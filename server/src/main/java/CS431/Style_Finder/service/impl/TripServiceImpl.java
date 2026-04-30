package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.OutfitSuggestionDto;
import CS431.Style_Finder.dto.TripDayDto;
import CS431.Style_Finder.dto.TripDto;
import CS431.Style_Finder.exception.ResourceNotFoundException;
import CS431.Style_Finder.mapper.TripMapper;
import CS431.Style_Finder.model.*;
import CS431.Style_Finder.repository.*;
import CS431.Style_Finder.service.TripService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMapper tripMapper;
    private final OutfitRepository outfitRepository;
    private final ItemRepository itemRepository;
    private final TripOutfitRepository tripOutfitRepository;
    private final OutfitItemRepository outfitItemRepository;

    @Override
    @Transactional
    public TripDto createTrip(TripDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));

        Trip savedTrip = tripRepository.save(tripMapper.toEntity(dto, user));
        List<TripOutfit> tripOutfits = new ArrayList<>();

        if (dto.getDays() != null) {
            for (TripDayDto day : dto.getDays()) {
                if (day.getOutfits() != null) {
                    for (OutfitSuggestionDto outfitDto : day.getOutfits()) {

                        if (outfitDto.getItemIds() == null || outfitDto.getItemIds().isEmpty()) {
                            continue;
                        }

                        Outfit outfit = new Outfit();
                        outfit.setUser(user);
                        outfit.setSaved(true);
                        outfit.setIsTripOutfit(true);
                        outfit.setComments("Generated for Trip: " + dto.getTripLocation());

                        Outfit savedOutfit = outfitRepository.save(outfit);

                        ArrayList<OutfitItem> outfitItems = new ArrayList<>();
                        for (int i = 0; i < outfitDto.getItemIds().size(); i++) {
                            OutfitItem outfitItem = new OutfitItem();
                            outfitItem.setItem(itemRepository
                                    .findById(outfitDto.getItemIds().get(i)).orElse(null));
                            outfitItem.setOutfit(savedOutfit);
                            outfitItems.add(outfitItem);
                            outfitItemRepository.save(outfitItem);
                        }
                        savedOutfit.setOutfitItems(outfitItems);

                        // Link the Outfit to the Trip with the specific Date
                        TripOutfit tripOutfit = TripOutfit.builder()
                                .trip(savedTrip)
                                .outfit(savedOutfit)
                                .tripDate(day.getDate())
                                .build();

                        tripOutfitRepository.save(tripOutfit);
                        tripOutfits.add(tripOutfit);
                    }
                }
            }
        }

        savedTrip.setTripOutfits(tripOutfits);
        tripRepository.save(savedTrip);
        TripDto tripDto = getTripById(savedTrip.getTripId());

        System.out.println("Saved Trip: " + savedTrip);
        return tripDto;
    }

    @Override
    @Transactional
    public TripDto getTripById(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        TripDto dto = tripMapper.toDto(trip);

        // Fetch all TripOutfit records for this trip
        List<TripOutfit> tripOutfits = trip.getTripOutfits();

        System.out.println("TripOutfits: " + tripOutfits);
        // Group them by Date
        Map<LocalDate, List<OutfitSuggestionDto>> grouped = tripOutfits.stream()
                .collect(Collectors.groupingBy(
                        TripOutfit::getTripDate,
                        Collectors.mapping(to -> {
                            // Convert the saved Outfit back to a DTO for the frontend
                            Outfit outfit = to.getOutfit();
                            List<Long> itemIds = outfit.getOutfitItems().stream()
                                    .map(oi -> oi.getItem().getItemId())
                                    .collect(Collectors.toList());

                            OutfitSuggestionDto outDto = new OutfitSuggestionDto();
                            outDto.setItemIds(itemIds);
                            // Generate a temporary ID so the frontend FlatList key extractor doesn't crash
                            outDto.setSuggestionId("trip-outfit-" + outfit.getOutfitId());
                            return outDto;
                        }, Collectors.toList())
                ));

        // Map the grouped data into the new TripDayDto structure
        List<TripDayDto> days = new ArrayList<>();
        for (Map.Entry<LocalDate, List<OutfitSuggestionDto>> entry : grouped.entrySet()) {
            days.add(new TripDayDto(entry.getKey(), entry.getValue()));
        }

        // Ensure they are strictly ordered by date for the frontend UI
        days.sort(Comparator.comparing(TripDayDto::getDate));
        dto.setDays(days);

        return dto;
    }

    @Override
    public List<TripDto> getTripsByUserId(Long userId) {
        // Fix to ensure we map through getTripById so the days and outfits are loaded
        return tripRepository.findByUser_UserId(userId)
                .stream()
                .map(trip -> getTripById(trip.getTripId()))
                .collect(Collectors.toList());
    }

    @Override
    public TripDto updateTrip(Long tripId, TripDto dto) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        trip.setTripLocation(dto.getTripLocation());
        trip.setStartDate(dto.getStartDate());
        trip.setEndDate(dto.getEndDate());
        return tripMapper.toDto(tripRepository.save(trip));
    }

    @Override
    public void deleteTrip(Long tripId) {
        tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        tripRepository.deleteById(tripId);
    }
}