import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import AlertBadge from '../../components/AlertBadge';
import Loading from '../../components/Loading';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, spacing, font, radius } from '../../theme';

const TABS = ['All', 'Critical', 'Warnings'];

export default function AlertsScreen({ navigation }) {
  const [alerts, setAlerts] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [dismissingId, setDismissingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await client.get('/alerts');
      setAlerts(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.log('Alerts load error:', e.message);
      setAlerts([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const dismiss = async (id) => {
    try {
      setDismissingId(id);
      await client.post(`/alerts/${id}/dismiss`);
      load();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally {
      setDismissingId(null);
    }
  };

  const filteredAlerts = useMemo(() => {
    if (!alerts) return [];
    if (activeTab === 'Critical') {
      return alerts.filter((a) =>
        a.alert_type?.includes('critical') || a.alert_type?.includes('stockout')
      );
    }
    if (activeTab === 'Warnings') {
      return alerts.filter((a) =>
        a.alert_type?.includes('warning') || a.alert_type?.includes('low')
      );
    }
    return alerts;
  }, [alerts, activeTab]);

  if (!alerts && !refreshing) return <Loading label="Checking stock health…" sublabel="Evaluating replenishment thresholds" />;

  return (
    <View style={styles.container}>
      {/* Top Filter Bar */}
      <View style={styles.topBar}>
        <View style={styles.tabsRow}>
          {TABS.map((t) => {
            const isActive = activeTab === t;
            return (
              <Pressable
                key={t}
                style={[styles.tabChip, isActive && styles.tabChipActive]}
                onPress={() => setActiveTab(t)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.activeCountText}>{filteredAlerts.length} Active</Text>
      </View>

      <FlatList
        data={filteredAlerts}
        keyExtractor={(a) => String(a.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <Icon name="shield-checkmark" size={38} color={colors.success} />
            </View>
            <Text style={styles.emptyTitle}>All Inventory Healthy</Text>
            <Text style={styles.emptySub}>
              No critical stockout risks or anomalies detected in your branches.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isDismissing = dismissingId === item.id;
          return (
            <Card variant="elevated" style={styles.alertCard}>
              <View style={styles.cardHeader}>
                <AlertBadge type={item.alert_type} />
                {item.predicted_stockout_date && (
                  <View style={styles.datePill}>
                    <Icon name="calendar-outline" size={12} color={colors.danger} style={{ marginRight: 4 }} />
                    <Text style={styles.dateText}>
                      Est: {item.predicted_stockout_date}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.messageText}>{item.message}</Text>

              <View style={styles.actionsRow}>
                <Button
                  title="Dismiss"
                  variant="ghost"
                  size="sm"
                  icon="checkmark"
                  onPress={() => dismiss(item.id)}
                  loading={isDismissing}
                  style={styles.dismissBtn}
                />
                <Button
                  title="Find Stock"
                  variant="soft"
                  size="sm"
                  icon="search"
                  onPress={() => navigation.navigate('More', { screen: 'Transfers' })}
                />
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
  topBar: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
  },
  tabChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  tabText: {
    fontSize: font.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  activeCountText: {
    fontSize: font.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  alertCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  dateText: {
    fontSize: font.xs - 1,
    color: colors.danger,
    fontWeight: '700',
  },
  messageText: {
    fontSize: font.md,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  dismissBtn: {
    paddingHorizontal: 8,
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
    backgroundColor: colors.successSoft,
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
    maxWidth: 280,
    lineHeight: 18,
  },
});
