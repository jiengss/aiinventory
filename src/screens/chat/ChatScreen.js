import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import ChatBubble from '../../components/ChatBubble';
import { colors, spacing, font, radius, shadows } from '../../theme';

const SUGGESTIONS = [
  'Which items are low in stock?',
  'Where are Headphones available?',
  'Summarize today movements',
];

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: 'greet',
      sender: 'assistant',
      message: 'Hello! I am your AI Inventory Assistant. You can ask me to check stock across branches, locate transfer opportunities, or review replenishment forecasts.',
    },
  ]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.get('/chat/history');
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        }
      } catch (_err) {
        // Chat history is optional
      }
    })();
  }, []);

  const msgCounter = useRef(1);

  const send = useCallback(async (msgText) => {
    const payload = (typeof msgText === 'string' ? msgText : text).trim();
    if (!payload || sending) return;

    msgCounter.current += 1;
    const currentId = msgCounter.current;
    const userMsg = { id: `msg-${currentId}-u`, sender: 'user', message: payload };
    setMessages((m) => [...m, userMsg]);
    setText('');
    setSending(true);

    try {
      const { data } = await client.post('/chat/send', { message: payload });
      setMessages((m) => [
        ...m,
        {
          id: `msg-${currentId}-a`,
          sender: 'assistant',
          message: data.reply || data.message || 'Information retrieved.',
        },
      ]);
    } catch (_e) {
      setMessages((m) => [
        ...m,
        {
          id: `msg-${currentId}-e`,
          sender: 'assistant',
          message: 'Sorry, I encountered an issue retrieving the requested inventory data. Please try again.',
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [text, sending]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Subheader / AI Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.onlineDot} />
        <Text style={styles.statusText}>Supabase Inventory AI Agent • Online & Connected</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m, index) => String(m.id || index)}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Suggested Prompts Pill Carousel */}
      <View style={styles.suggestionsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestionsScroll}
        >
          {SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => send(s)}
              disabled={sending}
              style={({ pressed }) => [
                styles.suggestionPill,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Icon name="sparkles" size={12} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={styles.suggestionText}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Input Composer */}
      <View style={styles.composerBar}>
        <View style={styles.inputBox}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Ask anything about stock or transfers…"
            placeholderTextColor={colors.textPlaceholder}
            style={styles.input}
            multiline
            maxLength={400}
          />
        </View>

        <Pressable
          onPress={() => send()}
          disabled={!text.trim() || sending}
          style={({ pressed }) => [
            styles.sendBtn,
            (!text.trim() || sending) && styles.sendBtnDisabled,
            pressed && { opacity: 0.8 },
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Icon name="arrow-up" size={20} color={colors.white} />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  messagesList: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  suggestionsContainer: {
    paddingVertical: 6,
    backgroundColor: colors.bg,
  },
  suggestionsScroll: {
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  suggestionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.sm,
  },
  suggestionText: {
    fontSize: font.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  composerBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  inputBox: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    maxHeight: 100,
    minHeight: 44,
    justifyContent: 'center',
  },
  input: {
    fontSize: font.md,
    color: colors.text,
    paddingTop: 8,
    paddingBottom: 8,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    ...shadows.sm,
  },
  sendBtnDisabled: {
    backgroundColor: colors.borderStrong,
  },
});
