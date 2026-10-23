import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, font, radius } from '../../theme';

const TYPES = [
  { id: 'inventory', label: 'Inventory', icon: 'cube-outline' },
  { id: 'sales', label: 'Sales Audit', icon: 'cart-outline' },
  { id: 'stock_movements', label: 'Movements', icon: 'swap-vertical-outline' },
];

export default function ReportsScreen() {
  const [type, setType] = useState('inventory');
  const [from, setFrom] = useState('2026-01-01');
  const [to, setTo] = useState('2026-12-31');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const generate = async () => {
    try {
      setLoading(true);
      const { data } = await client.post('/reports/generate', {
        type,
        from_date: from,
        to_date: to,
      });
      setReport(data);
    } catch (e) {
      Alert.alert('Report Error', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    if (preset === 'month') {
      setFrom('2026-10-01');
      setTo('2026-10-31');
    } else if (preset === 'week') {
      setFrom('2026-10-16');
      setTo('2026-10-23');
    } else {
      setFrom('2026-01-01');
      setTo('2026-12-31');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI Report Generator</Text>
        <Text style={styles.subtitle}>
          Generate executive inventory audits, variance reports, and stock movement logs.
        </Text>
      </View>

      <Card variant="elevated" style={styles.card}>
        <Text style={styles.sectionLabel}>Select Report Domain</Text>
        <View style={styles.typesRow}>
          {TYPES.map((t) => {
            const isSelected = type === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setType(t.id)}
                style={[styles.typeChip, isSelected && styles.typeChipActive]}
              >
                <Icon
                  name={t.icon}
                  size={16}
                  color={isSelected ? colors.primaryDark : colors.textMuted}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.typeText, isSelected && styles.typeTextActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.presetRow}>
          <Text style={styles.presetLabel}>Quick Range:</Text>
          <Pressable style={styles.presetBtn} onPress={() => applyPreset('week')}>
            <Text style={styles.presetBtnText}>This Week</Text>
          </Pressable>
          <Pressable style={styles.presetBtn} onPress={() => applyPreset('month')}>
            <Text style={styles.presetBtnText}>October 2026</Text>
          </Pressable>
          <Pressable style={styles.presetBtn} onPress={() => applyPreset('year')}>
            <Text style={styles.presetBtnText}>Full Year</Text>
          </Pressable>
        </View>

        <View style={styles.datesRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input
              label="From Date"
              icon="calendar-outline"
              value={from}
              onChangeText={setFrom}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Input
              label="To Date"
              icon="calendar-outline"
              value={to}
              onChangeText={setTo}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>

        <Button
          title="Synthesize AI Audit Report"
          icon="sparkles"
          onPress={generate}
          loading={loading}
          size="lg"
        />
      </Card>

      {report && (
        <Card variant="accent" style={styles.reportCard}>
          <View style={styles.reportTop}>
            <View style={styles.readyBadge}>
              <Icon name="checkmark-circle" size={14} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.readyBadgeText}>Report Synthesized</Text>
            </View>
            <Text style={styles.readyDate}>Verified Real-time</Text>
          </View>

          <Text style={styles.reportTitle}>{report.title || 'Generated Report'}</Text>
          {report.summary && (
            <Text style={styles.summaryText}>{report.summary}</Text>
          )}

          {report.download_url && (
            <Button
              title="Open / Export Report Document"
              variant="soft"
              icon="open-outline"
              iconPosition="right"
              onPress={() => WebBrowser.openBrowserAsync(report.download_url)}
              style={{ marginTop: spacing.md }}
            />
          )}
        </Card>
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
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: font.xl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: font.sm,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.md,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgSubtle,
    paddingVertical: 10,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primaryBorder,
  },
  typeText: {
    fontSize: font.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  typeTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: 6,
  },
  presetLabel: {
    fontSize: font.xs,
    color: colors.textMuted,
  },
  presetBtn: {
    backgroundColor: colors.bgSubtle,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  presetBtnText: {
    fontSize: font.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  datesRow: {
    flexDirection: 'row',
  },
  reportCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentBorder,
  },
  reportTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  readyBadgeText: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.accent,
  },
  readyDate: {
    fontSize: font.xs,
    color: colors.textMuted,
  },
  reportTitle: {
    fontSize: font.lg,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2,
  },
  summaryText: {
    fontSize: font.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 8,
  },
});
