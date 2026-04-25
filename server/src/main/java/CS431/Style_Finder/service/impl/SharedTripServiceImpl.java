package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.TripShareDto;
import CS431.Style_Finder.dto.TripDayDto;
import CS431.Style_Finder.model.SharedTrip;
import CS431.Style_Finder.model.Trip;
import CS431.Style_Finder.model.TripOutfit;
import CS431.Style_Finder.repository.SharedTripRepository;
import CS431.Style_Finder.repository.TripRepository;
import CS431.Style_Finder.service.SharedTripService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;



@Service
@RequiredArgsConstructor
public class SharedTripServiceImpl implements SharedTripService {

    private final SharedTripRepository sharedTripRepository;
    private final TripRepository tripRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    // 🔥 CREATE SHARE LINK
    @Override
    public TripShareDto createShareLink(Long tripId) {

        Trip trip = tripRepository.findById(tripId).orElseThrow(() -> new RuntimeException("Trip not found"));
        Optional<SharedTrip> existing = sharedTripRepository.findByTrip_TripId(tripId);

        if (existing.isPresent()) {
            SharedTrip shared = existing.get();
            if (!shared.isActive()) {
                shared.setActive(true);
                sharedTripRepository.save(shared);
            }

            return buildDto(shared);
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

        SharedTrip shared = sharedTripRepository.findByShareToken(token).orElseThrow(() -> new RuntimeException("Invalid share link"));

        if (!shared.isActive()) {
            throw new RuntimeException("This link has been disabled");
        }

        Trip trip = shared.getTrip();
        Map<LocalDate, List<String>> dayMap = new HashMap<>();

        for (TripOutfit to : trip.getTripOutfits()) {

            LocalDate date = to.getTripDate();
            List<String> images = to.getOutfit().getOutfitItems().stream().map(oi -> oi.getItem().getImageUrl()).filter(Objects::nonNull).toList();
            dayMap.computeIfAbsent(date, k -> new ArrayList<>()).addAll(images);
        }

        List<TripDayDto> days = dayMap.entrySet().stream()
                .map(entry -> {
                    TripDayDto d = new TripDayDto();
                    d.setDate(entry.getKey());
                    d.setImageUrls(entry.getValue());
                    return d;
                })
                .sorted(Comparator.comparing(TripDayDto::getDate))
                .toList();

        return TripShareDto.builder()
                .tripLocation(trip.getTripLocation())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .days(days)
                .build();
    }

    @Override
    public void revokeShareLink(String token) {

        SharedTrip shared = sharedTripRepository.findByShareToken(token).orElseThrow(() -> new RuntimeException("Invalid share link"));
        shared.setActive(false);
        sharedTripRepository.save(shared);
    }

    private TripShareDto buildDto(SharedTrip shared) {
        return TripShareDto.builder()
                .shareLink(baseUrl + "/api/share/trip/view/" + shared.getShareToken())
                .token(shared.getShareToken())
                .build();
    }
}