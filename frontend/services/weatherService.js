const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export const fetchWeather = async (latitude, longitude) => {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    temperature_unit: 'fahrenheit',
    hourly: 'temperature_2m',
    daily: ['temperature_2m_max', 'temperature_2m_min', 'weather_code'].join(','),
    timezone: 'auto',
    forecast_days: 7,
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) throw new Error('Weather fetch failed');
  return response.json();
};