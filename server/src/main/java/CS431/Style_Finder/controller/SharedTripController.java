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

        html.append("""
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    background-color: #EDEDE9;
                    margin: 0;
                    padding: 0;
                    text-align: center;
                    color: #2f2f2f;
                }
                .container {
                    max-width: 650px;
                    margin: auto;
                    padding: 20px;
                }
                .header {
                    font-size: 28px;
                    font-weight: bold;
                    color: black;
                    margin-bottom: 15px;
                }
                .card {
                    background: #E3D5CA;
                    border-radius: 18px;
                    padding: 20px;
                    box-shadow: 0 6px 12px rgba(0,0,0,0.08);
                    margin-bottom: 20px;
                }
                .title {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .info {
                    font-size: 14px;
                    color: #444;
                    margin-bottom: 10px;
                }
                .dayTitle {
                    margin-top: 15px;
                    font-weight: bold;
                    color: #000000;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 10px;
                    margin-top: 10px;
                }
                img {
                    width: 100%;
                    height: 140px;
                    object-fit: cover;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 12px;
                    color: #888;
                }

            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">StyleFinder</div>
                <div class="card">
        """);

        html.append("<div class='title'>Trip to ")
            .append(trip.getTripLocation())
            .append("</div>");

        html.append("<div class='info'>")
            .append(trip.getStartDate())
            .append(" - ")
            .append(trip.getEndDate())
            .append("</div>");

        if (trip.getDays() != null) {
            for (TripDayDto day : trip.getDays()) {

                html.append("<div class='dayTitle'>")
                    .append("Day: ").append(day.getDate())
                    .append("</div>");

                html.append("<div class='grid'>");

                if (day.getImageUrls() != null) {
                    for (String url : day.getImageUrls()) {
                        html.append("<img src='")
                            .append(url)
                            .append("'/>");
                    }
                }
                html.append("</div>");
            }
        }

        html.append("""
                </div>

                <div class="footer">
                    Shared via StyleFinder
                </div>

            </div>
        </body>
        </html>
        """);

        return ResponseEntity.ok()
                .header("Content-Type", "text/html")
                .body(html.toString());
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<Void> revokeShareLink(@PathVariable String token) {
        sharedTripService.revokeShareLink(token);
        return ResponseEntity.noContent().build();
    }
}