import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, font, radius, spacing, shadows } from '../theme';

export default function Loading({ label = 'Loading…', sublabel }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.label}>{label}</Text>
        {sublabel ? <Text style={styles.sublabel}>{sublabel}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  card: {
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.md,
    minWidth: 180,
  },
  label: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: font.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  sublabel: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: font.xs,
    textAlign: 'center',
  },
});
