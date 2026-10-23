import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing, font } from '../theme';

export default function Input({
  label,
  icon,
  rightIcon,
  onRightIconPress,
  error,
  hint,
  style,
  inputStyle,
  onFocus,
  onBlur,
  ...rest
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.focusedWrapper,
          error ? styles.errorWrapper : null,
        ]}
      >
        {icon && (
          <Icon
            name={icon}
            size={18}
            color={isFocused ? colors.primary : colors.textMuted}
            style={styles.prefixIcon}
          />
        )}
        <TextInput
          placeholderTextColor={colors.textPlaceholder}
          style={[styles.input, inputStyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {rightIcon && (
          <Pressable onPress={onRightIconPress} hitSlop={8} style={styles.suffixIcon}>
            <Icon
              name={rightIcon}
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hintText}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: font.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm + 4,
    minHeight: 48,
  },
  focusedWrapper: {
    borderColor: colors.primary,
    backgroundColor: '#FAFCFF',
  },
  errorWrapper: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  prefixIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: font.md,
    color: colors.text,
    paddingVertical: spacing.sm + 2,
  },
  suffixIcon: {
    marginLeft: 8,
    padding: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: font.xs,
    marginTop: 4,
    fontWeight: '500',
  },
  hintText: {
    color: colors.textMuted,
    fontSize: font.xs,
    marginTop: 4,
  },
});
