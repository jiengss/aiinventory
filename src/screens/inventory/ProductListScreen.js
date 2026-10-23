import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import Input from '../../components/Input';
import Loading from '../../components/Loading';
import Card from '../../components/Card';
import { colors, spacing, font, radius } from '../../theme';

const FILTERS = ['All', 'Low Stock', 'Healthy'];

export default function ProductListScreen({ navigation }) {
  const [products, setProducts] = useState(null);
  const [q, setQ] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await client.get('/products', { params: { q } });
      setProducts(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.log('Product list fetch error:', e.message);
      setProducts([]);
    }
  }, [q]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeFilter === 'Low Stock') {
      return products.filter((p) => (p.quantity ?? 0) <= 10);
    }
    if (activeFilter === 'Healthy') {
      return products.filter((p) => (p.quantity ?? 0) > 10);
    }
    return products;
  }, [products, activeFilter]);

  if (!products && !refreshing) return <Loading label="Loading catalog…" sublabel="Fetching real-time stock levels" />;

  const getStockStatus = (qty) => {
    if (qty <= 5) return { color: colors.danger, bg: colors.dangerSoft, border: colors.dangerBorder, label: 'Critical' };
    if (qty <= 20) return { color: colors.warning, bg: colors.warningSoft, border: colors.warningBorder, label: 'Low' };
    return { color: colors.success, bg: colors.successSoft, border: colors.successBorder, label: 'In Stock' };
  };

  const getCategoryIcon = (sku = '', name = '') => {
    const s = (sku + ' ' + name).toLowerCase();
    if (s.includes('elec') || s.includes('cable') || s.includes('headphone')) return 'hardware-chip-outline';
    if (s.includes('med') || s.includes('tablet')) return 'medkit-outline';
    if (s.includes('food') || s.includes('coffee')) return 'cafe-outline';
    if (s.includes('drill') || s.includes('hard')) return 'build-outline';
    if (s.includes('chair') || s.includes('off')) return 'easel-outline';
    return 'cube-outline';
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Input
          placeholder="Search product name, SKU, category..."
          value={q}
          onChangeText={setQ}
          icon="search-outline"
          rightIcon={q ? 'close-circle' : null}
          onRightIconPress={() => setQ('')}
          style={{ marginBottom: 8 }}
        />

        {/* Filter Pills */}
        <View style={styles.filtersRow}>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f;
            return (
              <Pressable
                key={f}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{filteredProducts.length} items</Text>
          </View>
        </View>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const qty = item.quantity ?? 0;
          const status = getStockStatus(qty);
          const iconName = getCategoryIcon(item.sku, item.name);
          const maxTarget = 100;
          const fillRatio = Math.min(1, Math.max(0.08, qty / maxTarget));

          return (
            <Card
              variant="default"
              style={styles.itemCard}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            >
              <View style={styles.cardMain}>
                {/* Product Icon */}
                <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
                  <Icon name={iconName} size={22} color={colors.primary} />
                </View>

                {/* Details Column */}
                <View style={styles.itemDetails}>
                  <View style={styles.titleRow}>
                    <Text style={styles.name} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.skuChip}>
                      <Text style={styles.skuText}>{item.sku}</Text>
                    </View>
                    {item.price ? (
                      <Text style={styles.priceText}>
                        ${Number(item.price).toFixed(2)}
                      </Text>
                    ) : null}
                  </View>

                  {/* Stock Level Visual Bar */}
                  <View style={styles.stockBarWrap}>
                    <View style={styles.barBackground}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            width: `${fillRatio * 100}%`,
                            backgroundColor: status.color,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                {/* Stock Quantity Pill */}
                <View style={styles.qtyCol}>
                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: status.bg, borderColor: status.border },
                    ]}
                  >
                    <Text style={[styles.qtyNumber, { color: status.color }]}>
                      {qty}
                    </Text>
                    <Text style={[styles.qtyUnit, { color: status.color }]}>
                      {item.unit || 'units'}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={16} color={colors.textMuted} style={{ marginTop: 6 }} />
                </View>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Icon name="search-outline" size={36} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No matching products</Text>
            <Text style={styles.emptySub}>
              {q ? `No items found matching "${q}"` : 'Your catalog is empty'}
            </Text>
            {q ? (
              <Pressable style={styles.resetBtn} onPress={() => setQ('')}>
                <Text style={styles.resetBtnText}>Clear Search Filter</Text>
              </Pressable>
            ) : null}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  searchHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm + 4,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  filterText: {
    fontSize: font.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  countBadge: {
    marginLeft: 'auto',
  },
  countBadgeText: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  itemCard: {
    marginBottom: 8,
    padding: spacing.sm + 4,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  skuChip: {
    backgroundColor: colors.bgSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginRight: 8,
  },
  skuText: {
    fontSize: font.xs - 1,
    fontFamily: 'monospace',
    color: colors.textMuted,
    fontWeight: '600',
  },
  priceText: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  stockBarWrap: {
    marginTop: 8,
  },
  barBackground: {
    height: 5,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  qtyCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  statusPill: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    minWidth: 54,
  },
  qtyNumber: {
    fontSize: font.md,
    fontWeight: '800',
  },
  qtyUnit: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: font.lg,
    fontWeight: '700',
    color: colors.text,
  },
  emptySub: {
    fontSize: font.sm,
    color: colors.textMuted,
    marginTop: 4,
  },
  resetBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primarySoft,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  resetBtnText: {
    color: colors.primaryDark,
    fontSize: font.sm,
    fontWeight: '700',
  },
});
