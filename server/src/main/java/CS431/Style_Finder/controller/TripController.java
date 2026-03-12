package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.TripDto;
import CS431.Style_Finder.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    // POST /api/trips
    // Body: { "userId":1, "tripLocation":"Miami", "startDate":"2026-06-01", "endDate":"2026-06-05" }
    @PostMapping
    public ResponseEntity<TripDto> createTrip(@RequestBody TripDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(tripService.createTrip(dto));
    }

    // GET /api/trips/{id}
    @GetMapping("/{id}")
    public ResponseEntity<TripDto> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    // GET /api/trips/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TripDto>> getTripsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(tripService.getTripsByUserId(userId));
    }

    // PUT /api/trips/{id}
    @PutMapping("/{id}")
    public ResponseEntity<TripDto> updateTrip(@PathVariable Long id, @RequestBody TripDto dto) {
        return ResponseEntity.ok(tripService.updateTrip(id, dto));
    }

    // DELETE /api/trips/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
        return ResponseEntity.ok("Trip deleted successfully.");
    }
}