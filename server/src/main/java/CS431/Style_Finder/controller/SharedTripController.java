package CS431.Style_Finder.controller;

import CS431.Style_Finder.dto.TripShareDto;
import CS431.Style_Finder.service.SharedTripService;
import CS431.Style_Finder.dto.TripDayDto;
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

    @GetMapping("/view/{token}")
    public ResponseEntity<String> viewSharedTrip(@PathVariable String token) {

        TripShareDto trip = sharedTripService.getSharedTrip(token);

        StringBuilder html = new StringBuilder();

        html.append("<html><body style='font-family:sans-serif; padding:20px;'>");
        //title
        html.append("<h1 style='color:#949F71;'>StyleFinder</h1>");

        html.append("<h2>Trip to ").append(trip.getTripLocation()).append("</h2>");

        html.append("<p><strong>Dates:</strong> ")
            .append(trip.getStartDate())
            .append(" - ")
            .append(trip.getEndDate())
            .append("</p>"); 

        //loop through outfits
        if (trip.getDays() != null) {
            for (TripDayDto day : trip.getDays()) {

                html.append("<h3 style='margin-top:20px;'>Day: ").append(day.getDate()).append("</h3>");
                html.append("<div style='display:flex;flex-wrap:wrap;'>");
                if (day.getImageUrls() != null) {
                    for (String url : day.getImageUrls()) {
                        html.append("<img src='").append(url).append("' style='width:180px;height:180px;margin:10px;border-radius:10px;'/>");
                    }
                }
                html.append("</div>");
            }
        }

        html.append("</body></html>");
        return ResponseEntity.ok().header("Content-Type", "text/html").body(html.toString());
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<Void> revokeShareLink(@PathVariable String token) {
        sharedTripService.revokeShareLink(token);
        return ResponseEntity.noContent().build();
    }
}