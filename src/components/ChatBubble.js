import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing, font, shadows } from '../theme';

export default function ChatBubble({ message }) {
  const isUser = message.sender === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userRow : styles.assistantRow]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Icon name="sparkles" size={14} color={colors.accent} />
        </View>
      )}

      <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}
        >
          <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
            {message.message}
          </Text>
        </View>
        <Text style={[styles.metaText, isUser ? styles.userMeta : styles.assistantMeta]}>
          {isUser ? 'You' : 'Inventory Assistant'}
        </Text>
      </View>

      {isUser && (
        <View style={[styles.avatar, styles.userAvatar]}>
          <Icon name="person" size={14} color={colors.white} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginRight: 8,
  },
  userAvatar: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
    marginRight: 0,
    marginLeft: 8,
  },
  bubbleWrapper: {
    maxWidth: '78%',
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  assistantWrapper: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: radius.xs,
    ...shadows.sm,
  },
  assistantBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.sm,
  },
  text: {
    fontSize: font.md,
    lineHeight: 22,
  },
  userText: {
    color: colors.white,
    fontWeight: '500',
  },
  assistantText: {
    color: colors.text,
  },
  metaText: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 4,
    marginHorizontal: 4,
  },
  userMeta: {
    textAlign: 'right',
  },
  assistantMeta: {
    textAlign: 'left',
  },
});
