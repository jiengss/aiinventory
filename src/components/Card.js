import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radius, shadows } from '../theme';

export default function Card({
  children,
  style,
  onPress,
  variant = 'default',
  noPadding = false,
  ...rest
}) {
  const variantStyles = {
    default: styles.defaultCard,
    elevated: styles.elevatedCard,
    subtle: styles.subtleCard,
    outline: styles.outlineCard,
    accent: styles.accentCard,
  };

  const selectedVariantStyle = variantStyles[variant] || styles.defaultCard;
  const paddingStyle = noPadding ? { padding: 0 } : { padding: spacing.md };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.base,
          selectedVariantStyle,
          paddingStyle,
          pressed && styles.pressed,
          style,
        ]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.base,
        selectedVariantStyle,
        paddingStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  defaultCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.sm,
  },
  elevatedCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.md,
  },
  subtleCard: {
    backgroundColor: colors.bgSubtle,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  outlineCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accentCard: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
});
