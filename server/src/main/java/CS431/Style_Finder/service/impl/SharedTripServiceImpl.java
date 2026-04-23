package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.*;
import CS431.Style_Finder.model.*;
import CS431.Style_Finder.repository.*;
import CS431.Style_Finder.service.SharedTripService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Comparator;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SharedTripServiceImpl implements SharedTripService {

    private final SharedTripRepository sharedTripRepository;
    private final TripRepository tripRepository;

    @Override
    public TripShareDto createShareLink(Long tripId) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));

        Optional<SharedTrip> existing =
                sharedTripRepository.findByTrip_TripId(tripId);

        if (existing.isPresent()) {
            return buildDto(existing.get());
        }

        String token = UUID.randomUUID().toString();

        SharedTrip shared = SharedTrip.builder()
                .trip(trip)
                .shareToken(token)
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();

        sharedTripRepository.save(shared);

        return buildDto(shared);
    }
    @Override
    @Transactional
    public TripShareDto getSharedTrip(String token) {

        SharedTrip shared = sharedTripRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid link"));

        if (!shared.isActive()) {
            throw new RuntimeException("Link disabled");
        }

        return buildDto(shared);
    }
    @Override
    public void revokeShareLink(String token) {

        SharedTrip shared = sharedTripRepository.findByShareToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid link"));

        shared.setActive(false);
        sharedTripRepository.save(shared);
    }
    private TripShareDto buildDto(SharedTrip shared) {

        Trip trip = shared.getTrip();
        return TripShareDto.builder()
        .tripId(trip.getTripId())
        .token(shared.getShareToken())
        .shareLink("https://api.stylefinder.tech/api/share/trip/" + shared.getShareToken())
        .days(trip.getTripOutfits() != null ? trip.getTripOutfits().stream().sorted(Comparator.comparing(TripOutfit::getTripDate))
        .map(tripOutfit -> TripDayDto.builder()
        .date(tripOutfit.getTripDate())
        .outfit(tripOutfit.getOutfit() != null ? mapToOutfitDto(tripOutfit.getOutfit()) : null).build()).toList(): null)
        .build();
    }

    private OutfitDto mapToOutfitDto(Outfit outfit) {
        return OutfitDto.builder()
                .outfitId(outfit.getOutfitId())
                .userId(outfit.getUser() != null ? outfit.getUser().getUserId() : null)
                .saved(outfit.getSaved())
                .comments(outfit.getComments())
                .createdAt(outfit.getCreatedAt())
                .itemIds(
                        outfit.getOutfitItems() != null
                                ? outfit.getOutfitItems().stream()
                                .map(oi -> oi.getItem().getItemId())
                                .toList()
                                : null
                )
                .coverImageUrl(
                        outfit.getOutfitItems() != null && !outfit.getOutfitItems().isEmpty()
                                ? outfit.getOutfitItems().get(0).getItem().getImageUrl()
                                : null
                )
                .build();
    }
}