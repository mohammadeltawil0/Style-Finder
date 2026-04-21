package CS431.Style_Finder.service;
import CS431.Style_Finder.model.enums.Weather;

//Template of weather service api
public interface WeatherService {
    WeatherContext getWeatherForLocation(String location);

    record WeatherContext(int temp, Weather condition) {}
}
