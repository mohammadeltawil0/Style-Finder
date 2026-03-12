package CS431.Style_Finder.mapper;

import CS431.Style_Finder.dto.TripDto;
import CS431.Style_Finder.model.Trip;
import org.springframework.stereotype.Component;
import CS431.Style_Finder.model.User;

@Component
public class TripMapper {

    public TripDto toDto(Trip trip) {
        return TripDto.builder()
                .tripId(trip.getTripId())
                .userId(trip.getUser().getUserId())
                .tripLocation(trip.getTripLocation())
                .startDate(trip.getStartDate())
                .endDate(trip.getEndDate())
                .build();
    }

    public Trip toEntity(TripDto dto, User user) {
        return Trip.builder()
                .tripId(dto.getTripId())
                .user(user)
                .tripLocation(dto.getTripLocation())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();
    }
}
