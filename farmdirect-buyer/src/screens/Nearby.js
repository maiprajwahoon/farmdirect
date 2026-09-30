import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert, Linking, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { colors, radius, spacing } from '../theme';

export default function NearbyScreen({ go }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Farmers'); // 'Farmers' | 'Stores'
  const [radiusKm, setRadiusKm] = useState(10); // 2, 5, 10, 25

  const distances = [2, 5, 10, 25];

  useEffect(() => {
    fetchLocationAndData();
  }, [activeTab, radiusKm]);

  const fetchLocationAndData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Location permission is required to find farmers near you.');
        setLoading(false);
        return;
      }

      let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc);

      const demoNearbyFarmers = [
        { id: '11111111-1111-1111-1111-111111111111', farm_name: 'Green Valley Farm', name: 'Demo Farmer', verified: true, city: 'Virar', district: 'Palghar', distance_km: 2.4 },
        { id: '22222222-2222-2222-2222-222222222222', farm_name: 'Sunrise Organic Fields', name: 'Ramesh Patil', verified: true, city: 'Palghar', district: 'Palghar', distance_km: 4.8 },
        { id: '33333333-3333-3333-3333-333333333333', farm_name: 'Kokan Fresh Orchard', name: 'Sanjay Deshmukh', verified: true, city: 'Thane', district: 'Thane', distance_km: 7.5 },
      ];

      const demoNearbyStores = [
        { id: 's1', name: 'FarmDirect Community Hub', city: 'Virar East', district: 'Palghar', address: 'Station Road, Virar', distance_km: 1.8 },
        { id: 's2', name: 'Kisan Fresh Collection Point', city: 'Palghar West', district: 'Palghar', address: 'APMC Market Road', distance_km: 5.2 },
      ];

      if (activeTab === 'Farmers') {
        try {
          const { data, error } = await supabase.rpc('nearby_farmers', {
            user_lat: loc.coords.latitude,
            user_lng: loc.coords.longitude,
            radius_km: radiusKm
          });
          if (error || !data || data.length === 0) {
            setFarmers(demoNearbyFarmers);
          } else {
            setFarmers(data);
          }
        } catch (e) {
          setFarmers(demoNearbyFarmers);
        }
      } else {
        try {
          const { data, error } = await supabase.rpc('nearby_stores', {
            user_lat: loc.coords.latitude,
            user_lng: loc.coords.longitude,
            radius_km: radiusKm
          });
          if (error || !data || data.length === 0) {
            setStores(demoNearbyStores);
          } else {
            setStores(data);
          }
        } catch (e) {
          setStores(demoNearbyStores);
        }
      }
    } catch (e) {
      setErrorMsg(null);
    } finally {
      setLoading(false);
    }
  };

  const renderFarmer = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <View style={styles.nameRow}>
            <Text style={styles.farmName}>{item.farm_name || item.name}</Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={16} color={colors.success} style={styles.verifiedIcon} />
            )}
          </View>
          <Text style={styles.farmerName}>{item.name}</Text>
        </View>
        <View style={styles.distanceBadge}>
          <Ionicons name="location" size={12} color={colors.primary} />
          <Text style={styles.distanceText}>{item.distance_km ? item.distance_km.toFixed(1) : 0} km away</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cityText}>{item.city}{item.district ? `, ${item.district}` : ''}</Text>
      </View>
      <Pressable 
        style={styles.viewButton} 
        onPress={() => go('farmerProducts', { farmer: item })}
      >
        <Text style={styles.viewButtonText}>View Products</Text>
      </Pressable>
    </View>
  );

  const renderStore = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.farmName}>{item.name}</Text>
        <View style={styles.distanceBadge}>
          <Ionicons name="location" size={12} color={colors.primary} />
          <Text style={styles.distanceText}>{item.distance_km ? item.distance_km.toFixed(1) : 0} km away</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cityText}>{item.city}{item.district ? `, ${item.district}` : ''}</Text>
        <Text style={styles.cityText}>{item.address}</Text>
      </View>
      <Pressable style={styles.viewButton} onPress={() => {}}>
        <Text style={styles.viewButtonText}>View Store</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby</Text>
        {location ? (
          <View style={styles.locationRow}>
            <Ionicons name="navigate" size={14} color={colors.primary} />
            <Text style={styles.locationText}>Using your current location</Text>
          </View>
        ) : (
          <Text style={styles.locationText}>Fetching location...</Text>
        )}
      </View>

      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {distances.map(d => (
            <Pressable 
              key={d} 
              style={[styles.filterChip, radiusKm === d && styles.filterChipActive]}
              onPress={() => setRadiusKm(d)}
            >
              <Text style={[styles.filterChipText, radiusKm === d && styles.filterChipTextActive]}>{d} km</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tabsRow}>
        <Pressable 
          style={[styles.tab, activeTab === 'Farmers' && styles.tabActive]} 
          onPress={() => setActiveTab('Farmers')}
        >
          <Text style={[styles.tabText, activeTab === 'Farmers' && styles.tabTextActive]}>Farmers</Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'Stores' && styles.tabActive]} 
          onPress={() => setActiveTab('Stores')}
        >
          <Text style={[styles.tabText, activeTab === 'Stores' && styles.tabTextActive]}>Stores</Text>
        </Pressable>
      </View>

      {errorMsg ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={48} color={colors.danger} />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Pressable style={styles.retryBtn} onPress={fetchLocationAndData}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding nearby {activeTab.toLowerCase()}...</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'Farmers' ? farmers : stores}
          keyExtractor={(item) => item.id}
          renderItem={activeTab === 'Farmers' ? renderFarmer : renderStore}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="basket-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>No {activeTab.toLowerCase()} found nearby.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    padding: spacing(4),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.ink,
    marginBottom: spacing(1),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: colors.muted,
    marginLeft: spacing(1),
  },
  filters: {
    backgroundColor: '#fff',
    paddingVertical: spacing(2),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScroll: {
    paddingHorizontal: spacing(4),
    gap: spacing(2),
  },
  filterChip: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    backgroundColor: colors.infoSoft,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.info,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: spacing(4),
    paddingTop: spacing(2),
  },
  tab: {
    flex: 1,
    paddingVertical: spacing(3),
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  list: {
    padding: spacing(4),
    gap: spacing(4),
    paddingBottom: spacing(20),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.md,
    padding: spacing(4),
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing(2),
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1),
  },
  verifiedIcon: {
    marginTop: 2,
  },
  farmName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.ink,
  },
  farmerName: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.infoSoft,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  cardBody: {
    marginBottom: spacing(4),
  },
  cityText: {
    fontSize: 14,
    color: colors.muted,
  },
  viewButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing(3),
    borderRadius: radius.md,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(6),
  },
  loadingText: {
    marginTop: spacing(3),
    color: colors.muted,
    fontSize: 16,
  },
  emptyText: {
    marginTop: spacing(3),
    color: colors.muted,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    marginTop: spacing(3),
    color: colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing(4),
  },
  retryBtn: {
    paddingHorizontal: spacing(6),
    paddingVertical: spacing(3),
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
