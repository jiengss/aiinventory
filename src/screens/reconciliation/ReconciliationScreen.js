import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, font, radius } from '../../theme';

export default function ReconciliationScreen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const runReconciliation = async () => {
    try {
      setLoading(true);
      const { data: result } = await client.post('/reconciliation/run');
      setData(result);
    } catch (e) {
      Alert.alert('Audit Error', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const discrepancies = data?.discrepancies || [];

  return (
    <View style={styles.container}>
      {/* Intro Banner */}
      <View style={styles.introCard}>
        <View style={styles.introIconWrap}>
          <Icon name="git-compare-outline" size={24} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.introTitle}>End-of-Shift Reconciliation</Text>
          <Text style={styles.introSub}>
            Compares POS sales register transactions against logged physical inventory movements.
          </Text>
        </View>
      </View>

      <Button
        title="Execute Shift Audit"
        icon="refresh-outline"
        onPress={runReconciliation}
        loading={loading}
        size="lg"
        style={{ marginHorizontal: spacing.md, marginBottom: spacing.md }}
      />

      {data && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultsHeaderRow}>
            <Text style={styles.resultsHeaderTitle}>Audit Findings</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>
                {discrepancies.length} Discrepanc{discrepancies.length === 1 ? 'y' : 'ies'}
              </Text>
            </View>
          </View>

          <FlatList
            data={discrepancies}
            keyExtractor={(d, index) => String(d.id || index)}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const diffNum = parseInt(item.difference, 10) || 0;
              const isNegative = diffNum < 0;
              return (
                <Card variant="elevated" style={styles.discrepancyCard}>
                  <View style={styles.cardTop}>
                    <Text style={styles.prodName}>{item.product_name}</Text>
                    <View
                      style={[
                        styles.diffPill,
                        isNegative ? styles.diffNegative : styles.diffPositive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.diffText,
                          isNegative ? { color: colors.danger } : { color: colors.success },
                        ]}
                      >
                        {item.difference > 0 ? `+${item.difference}` : item.difference} units
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metricsGrid}>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricLabel}>Expected (POS)</Text>
                      <Text style={styles.metricVal}>{item.expected_quantity}</Text>
                    </View>
                    <View style={styles.metricBox}>
                      <Text style={styles.metricLabel}>Actual (Physical)</Text>
                      <Text style={styles.metricVal}>{item.actual_quantity}</Text>
                    </View>
                  </View>
                </Card>
              );
            }}
            ListEmptyComponent={
              <View style={styles.balancedWrap}>
                <Icon name="checkmark-circle" size={44} color={colors.success} style={{ marginBottom: 8 }} />
                <Text style={styles.balancedTitle}>Shift 100% Balanced</Text>
                <Text style={styles.balancedSub}>
                  No variance between sales logs and physical inventory count.
                </Text>
              </View>
            }
          />
        </View>
      )}

      {!data && !loading && (
        <View style={styles.emptyPrompt}>
          <Icon name="analytics-outline" size={48} color={colors.textMuted} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyPromptTitle}>No Active Audit</Text>
          <Text style={styles.emptyPromptSub}>
            Tap &ldquo;Execute Shift Audit&rdquo; to compare current shift ledger with live physical stock.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  introIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  introTitle: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
  },
  introSub: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  resultsHeaderTitle: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  statusBadge: {
    backgroundColor: colors.warningSoft,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  statusBadgeText: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.warning,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  discrepancyCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  prodName: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 8,
  },
  diffPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  diffNegative: {
    backgroundColor: colors.dangerSoft,
    borderColor: colors.dangerBorder,
  },
  diffPositive: {
    backgroundColor: colors.successSoft,
    borderColor: colors.successBorder,
  },
  diffText: {
    fontSize: font.xs,
    fontWeight: '800',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
    padding: 8,
    borderRadius: radius.xs,
  },
  metricLabel: {
    fontSize: font.xs - 1,
    color: colors.textMuted,
  },
  metricVal: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  balancedWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  balancedTitle: {
    fontSize: font.lg,
    fontWeight: '700',
    color: colors.success,
  },
  balancedSub: {
    fontSize: font.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  emptyPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyPromptTitle: {
    fontSize: font.lg,
    fontWeight: '700',
    color: colors.text,
  },
  emptyPromptSub: {
    fontSize: font.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
    lineHeight: 18,
  },
});
