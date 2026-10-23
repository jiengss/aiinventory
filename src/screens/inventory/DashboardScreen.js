import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import AlertBadge from '../../components/AlertBadge';
import BranchHeader from '../../components/BranchHeader';
import { colors, spacing, font, radius, shadows } from '../../theme';

export default function DashboardScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [alertsList, setAlertsList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [alerts, products, transfers] = await Promise.allSettled([
        client.get('/alerts'),
        client.get('/products'),
        client.get('/transfer/available'),
      ]);

      const alertsData = alerts.status === 'fulfilled' ? alerts.value.data : [];
      const productsData = products.status === 'fulfilled' ? products.value.data : [];
      const transfersData = transfers.status === 'fulfilled' ? transfers.value.data : [];

      const rawAlerts = Array.isArray(alertsData) ? alertsData : alertsData?.data || [];
      setAlertsList(rawAlerts.slice(0, 3));

      setStats({
        alerts: rawAlerts.length,
        products: Array.isArray(productsData) ? productsData.length : productsData?.data?.length || 0,
        transfers: Array.isArray(transfersData) ? transfersData.length : transfersData?.data?.length || 0,
      });
    } catch (e) {
      console.log('Dashboard load error:', e.message);
      setStats({ alerts: 0, products: 0, transfers: 0 });
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

  if (!stats) return <Loading label="Loading Dashboard…" sublabel="Connecting to branch inventory" />;

  const hasUrgentAlerts = stats.alerts > 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Header & Branch Switcher */}
      <BranchHeader showGreeting />

      {/* AI Intelligence Notification Banner */}
      <Card
        variant={hasUrgentAlerts ? 'accent' : 'subtle'}
        style={[
          styles.aiBanner,
          hasUrgentAlerts
            ? { backgroundColor: colors.warningSoft, borderColor: colors.warningBorder }
            : { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder },
        ]}
        onPress={() => navigation.navigate(hasUrgentAlerts ? 'Alerts' : 'Chat')}
      >
        <View style={styles.bannerRow}>
          <View
            style={[
              styles.bannerIconWrap,
              { backgroundColor: hasUrgentAlerts ? colors.warningLight : colors.accent },
            ]}
          >
            <Icon
              name={hasUrgentAlerts ? 'warning' : 'sparkles'}
              size={18}
              color={colors.white}
            />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>
              {hasUrgentAlerts ? 'Inventory Attention Required' : 'AI Stock Health: Optimal'}
            </Text>
            <Text style={styles.bannerSub}>
              {hasUrgentAlerts
                ? `${stats.alerts} item${stats.alerts > 1 ? 's' : ''} require restocking or attention. Tap to review.`
                : 'All tracked inventory items are within safe replenishment thresholds.'}
            </Text>
          </View>
          <Icon name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </Card>

      {/* Primary KPI Grid */}
      <Text style={styles.sectionTitle}>Overview Metrics</Text>
      <View style={styles.kpiGrid}>
        {/* KPI: Products */}
        <Pressable
          style={styles.kpiCard}
          onPress={() => navigation.navigate('Products')}
        >
          <View style={[styles.kpiIconWrap, { backgroundColor: colors.primarySoft }]}>
            <Icon name="cube-outline" size={20} color={colors.primary} />
          </View>
          <Text style={styles.kpiValue}>{stats.products}</Text>
          <Text style={styles.kpiLabel}>Catalog Products</Text>
          <Text style={styles.kpiHint}>Tracked SKUs</Text>
        </Pressable>

        {/* KPI: Active Alerts */}
        <Pressable
          style={styles.kpiCard}
          onPress={() => navigation.navigate('Alerts')}
        >
          <View
            style={[
              styles.kpiIconWrap,
              { backgroundColor: stats.alerts > 0 ? colors.dangerSoft : colors.successSoft },
            ]}
          >
            <Icon
              name={stats.alerts > 0 ? 'alert-circle-outline' : 'shield-checkmark-outline'}
              size={20}
              color={stats.alerts > 0 ? colors.danger : colors.success}
            />
          </View>
          <Text
            style={[
              styles.kpiValue,
              stats.alerts > 0 && { color: colors.danger },
            ]}
          >
            {stats.alerts}
          </Text>
          <Text style={styles.kpiLabel}>Stock Alerts</Text>
          <Text style={styles.kpiHint}>{stats.alerts > 0 ? 'Requires action' : 'Healthy'}</Text>
        </Pressable>

        {/* KPI: Nearby Stock / Branches */}
        <Pressable
          style={styles.kpiCard}
          onPress={() => navigation.navigate('More', { screen: 'Transfers' })}
        >
          <View style={[styles.kpiIconWrap, { backgroundColor: colors.infoSoft }]}>
            <Icon name="swap-horizontal-outline" size={20} color={colors.info} />
          </View>
          <Text style={styles.kpiValue}>{stats.transfers}</Text>
          <Text style={styles.kpiLabel}>Transfer Hubs</Text>
          <Text style={styles.kpiHint}>With available stock</Text>
        </Pressable>

        {/* KPI: Scan & OCR */}
        <Pressable
          style={styles.kpiCard}
          onPress={() => navigation.navigate('Scan')}
        >
          <View style={[styles.kpiIconWrap, { backgroundColor: colors.accentSoft }]}>
            <Icon name="scan-outline" size={20} color={colors.accent} />
          </View>
          <Text style={[styles.kpiValue, { fontSize: font.xl }]}>OCR</Text>
          <Text style={styles.kpiLabel}>Digitize Form</Text>
          <Text style={styles.kpiHint}>Scan paper invoices</Text>
        </Pressable>
      </View>

      {/* Quick Action Shortcuts */}
      <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate('StockMovement')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: colors.primarySoft }]}>
            <Icon name="swap-vertical" size={22} color={colors.primary} />
          </View>
          <Text style={styles.actionLabel}>Log Movement</Text>
        </Pressable>

        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Products')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: colors.infoSoft }]}>
            <Icon name="list" size={22} color={colors.info} />
          </View>
          <Text style={styles.actionLabel}>Catalog</Text>
        </Pressable>

        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Scan')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: colors.accentSoft }]}>
            <Icon name="camera" size={22} color={colors.accent} />
          </View>
          <Text style={styles.actionLabel}>Scan Invoice</Text>
        </Pressable>

        <Pressable
          style={styles.actionBtn}
          onPress={() => navigation.navigate('Chat')}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: colors.warningSoft }]}>
            <Icon name="chatbubble-ellipses" size={22} color={colors.warning} />
          </View>
          <Text style={styles.actionLabel}>AI Assistant</Text>
        </Pressable>
      </View>

      {/* Recent Alerts Snapshot */}
      {alertsList.length > 0 && (
        <View style={{ marginTop: spacing.lg }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>High Priority Items</Text>
            <Pressable onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.viewAllText}>View All ({stats.alerts})</Text>
            </Pressable>
          </View>

          {alertsList.map((alert) => (
            <Card
              key={alert.id}
              variant="default"
              style={styles.alertCard}
              onPress={() => navigation.navigate('Alerts')}
            >
              <View style={styles.alertTop}>
                <AlertBadge type={alert.alert_type} />
                {alert.predicted_stockout_date && (
                  <Text style={styles.alertDate}>
                    Depletion: {alert.predicted_stockout_date}
                  </Text>
                )}
              </View>
              <Text style={styles.alertMessage} numberOfLines={2}>
                {alert.message}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.lg + 10,
    paddingBottom: spacing.xxl,
  },
  aiBanner: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextCol: {
    flex: 1,
    marginRight: 8,
  },
  bannerTitle: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.text,
  },
  bannerSub: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  viewAllText: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.sm,
  },
  kpiCard: {
    flexBasis: '47.8%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.sm,
  },
  kpiIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: {
    fontSize: font.xxl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  kpiLabel: {
    fontSize: font.sm,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  kpiHint: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginHorizontal: 3,
    ...shadows.sm,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  alertCard: {
    padding: spacing.md,
    marginBottom: 8,
  },
  alertTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  alertDate: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  alertMessage: {
    fontSize: font.sm,
    color: colors.text,
    lineHeight: 18,
    fontWeight: '500',
  },
});
