import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, font, radius } from '../../theme';

const PERMISSION_DESCRIPTIONS = {
  view_inventory: 'Access to real-time stock balances across authorized branches',
  log_stock_movements: 'Ability to record stock in, stock out, and manual inventory adjustments',
  request_transfers: 'Initiate inter-branch transfer requests for replenishment',
  view_reports: 'Generate and export AI executive stock audits and discrepancy reports',
};

export default function PermissionsScreen() {
  const [roleName, setRoleName] = useState('Store Supervisor');
  const [description, setDescription] = useState('Responsible for stock receipt, inventory verification, and shift reconciliation.');
  const [suggestions, setSuggestions] = useState([
    'view_inventory',
    'log_stock_movements',
    'request_transfers',
    'view_reports',
  ]);
  const [selected, setSelected] = useState({
    view_inventory: true,
    log_stock_movements: true,
    request_transfers: true,
    view_reports: true,
  });
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  const suggest = async () => {
    if (!roleName.trim()) {
      return Alert.alert('Required', 'Please enter a role name to generate permissions.');
    }
    try {
      setLoading(true);
      const { data } = await client.post('/permissions/suggest', {
        role_name: roleName,
        description,
      });
      const perms = data.permissions || [];
      setSuggestions(perms);
      const map = {};
      perms.forEach((p) => {
        map[p] = true;
      });
      setSelected(map);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const apply = async () => {
    try {
      setApplying(true);
      await client.post('/permissions/apply', {
        role_name: roleName,
        permissions: Object.keys(selected).filter((p) => selected[p]),
      });
      Alert.alert('Success', `Permissions applied to role "${roleName}".`);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI Role & Access Setup</Text>
        <Text style={styles.subtitle}>
          Define organizational positions and let the AI recommendation engine assign the optimal security policies.
        </Text>
      </View>

      <Card variant="elevated" style={styles.card}>
        <Input
          label="Role Title"
          icon="shield-outline"
          value={roleName}
          onChangeText={setRoleName}
          placeholder="e.g. Branch Cashier, Lead Auditor"
        />

        <Input
          label="Job Scope & Responsibilities"
          icon="document-text-outline"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe duties, e.g. Handles incoming stock deliveries and audits"
          multiline
          inputStyle={{ minHeight: 64 }}
        />

        <Button
          title="Analyze & Suggest Permissions"
          icon="sparkles"
          onPress={suggest}
          loading={loading}
          size="md"
        />
      </Card>

      {suggestions.length > 0 && (
        <Card variant="default" style={styles.permsCard}>
          <View style={styles.permsHeader}>
            <View style={styles.aiTag}>
              <Icon name="sparkles" size={12} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.aiTagText}>Recommended Policies</Text>
            </View>
            <Text style={styles.permsCount}>
              {Object.values(selected).filter(Boolean).length} / {suggestions.length} Active
            </Text>
          </View>

          {suggestions.map((p) => {
            const isChecked = !!selected[p];
            const readableTitle = p.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            const desc = PERMISSION_DESCRIPTIONS[p] || 'Standard organizational role capability';

            return (
              <View key={p} style={styles.permRow}>
                <View style={styles.permInfo}>
                  <Text style={styles.permTitle}>{readableTitle}</Text>
                  <Text style={styles.permDesc}>{desc}</Text>
                </View>

                <Switch
                  value={isChecked}
                  onValueChange={(v) => setSelected((s) => ({ ...s, [p]: v }))}
                  trackColor={{ false: colors.border, true: colors.primaryLight }}
                  thumbColor={isChecked ? colors.primary : colors.white}
                />
              </View>
            );
          })}

          <Button
            title="Deploy Security Policy"
            icon="shield-checkmark"
            onPress={apply}
            loading={applying}
            size="lg"
            style={{ marginTop: spacing.md }}
          />
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
  permsCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  permsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  aiTagText: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.accent,
  },
  permsCount: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: '600',
  },
  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  permInfo: {
    flex: 1,
    marginRight: 14,
  },
  permTitle: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
  },
  permDesc: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
});
