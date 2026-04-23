package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.TripShareDto;
import CS431.Style_Finder.service.SharedTripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/share/trip")
@RequiredArgsConstructor
public class SharedTripController {
    private final SharedTripService sharedTripService;
    
    @PostMapping("/{tripId}")
    public ResponseEntity<TripShareDto> createShareLink(@PathVariable Long tripId) {
        return ResponseEntity.ok(sharedTripService.createShareLink(tripId));
    }

    @GetMapping("/{token}")
    public ResponseEntity<TripShareDto> getSharedTrip(@PathVariable String token) {
        return ResponseEntity.ok(sharedTripService.getSharedTrip(token));
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<Void> revokeShareLink(@PathVariable String token) {
        sharedTripService.revokeShareLink(token);
        return ResponseEntity.noContent().build();
    }
}