package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.dto.TripDto;
import CS431.Style_Finder.exception.ResourceNotFoundException;
import CS431.Style_Finder.mapper.TripMapper;
import CS431.Style_Finder.model.*;
import CS431.Style_Finder.repository.*;
import CS431.Style_Finder.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final TripMapper tripMapper;

    @Override
    public TripDto createTrip(TripDto dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getUserId()));
        Trip saved = tripRepository.save(tripMapper.toEntity(dto, user));
        return tripMapper.toDto(saved);
    }

    @Override
    public TripDto getTripById(Long tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with id: " + tripId));
        return tripMapper.toDto(trip);
    }

    @Override
    public List<TripDto> getTripsByUserId(Long userId) {
        return tripRepository.findByUser_UserId(userId)
                .stream().map(tripMapper::toDto).collect(Collectors.toList());
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