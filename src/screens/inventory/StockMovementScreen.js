import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, font, radius } from '../../theme';

const TYPES = [
  { id: 'in', label: 'Stock In', icon: 'arrow-down-circle', color: colors.success, bg: colors.successSoft, border: colors.successBorder },
  { id: 'out', label: 'Stock Out', icon: 'arrow-up-circle', color: colors.danger, bg: colors.dangerSoft, border: colors.dangerBorder },
  { id: 'adjustment', label: 'Adjust', icon: 'swap-horizontal', color: colors.primary, bg: colors.primarySoft, border: colors.primaryBorder },
];

const PRESETS = [1, 5, 10, 25, 50];

export default function StockMovementScreen({ route, navigation }) {
  const preselected = route.params?.product;
  const [productId, setProductId] = useState(preselected?.id ? String(preselected.id) : '');
  const [type, setType] = useState('in');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const currentTypeConfig = TYPES.find((t) => t.id === type) || TYPES[0];

  const submit = async () => {
    if (!productId || !quantity || Number(quantity) <= 0) {
      return Alert.alert('Invalid Entry', 'Valid Product ID and a positive quantity are required.');
    }
    try {
      setLoading(true);
      await client.post('/stock-movements', {
        product_id: parseInt(productId, 10),
        type,
        quantity: parseInt(quantity, 10),
        notes,
      });
      Alert.alert(
        'Movement Recorded',
        `Successfully logged ${currentTypeConfig.label} of ${quantity} units.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert('Submission Error', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const addPreset = (val) => {
    const current = parseInt(quantity, 10) || 0;
    setQuantity(String(current + val));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Product Banner if preselected */}
      {preselected ? (
        <Card variant="subtle" style={styles.productBanner}>
          <View style={styles.bannerRow}>
            <View style={styles.productIconWrap}>
              <Icon name="cube-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>{preselected.name}</Text>
              <Text style={styles.bannerMeta}>
                SKU: {preselected.sku} • Current Stock: {preselected.quantity ?? 0} {preselected.unit || 'units'}
              </Text>
            </View>
          </View>
        </Card>
      ) : null}

      <Card variant="elevated" style={styles.card}>
        <Text style={styles.sectionTitle}>Movement Type</Text>
        <View style={styles.typeSelectorRow}>
          {TYPES.map((t) => {
            const isSelected = type === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setType(t.id)}
                style={[
                  styles.typeBtn,
                  isSelected && {
                    backgroundColor: t.bg,
                    borderColor: t.border,
                  },
                ]}
              >
                <Icon
                  name={t.icon}
                  size={20}
                  color={isSelected ? t.color : colors.textMuted}
                  style={{ marginBottom: 4 }}
                />
                <Text
                  style={[
                    styles.typeBtnLabel,
                    isSelected && { color: t.color, fontWeight: '700' },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {!preselected && (
          <Input
            label="Product Identifier (ID)"
            icon="barcode-outline"
            value={productId}
            onChangeText={setProductId}
            keyboardType="numeric"
            placeholder="e.g. 1"
          />
        )}

        <Text style={styles.fieldLabel}>Quantity</Text>
        <Input
          icon="calculator-outline"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="0"
          style={{ marginBottom: 8 }}
        />

        {/* Quick Quantity Presets */}
        <View style={styles.presetsRow}>
          <Text style={styles.presetsLabel}>Quick Add:</Text>
          {PRESETS.map((p) => (
            <Pressable
              key={p}
              onPress={() => addPreset(p)}
              style={styles.presetChip}
            >
              <Text style={styles.presetChipText}>+{p}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setQuantity('')} style={styles.clearChip}>
            <Text style={styles.clearChipText}>Reset</Text>
          </Pressable>
        </View>

        <Input
          label="Transaction Notes / Reference (Optional)"
          icon="document-text-outline"
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. PO-88492 or Shift Audit"
          multiline
          inputStyle={{ minHeight: 60 }}
        />

        <Button
          title={`Confirm ${currentTypeConfig.label}`}
          icon={currentTypeConfig.icon}
          onPress={submit}
          loading={loading}
          size="lg"
          style={{ marginTop: spacing.sm }}
        />
      </Card>
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
  productBanner: {
    marginBottom: spacing.md,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTitle: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
  },
  bannerMeta: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  sectionTitle: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.lg,
  },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  typeBtnLabel: {
    fontSize: font.xs,
    fontWeight: '600',
    color: colors.textMuted,
  },
  fieldLabel: {
    fontSize: font.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: 6,
  },
  presetsLabel: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginRight: 4,
  },
  presetChip: {
    backgroundColor: colors.primarySoft,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  presetChipText: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  clearChip: {
    backgroundColor: colors.bgSubtle,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearChipText: {
    fontSize: font.xs,
    color: colors.textMuted,
  },
});
