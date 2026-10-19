import { useState, useEffect } from 'react';

export interface LocationState {
  lat: number;
  lng: number;
  speedKnots: number;
  heading: number;
  accuracy: number;
  isLive: boolean;
  error: string | null;
}

export function useLocation(enableTracking: boolean = true) {
  const [location, setLocation] = useState<LocationState>({
    lat: 17.4401,
    lng: 78.3489,
    speedKnots: 24,
    heading: 85,
    accuracy: 5,
    isLive: false,
    error: null
  });

  useEffect(() => {
    if (!enableTracking || typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      pos => {
        const speedMps = pos.coords.speed || 0;
        const speedKnots = Math.round(speedMps * 1.94384) || 24;
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          speedKnots,
          heading: pos.coords.heading || 85,
          accuracy: pos.coords.accuracy,
          isLive: true,
          error: null
        });
      },
      err => {
        setLocation(prev => ({
          ...prev,
          error: err.message,
          isLive: false
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [enableTracking]);

  return location;
}
