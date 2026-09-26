import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { colors, radius, spacing } from '../theme';

export default function FarmerProductsScreen({ farmer, back, addToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('farmer_id', farmer.id)
        .eq('available', true);
      
      if (error) throw error;
      setProducts(data || []);
    } catch (e) {
      console.error(e);
      setErrorMsg("Couldn't load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.productName}>{item.product_name}</Text>
        {item.variety && <Text style={styles.varietyText}>{item.variety}</Text>}
        <Text style={styles.priceText}>₹{item.price_per_unit} / {item.unit}</Text>
        <Text style={styles.quantityText}>Available: {item.quantity} {item.unit}</Text>
      </View>
      <Pressable 
        style={styles.addButton} 
        onPress={() => {
          const cartProduct = {
            id: item.id,
            name: item.product_name,
            farmer: farmer.farm_name || farmer.name,
            farmerId: farmer.id,
            price: Number(item.price_per_unit),
            unit: item.unit,
            image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80" // Demo fallback
          };
          addToCart(item.id, 1, cartProduct);
        }}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={back} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{farmer.farm_name || farmer.name}</Text>
          <Text style={styles.subtitle}>{farmer.city}{farmer.district ? `, ${farmer.district}` : ''}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : errorMsg ? (
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={48} color={colors.danger} />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <Pressable style={styles.retryBtn} onPress={fetchProducts}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="leaf-outline" size={48} color={colors.muted} />
              <Text style={styles.emptyText}>No available products right now.</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing(4),
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing(2),
    marginRight: spacing(2),
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  list: {
    padding: spacing(4),
    gap: spacing(4),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: spacing(4),
    borderRadius: radius.md,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.ink,
  },
  varietyText: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing(2),
  },
  quantityText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    gap: spacing(1),
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(6),
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
