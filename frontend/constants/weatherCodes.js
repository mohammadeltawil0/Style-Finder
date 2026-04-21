export const getWeatherDescription = (code) => {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Icy fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
    80: 'Slight showers', 81: 'Moderate showers', 82: 'Heavy showers',
    95: 'Thunderstorm', 99: 'Thunderstorm with hail',
  };
  return codes[code] ?? 'Unknown';
};

export const getWeatherIcon = (code) => {
  const icons = {
    0: '☀️',    
    1: '🌤️', 2: '⛅', 3: '☁️',
    45: '🌫️', 48: '🌫️',
    51: '🌦️', 53: '🌧️', 55: '🌧️',
    61: '🌧️', 63: '🌧️', 65: '🌧️',
    71: '❄️', 73: '❄️', 75: '❄️',
    80: '🌦️', 81: '🌧️', 82: '🌧️',
    95: '⛈️', 99: '⛈️',
  };
  return icons[code] ?? '❓';
};

export const getColorForWeather = (code) => {
    const colors = {
        0: '#FFD700',
        1: '#FFB347', 2: '#FFB347', 3: '#C0C0C0',
        45: '#A9A9A9', 48: '#A9A9A9',
        51: '#87CEFA', 53: '#87CEFA', 55: '#87CEFA',
        61: '#1E90FF', 63: '#1E90FF', 65: '#1E90FF',
        71: '#ADD8E6', 73: '#ADD8E6', 75: '#ADD8E6',
        80: '#87CEFA', 81: '#1E90FF', 82: '#1E90FF',
        95: '#FF4500', 99: '#FF4500',
    };
    return colors[code] ?? '#FFFFFF';
}