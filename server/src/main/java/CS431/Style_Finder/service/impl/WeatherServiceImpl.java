package CS431.Style_Finder.service.impl;
import CS431.Style_Finder.model.enums.Weather;
import CS431.Style_Finder.service.WeatherService;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class WeatherServiceImpl implements WeatherService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public WeatherContext getWeatherForLocation(String location) {
        // 1. Set the default fallback values (from your original code)
        double temp = 72.0;
        Weather condition = Weather.SUNNY;

        try {
            // 2. Parse the "latitude,longitude" string
            if (location != null && location.contains(",")) {
                String[] coords = location.split(",");

                String lat = coords[0].trim();
                String lon = coords[1].trim();

                // 3. Build the Open-Meteo URL
                String url = String.format(
                        "https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current_weather=true&temperature_unit=fahrenheit",
                        lat, lon
                );

                // 4. Fetch the data
                ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode currentWeather = root.path("current_weather");

                    if (!currentWeather.isMissingNode()) {
                        temp = currentWeather.path("temperature").asDouble();
                        int weatherCode = currentWeather.path("weathercode").asInt();
                        condition = mapWmoCodeToCondition(weatherCode);
                    }
                }
            }
        } catch (Exception e) {
            // If anything fails
            System.err.println("Failed to fetch weather from Open-Meteo. Using defaults. Error: " + e.getMessage());
        }

        return new WeatherContext((int) Math.round(temp), condition);
    }

    private Weather mapWmoCodeToCondition(int code) {
        if (code == 0) {
            return Weather.SUNNY; // Clear sky
        } else if (code >= 1 && code <= 3) {
            return Weather.CLOUDY; // Mainly clear, partly cloudy, and overcast
        } else if (code == 45 || code == 48) {
            return Weather.CLOUDY; // Fog and depositing rime fog
        } else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82) || (code >= 95 && code <= 99)) {
            return Weather.RAINY; // Drizzle, Rain, Rain showers, Thunderstorm
        } else if ((code >= 71 && code <= 77) || code == 85 || code == 86) {
            return Weather.SNOWY; // Snow fall, Snow grains, Snow showers
        }
        // Default safe fallback if an unknown code is returned
        return Weather.SUNNY;
    }
}