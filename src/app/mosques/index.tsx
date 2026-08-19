// src/app/mosque-finder/index.tsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import {
  MapPin,
  Search,
  Navigation,
  Phone,
  Heart,
  HeartOff,
  RefreshCcw,
  Star,
  Landmark,
  Clock,
  Route,
  ShieldCheck,
  Info,
  Compass,
} from 'lucide-react-native';

type MosquePlace = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating?: number;
  openNow?: boolean;
  phone?: string;
  distanceKm?: number;
};

const GOOGLE_PLACES_API_KEY = 'PUT_YOUR_GOOGLE_PLACES_API_KEY_HERE';

const GREEN = '#064E3B';
const EMERALD = '#0D7054';
const GOLD = '#D4A017';
const CREAM = '#F7F5EE';
const CARD = '#FFFDF8';
const MINT = '#E6F1EC';
const ROSE = '#9F2D2D';
const TEXT = '#3C3A34';

const STORAGE_FAVORITES = 'CHAFADIA_MOSQUE_FAVORITES_V2';

export default function MosqueFinderPage() {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [mosques, setMosques] = useState<MosquePlace[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [radiusKm, setRadiusKm] = useState(5);

  const hasApiKey =
    GOOGLE_PLACES_API_KEY &&
    !GOOGLE_PLACES_API_KEY.includes('PUT_YOUR');

  const filteredMosques = useMemo(() => {
    const s = query.toLowerCase();

    return mosques.filter(
      mosque =>
        mosque.name.toLowerCase().includes(s) ||
        mosque.address.toLowerCase().includes(s)
    );
  }, [query, mosques]);

  const loadFavorites = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_FAVORITES);
    if (saved) setFavorites(JSON.parse(saved));
  };

  const saveFavorites = async (items: string[]) => {
    setFavorites(items);
    await AsyncStorage.setItem(STORAGE_FAVORITES, JSON.stringify(items));
  };

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter(item => item !== id)
      : [...favorites, id];

    saveFavorites(updated);
  };

  const getCurrentLocationAndFindMosques = async () => {
    try {
      setLoading(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Location Permission Needed',
          'Please allow location access so we can find nearby mosques.'
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation(currentLocation.coords);

      if (hasApiKey) {
        await searchNearbyMosques(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude,
          radiusKm
        );
      } else {
        openNearbyMosquesInGoogleMaps(
          currentLocation.coords.latitude,
          currentLocation.coords.longitude
        );
      }
    } catch {
      Alert.alert('Location Error', 'Unable to get your location.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
    getCurrentLocationAndFindMosques();
  }, []);

  const searchNearbyMosques = async (
    latitude: number,
    longitude: number,
    radius: number
  ) => {
    try {
      setLoading(true);

      if (!hasApiKey) {
        openNearbyMosquesInGoogleMaps(latitude, longitude);
        return;
      }

      const radiusMeters = radius * 1000;

      const url =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
        `?location=${latitude},${longitude}` +
        `&radius=${radiusMeters}` +
        `&keyword=mosque` +
        `&type=mosque` +
        `&key=${GOOGLE_PLACES_API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setMosques([]);
        openNearbyMosquesInGoogleMaps(latitude, longitude);
        return;
      }

      const places: MosquePlace[] = data.results.map((item: any) => {
        const lat = item.geometry.location.lat;
        const lng = item.geometry.location.lng;

        return {
          id: item.place_id,
          name: item.name || 'Mosque',
          address:
            item.vicinity ||
            item.formatted_address ||
            'Address unavailable',
          latitude: lat,
          longitude: lng,
          rating: item.rating,
          openNow: item.opening_hours?.open_now,
          distanceKm: calculateDistance(latitude, longitude, lat, lng),
        };
      });

      places.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
      setMosques(places);
    } catch {
      openNearbyMosquesInGoogleMaps(latitude, longitude);
    } finally {
      setLoading(false);
    }
  };

  const openNearbyMosquesInGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/mosque/@${latitude},${longitude},15z`;
    Linking.openURL(url);
  };

  const openDirections = (mosque: MosquePlace) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const openMap = (mosque: MosquePlace) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${mosque.latitude},${mosque.longitude}`;
    Linking.openURL(url);
  };

  const callMosque = (phone?: string) => {
    if (!phone) {
      Alert.alert('Phone Not Available', 'This mosque does not have a phone number listed.');
      return;
    }

    Linking.openURL(`tel:${phone}`);
  };

  const changeRadius = async (value: number) => {
    setRadiusKm(value);

    if (location) {
      if (hasApiKey) {
        await searchNearbyMosques(location.latitude, location.longitude, value);
      } else {
        openNearbyMosquesInGoogleMaps(location.latitude, location.longitude);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.goldGlow} />
        <View style={styles.greenGlow} />

        <LinearGradient colors={[GREEN, EMERALD]} style={styles.hero}>
          <View style={styles.heroBadge}>
            <Landmark size={14} color={GOLD} />
            <Text style={styles.heroBadgeText}>Mosque Finder</Text>
          </View>

          <Text style={styles.heroTitle}>Nearby Mosques</Text>

          <Text style={styles.heroSubtitle}>
            Find mosques near your location, view distance, open maps, get directions,
            save favorites and prepare for prayer.
          </Text>

          <View style={styles.heroActions}>
            <TouchableOpacity style={styles.heroButton} onPress={getCurrentLocationAndFindMosques}>
              <RefreshCcw size={17} color="#FFFFFF" />
              <Text style={styles.heroButtonText}>Refresh</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroButtonGold}
              onPress={() =>
                location
                  ? openNearbyMosquesInGoogleMaps(location.latitude, location.longitude)
                  : getCurrentLocationAndFindMosques()
              }
            >
              <Compass size={17} color="#FFFFFF" />
              <Text style={styles.heroButtonText}>My App</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.searchBox}>
          <Search size={18} color={GREEN} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search mosque name or address..."
            placeholderTextColor="#8A8172"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <View style={styles.radiusRow}>
          {[3, 5, 10, 20].map(item => (
            <TouchableOpacity
              key={item}
              style={[styles.radiusPill, radiusKm === item && styles.radiusPillActive]}
              onPress={() => changeRadius(item)}
            >
              <Text style={[styles.radiusText, radiusKm === item && styles.radiusTextActive]}>
                {item} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MapPin size={18} color={GOLD} />
            <Text style={styles.statNumber}>{hasApiKey ? filteredMosques.length : 'Maps'}</Text>
            <Text style={styles.statLabel}>Found</Text>
          </View>

          <View style={styles.statCard}>
            <Heart size={18} color={GOLD} />
            <Text style={styles.statNumber}>{favorites.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>

          <View style={styles.statCard}>
            <Route size={18} color={GOLD} />
            <Text style={styles.statNumber}>{radiusKm}km</Text>
            <Text style={styles.statLabel}>Radius</Text>
          </View>
        </View>

        <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.tipCard}>
          <Info size={20} color={GOLD} />
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>
              {hasApiKey ? 'Nearby Mosque Results' : 'Google Maps Auto Detection'}
            </Text>
    
          </View>
        </LinearGradient>

        {loading && (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={GREEN} />
            <Text style={styles.loadingText}>Finding nearby mosques...</Text>
          </View>
        )}

        {!loading && !hasApiKey && (
          <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.emptyCard}>
            <MapPin size={28} color={GOLD} />
            <Text style={styles.emptyTitle}>Google Maps Mosque Search</Text>
            <Text style={styles.emptyText}>
              Tap “My App” or “Refresh” to automatically open nearby mosques in Google Maps.
              Later, add your Google Places API key to show mosque cards inside this page.
            </Text>
          </LinearGradient>
        )}

        {!loading && hasApiKey && filteredMosques.length === 0 && (
          <LinearGradient colors={[CARD, '#F7F0DC']} style={styles.emptyCard}>
            <MapPin size={28} color={GOLD} />
            <Text style={styles.emptyTitle}>No mosques found yet</Text>
            <Text style={styles.emptyText}>
              Try increasing the radius or tap Refresh again.
            </Text>
          </LinearGradient>
        )}

        {hasApiKey &&
          filteredMosques.map(mosque => {
            const saved = favorites.includes(mosque.id);

            return (
              <LinearGradient key={mosque.id} colors={[CARD, '#F7F0DC']} style={styles.mosqueCard}>
                <View style={styles.mosqueTop}>
                  <View style={styles.iconCircle}>
                    <Landmark size={22} color={GOLD} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.mosqueName}>{mosque.name}</Text>
                    <Text style={styles.mosqueAddress}>{mosque.address}</Text>
                  </View>

                  <TouchableOpacity onPress={() => toggleFavorite(mosque.id)}>
                    {saved ? (
                      <HeartOff size={22} color={ROSE} />
                    ) : (
                      <Heart size={22} color={GREEN} />
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaPill}>
                    <Route size={13} color={GREEN} />
                    <Text style={styles.metaText}>
                      {mosque.distanceKm ? `${mosque.distanceKm.toFixed(1)} km` : 'Nearby'}
                    </Text>
                  </View>

                  {mosque.rating && (
                    <View style={styles.metaPill}>
                      <Star size={13} color={GREEN} />
                      <Text style={styles.metaText}>{mosque.rating} rating</Text>
                    </View>
                  )}

                  <View style={styles.metaPill}>
                    <Clock size={13} color={GREEN} />
                    <Text style={styles.metaText}>
                      {mosque.openNow === undefined
                        ? 'Hours unknown'
                        : mosque.openNow
                        ? 'Open now'
                        : 'May be closed'}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.mainAction} onPress={() => openDirections(mosque)}>
                    <Navigation size={16} color="#FFFFFF" />
                    <Text style={styles.mainActionText}>Directions</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryAction} onPress={() => openMap(mosque)}>
                    <MapPin size={16} color={GREEN} />
                    <Text style={styles.secondaryActionText}>Map</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.secondaryAction} onPress={() => callMosque(mosque.phone)}>
                    <Phone size={16} color={GREEN} />
                    <Text style={styles.secondaryActionText}>Call</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            );
          })}

        <View style={styles.sectionHeader}>
          <ShieldCheck size={18} color={GOLD} />
          <Text style={styles.sectionTitle}>Mosque Etiquette</Text>
        </View>

        {[
          'Enter with the right foot and make the mosque dua.',
          'Keep your phone silent.',
          'Do not disturb people praying or reading Quran.',
          'Keep the mosque clean.',
          'Avoid strong smells before jama’ah.',
          'Respect prayer rows and arrive early.',
        ].map(item => (
          <View key={item} style={styles.etiquetteRow}>
            <ShieldCheck size={18} color={GREEN} />
            <Text style={styles.etiquetteText}>{item}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(value: number) {
  return (value * Math.PI) / 180;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: CREAM },
  container: { flex: 1 },
  content: { paddingHorizontal: 15, paddingTop: 18, paddingBottom: 40 },

  goldGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: GOLD,
    opacity: 0.15,
  },

  greenGlow: {
    position: 'absolute',
    top: 360,
    left: -100,
    width: 210,
    height: 210,
    borderRadius: 999,
    backgroundColor: GREEN,
    opacity: 0.08,
  },

  hero: {
    borderRadius: 30,
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 14,
  },

  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginBottom: 14,
  },

  heroBadgeText: {
    color: GOLD,
    fontSize: 11,
    fontWeight: '900',
    marginLeft: 6,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },

  heroSubtitle: {
    color: '#E6FFF4',
    fontSize: 12.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 9,
    fontWeight: '700',
  },

  heroActions: {
    flexDirection: 'row',
    marginTop: 15,
    gap: 10,
  },

  heroButton: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroButtonGold: {
    backgroundColor: GOLD,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroButtonText: {
    color: '#FFFFFF',
    fontWeight: '900',
    marginLeft: 7,
    fontSize: 12,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    color: GREEN,
    fontWeight: '800',
    marginLeft: 8,
  },

  radiusRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },

  radiusPill: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  radiusPillActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },

  radiusText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
  },

  radiusTextActive: {
    color: '#FFFFFF',
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  statCard: {
    width: '32%',
    backgroundColor: CARD,
    borderRadius: 20,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  statNumber: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '900',
    marginTop: 5,
  },

  statLabel: {
    color: '#746A5D',
    fontSize: 10.5,
    fontWeight: '800',
    marginTop: 3,
  },

  tipCard: {
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 14,
    flexDirection: 'row',
    gap: 10,
  },

  tipTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: '900',
  },

  tipText: {
    color: TEXT,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 5,
  },

  loadingCard: {
    backgroundColor: CARD,
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  loadingText: {
    color: GREEN,
    fontWeight: '900',
    marginTop: 10,
  },

  emptyCard: {
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 14,
  },

  emptyTitle: {
    color: GREEN,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },

  emptyText: {
    color: TEXT,
    fontSize: 12.5,
    lineHeight: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 7,
  },

  mosqueCard: {
    borderRadius: 27,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5D9C3',
    marginBottom: 14,
  },

  mosqueTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 17,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  mosqueName: {
    color: GREEN,
    fontSize: 17,
    fontWeight: '900',
  },

  mosqueAddress: {
    color: '#6B6257',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 4,
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 13,
  },

  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MINT,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginRight: 7,
    marginBottom: 7,
  },

  metaText: {
    color: GREEN,
    fontSize: 10.5,
    fontWeight: '900',
    marginLeft: 5,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  mainAction: {
    flex: 1.3,
    backgroundColor: GREEN,
    borderRadius: 17,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  mainActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 6,
  },

  secondaryAction: {
    flex: 1,
    backgroundColor: MINT,
    borderRadius: 17,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  secondaryActionText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '900',
    marginLeft: 5,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 5,
  },

  sectionTitle: {
    color: GREEN,
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 7,
  },

  etiquetteRow: {
    backgroundColor: CARD,
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5D9C3',
  },

  etiquetteText: {
    color: TEXT,
    fontSize: 12.5,
    fontWeight: '800',
    marginLeft: 9,
    flex: 1,
    lineHeight: 18,
  },
});