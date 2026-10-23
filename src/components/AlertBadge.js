import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, radius, font } from '../theme';

export default function AlertBadge({ type = 'info', label, size = 'sm', style }) {
  const map = {
    predicted_stockout: {
      bg: colors.dangerSoft,
      border: colors.dangerBorder,
      text: colors.danger,
      icon: 'alert-circle',
      defaultLabel: 'Stockout Risk',
    },
    critical: {
      bg: colors.dangerSoft,
      border: colors.dangerBorder,
      text: colors.danger,
      icon: 'flame',
      defaultLabel: 'Critical',
    },
    low_stock: {
      bg: colors.warningSoft,
      border: colors.warningBorder,
      text: colors.warning,
      icon: 'warning',
      defaultLabel: 'Low Stock',
    },
    warning: {
      bg: colors.warningSoft,
      border: colors.warningBorder,
      text: colors.warning,
      icon: 'warning',
      defaultLabel: 'Warning',
    },
    anomaly: {
      bg: colors.accentSoft,
      border: colors.accentBorder,
      text: colors.accent,
      icon: 'sparkles',
      defaultLabel: 'AI Anomaly',
    },
    pending: {
      bg: colors.warningSoft,
      border: colors.warningBorder,
      text: colors.warning,
      icon: 'time',
      defaultLabel: 'Pending',
    },
    completed: {
      bg: colors.successSoft,
      border: colors.successBorder,
      text: colors.success,
      icon: 'checkmark-circle',
      defaultLabel: 'Completed',
    },
    rejected: {
      bg: colors.dangerSoft,
      border: colors.dangerBorder,
      text: colors.danger,
      icon: 'close-circle',
      defaultLabel: 'Rejected',
    },
    healthy: {
      bg: colors.successSoft,
      border: colors.successBorder,
      text: colors.success,
      icon: 'shield-checkmark',
      defaultLabel: 'Optimal',
    },
    info: {
      bg: colors.infoSoft,
      border: colors.infoBorder,
      text: colors.info,
      icon: 'information-circle',
      defaultLabel: 'Notice',
    },
  };

  const cfg = map[type?.toLowerCase()] || {
    bg: colors.bgSubtle,
    border: colors.border,
    text: colors.textSecondary,
    icon: 'ellipse',
    defaultLabel: type || 'Alert',
  };

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: cfg.bg,
          borderColor: cfg.border,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 12,
        },
        style,
      ]}
    >
      <Icon
        name={cfg.icon}
        size={isSmall ? 12 : 14}
        color={cfg.text}
        style={{ marginRight: 4 }}
      />
      <Text
        style={[
          styles.txt,
          {
            color: cfg.text,
            fontSize: isSmall ? font.xs : font.sm,
          },
        ]}
      >
        {label || cfg.defaultLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
  },
  txt: {
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
