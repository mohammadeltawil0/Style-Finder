package CS431.Style_Finder.service;

//Template of weather service api
public interface WeatherService {
    WeatherContext getWeatherForLocation(String location);

    record WeatherContext(int temp, String condition) {}
}
