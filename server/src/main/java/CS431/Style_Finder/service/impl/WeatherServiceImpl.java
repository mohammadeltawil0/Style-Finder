package CS431.Style_Finder.service.impl;

import CS431.Style_Finder.service.WeatherService;
import org.springframework.stereotype.Service;

@Service
public class WeatherServiceImpl implements WeatherService {

    @Override
    public WeatherContext getWeatherForLocation(String location) {
        return new WeatherContext(72, "Sunny");
    }
}
