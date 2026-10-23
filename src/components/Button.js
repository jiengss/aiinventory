import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, radius, font, shadows } from '../theme';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading,
  disabled,
  style,
  textStyle,
}) {
  const getTheme = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: colors.secondary,
          textColor: colors.white,
          border: 'transparent',
          shadow: shadows.sm,
        };
      case 'outline':
        return {
          bg: 'transparent',
          textColor: colors.primary,
          border: colors.primary,
          borderWidth: 1.5,
          shadow: {},
        };
      case 'soft':
        return {
          bg: colors.primarySoft,
          textColor: colors.primaryDark,
          border: colors.primaryBorder,
          borderWidth: 1,
          shadow: {},
        };
      case 'ghost':
        return {
          bg: 'transparent',
          textColor: colors.textSecondary,
          border: 'transparent',
          shadow: {},
        };
      case 'danger':
        return {
          bg: colors.danger,
          textColor: colors.white,
          border: 'transparent',
          shadow: shadows.sm,
        };
      case 'danger-outline':
        return {
          bg: colors.dangerSoft,
          textColor: colors.danger,
          border: colors.dangerBorder,
          borderWidth: 1,
          shadow: {},
        };
      case 'success':
        return {
          bg: colors.success,
          textColor: colors.white,
          border: 'transparent',
          shadow: shadows.sm,
        };
      case 'primary':
      default:
        return {
          bg: colors.primary,
          textColor: colors.white,
          border: 'transparent',
          shadow: shadows.sm,
        };
    }
  };

  const currentTheme = getTheme();

  const sizeStyles = {
    sm: {
      paddingVertical: 7,
      paddingHorizontal: 12,
      fontSize: font.sm,
      iconSize: 16,
    },
    md: {
      paddingVertical: 12,
      paddingHorizontal: 18,
      fontSize: font.md,
      iconSize: 18,
    },
    lg: {
      paddingVertical: 15,
      paddingHorizontal: 24,
      fontSize: font.lg,
      iconSize: 22,
    },
  }[size] || {
    paddingVertical: 12,
    paddingHorizontal: 18,
    fontSize: font.md,
    iconSize: 18,
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.contentRow}>
          <ActivityIndicator size="small" color={currentTheme.textColor} />
          {title ? (
            <Text
              style={[
                styles.text,
                { color: currentTheme.textColor, fontSize: sizeStyles.fontSize, marginLeft: 8 },
                textStyle,
              ]}
            >
              Loading...
            </Text>
          ) : null}
        </View>
      );
    }

    return (
      <View style={styles.contentRow}>
        {icon && iconPosition === 'left' && (
          <Icon
            name={icon}
            size={sizeStyles.iconSize}
            color={currentTheme.textColor}
            style={styles.iconLeft}
          />
        )}
        <Text
          style={[
            styles.text,
            { color: currentTheme.textColor, fontSize: sizeStyles.fontSize },
            textStyle,
          ]}
        >
          {title}
        </Text>
        {icon && iconPosition === 'right' && (
          <Icon
            name={icon}
            size={sizeStyles.iconSize}
            color={currentTheme.textColor}
            style={styles.iconRight}
          />
        )}
      </View>
    );
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
          borderWidth: currentTheme.borderWidth || 0,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
        },
        currentTheme.shadow,
        style,
      ]}
    >
      {renderContent()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
