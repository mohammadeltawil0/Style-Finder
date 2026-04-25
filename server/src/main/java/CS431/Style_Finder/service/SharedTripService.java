package CS431.Style_Finder.service;

import CS431.Style_Finder.dto.TripShareDto;

public interface SharedTripService {

    // Create share link
    TripShareDto createShareLink(Long tripId);

    // Get shared trip (public)
    TripShareDto getSharedTrip(String token);

    // Revoke link
    void revokeShareLink(String token);
}