import React, { useState, useCallback } from 'react';
import { FlatList, Text, StyleSheet, View, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import Loading from '../../components/Loading';
import Card from '../../components/Card';
import AlertBadge from '../../components/AlertBadge';
import { colors, spacing, font, radius } from '../../theme';

export default function TransferListScreen() {
  const [items, setItems] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await client.get('/transfer/request');
      setItems(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.log('Transfer list error:', e.message);
      setItems([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!items && !refreshing) return <Loading label="Loading transfer log…" sublabel="Fetching active transfer manifests" />;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(t, index) => String(t.id || index)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Icon name="swap-horizontal" size={36} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Transfer Orders</Text>
            <Text style={styles.emptySub}>
              You haven&apos;t initiated any inter-branch transfer requests yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = item.status || 'pending';
          return (
            <Card variant="elevated" style={styles.transferCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>{item.product_name || 'Inventory Item'}</Text>
                  <Text style={styles.orderId}>Order #{String(item.id).slice(-6)}</Text>
                </View>
                <AlertBadge type={status} />
              </View>

              {/* Route Display */}
              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <View style={styles.dotOrigin} />
                  <Text style={styles.branchName} numberOfLines={1}>
                    {item.from_branch || item.from_branch_name || 'Origin Hub'}
                  </Text>
                </View>

                <View style={styles.routeDivider}>
                  <View style={styles.routeLine} />
                  <Icon name="arrow-forward" size={14} color={colors.primary} style={{ marginHorizontal: 6 }} />
                  <View style={styles.routeLine} />
                </View>

                <View style={styles.routePoint}>
                  <View style={styles.dotDest} />
                  <Text style={styles.branchName} numberOfLines={1}>
                    {item.to_branch || item.to_branch_name || 'Destination'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.quantityText}>
                  Quantity: <Text style={{ fontWeight: '800', color: colors.text }}>{item.quantity || 1} units</Text>
                </Text>
              </View>
            </Card>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  transferCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
  },
  orderId: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  routeContainer: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.sm,
    padding: spacing.sm + 4,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotOrigin: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
    marginRight: 8,
  },
  dotDest: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 8,
  },
  branchName: {
    fontSize: font.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  routeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 3,
  },
  routeLine: {
    height: 1,
    backgroundColor: colors.border,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityText: {
    fontSize: font.xs,
    color: colors.textMuted,
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    textAlign: 'center',
    marginTop: 4,
  },
});
