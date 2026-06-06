
import { useEffect, useState, useCallback } from 'react';

import * as Location from 'expo-location';

export default function useLocation() {
  const [location, setLocation] = useState(null);

  const [address, setAddress] = useState(null);

  const [loading, setLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const [permissionGranted, setPermissionGranted] =
    useState(false);

  // GET USER LOCATION
  const getUserLocation = useCallback(async () => {
    try {
      setLoading(true);

      setErrorMsg('');

      // REQUEST PERMISSION
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setPermissionGranted(false);

        setErrorMsg(
          'Location permission was denied.'
        );

        return;
      }

      setPermissionGranted(true);

      // GET CURRENT POSITION
      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.Highest,
        });

      setLocation(currentLocation);

      // GET ADDRESS DETAILS
      const reverseGeocode =
        await Location.reverseGeocodeAsync({
          latitude:
            currentLocation.coords.latitude,

          longitude:
            currentLocation.coords.longitude,
        });

      if (reverseGeocode.length > 0) {
        const place = reverseGeocode[0];

        setAddress({
          city:
            place.city ||
            place.subregion ||
            '',

          region:
            place.region || '',

          country:
            place.country || '',

          district:
            place.district || '',

          street:
            place.street || '',

          postalCode:
            place.postalCode || '',
        });
      }
    } catch (error) {
      console.log('LOCATION ERROR:', error);

      setErrorMsg(
        'Unable to fetch your location.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // REFRESH LOCATION
  const refreshLocation = async () => {
    await getUserLocation();
  };

  // WATCH LIVE LOCATION
  const watchUserLocation = async (
    callback
  ) => {
    try {
      const subscription =
        await Location.watchPositionAsync(
          {
            accuracy:
              Location.Accuracy.High,

            timeInterval: 5000,

            distanceInterval: 5,
          },

          locationUpdate => {
            setLocation(locationUpdate);

            if (callback) {
              callback(locationUpdate);
            }
          }
        );

      return subscription;
    } catch (error) {
      console.log(
        'WATCH LOCATION ERROR:',
        error
      );
    }
  };

  // GET DISTANCE BETWEEN TWO POINTS
  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const toRad = value =>
      (value * Math.PI) / 180;

    const R = 6371;

    const dLat = toRad(lat2 - lat1);

    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
      2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
      );

    return R * c;
  };

  // AUTO LOAD LOCATION
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  return {
    location,

    address,

    loading,

    errorMsg,

    permissionGranted,

    refreshLocation,

    watchUserLocation,

    calculateDistance,

    latitude:
      location?.coords?.latitude || null,

    longitude:
      location?.coords?.longitude || null,

    altitude:
      location?.coords?.altitude || null,

    speed:
      location?.coords?.speed || null,

    heading:
      location?.coords?.heading || null,

    accuracy:
      location?.coords?.accuracy || null,
  };
}