import { useState, useEffect } from "react";
import { fetchWeather } from "../services/weatherService";
import { getLocation } from "../services/locationService";

export const useWeather = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const loc = await getLocation();         
        if (!isMounted) return;
        setLocation(loc);                         

        const data = await fetchWeather(loc.latitude, loc.longitude);
        if (!isMounted) return;
        setWeather(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, []);

  return { weather, location, loading, error };
};