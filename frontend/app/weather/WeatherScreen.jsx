import { useWeather } from '../../hooks/useWeather';
import { View, ActivityIndicator } from 'react-native';
import { ThemedText } from '../../components';
import { useTheme } from '@react-navigation/native';
import { getWeatherIcon, getWeatherDescription, getColorForWeather } from '../../constants/weatherCodes';
import { useEffect, useState } from 'react';

export default function WeatherScreen() {
    const theme = useTheme();
    const { weather, location, loading, error } = useWeather();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const msUntilNextMinute = (60 - new Date().getSeconds()) * 1000;

        const timeout = setTimeout(() => {
            setNow(new Date());
            const interval = setInterval(() => setNow(new Date()), 60_000);
            return () => clearInterval(interval);
        }, msUntilNextMinute);

        return () => clearTimeout(timeout);
    }, []);

    const day = now.toLocaleDateString(undefined, { weekday: 'short' });
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });


    const cardStyle = {
        borderColor: theme.colors.text,
        borderWidth: 1,
        backgroundColor: theme.colors.lightBrown,
        marginHorizontal: 20,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 20,
        flexDirection: "column",  
        justifyContent: "space-between", 
        height: 120
    };

    if (loading) return <ActivityIndicator size="large" />;
    if (error) return (
        <View style={cardStyle}>
            <ThemedText>Cannot fetch weather data</ThemedText>
        </View>
    );
    if (!weather?.current) return <ThemedText>No weather data</ThemedText>;

    const { temperature_2m, weather_code, wind_speed_10m } = weather.current;

    return (
        <View style={cardStyle}>

            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <ThemedText style={{ fontSize: theme.sizes.h3 }}>
                    {getWeatherIcon(weather_code)} {getWeatherDescription(weather_code)}
                </ThemedText>
                <ThemedText style={{ fontSize: theme.sizes.h3 }}>
                    {location?.city}, {location?.region}
                </ThemedText>
            </View>

            <View style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
            }}>
                <ThemedText style={{ fontSize: 35 }}>
                    {`${Math.round(temperature_2m)}°F`}
                </ThemedText>

            </View>
        </View>
    );
}