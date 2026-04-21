import * as Location from 'expo-location';

export const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Permission denied');

  const { coords } = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = coords;

  // ✅ Reverse geocode to get town name
  const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });

  return {
    latitude,
    longitude,
    city: place.city,
    region: place.region,       // state
    country: place.country,
    district: place.district,   // neighborhood/suburb
  };
};