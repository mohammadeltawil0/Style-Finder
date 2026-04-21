import { useWeather } from '../../hooks/useWeather';
import { View, ActivityIndicator } from 'react-native';
import { ThemedText } from '../../components';
import { useTheme } from '@react-navigation/native';
import { getWeatherIcon, getWeatherDescription, getColorForWeather } from '../../constants/weatherCodes';

export default function WeatherScreen() {
    const theme = useTheme();
    const { weather, location, loading, error } = useWeather();

    const cardStyle = {
        backgroundColor: theme.colors.lightBrown,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingVertical: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 3.5,
        elevation: 5,
        flexDirection: "row",
        alignSelf: "stretch",
        justifyContent: "center",
    };

    if (loading) return <ActivityIndicator size="large" />;
    if (error) return (
        <View style={cardStyle}>
            <ThemedText>Cannot fetch weather data</ThemedText>
        </View>
    );
    if (!weather?.current) return <ThemedText>No weather data</ThemedText>;

    const { temperature_2m, weather_code, wind_speed_10m } = weather.current;
    const now = new Date();
    const date = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    return (
        <View style={cardStyle}>

            {/* Left — icon, description, temperature */}
            <View style={{
                flex: 1,
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "center ",
                alignSelf: "stretch",
                gap: 10
            }}>
                <ThemedText style={{ fontSize: theme.sizes.h3 }}>
                    {getWeatherIcon(weather_code)} {getWeatherDescription(weather_code)}
                </ThemedText>
                <ThemedText style={{
                    fontSize: 35,
                }}>
                    {`${Math.round(temperature_2m)}°F`}
                </ThemedText>
            </View>

            {/* Right — time, date, location */}
            <View style={{
                flex: 1,
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 15,
                alignSelf: "stretch",
            }}>
                <View style={{
                    flexDirection: "column",
                    alignItems: "flex-end",
                }}>
                    <ThemedText style={{
                        fontSize: theme.sizes.h2,
                        color: theme.colors.text,
                    }}>
                        {time}
                    </ThemedText>
                    <ThemedText style={{
                        fontSize: theme.sizes.regular,
                        color: theme.colors.text,
                    }}>
                        {date}
                    </ThemedText>
                </View>
                <ThemedText style={{
                    fontSize: theme.sizes.regular,
                    lineHeight: theme.sizes.regular,
                }}>
                    {location?.city}, {location?.region}
                </ThemedText>
            </View>

        </View>
    );
}