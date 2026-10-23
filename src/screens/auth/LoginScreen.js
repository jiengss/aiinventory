import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, font, radius, shadows } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail = email, loginPass = password) => {
    const targetEmail = loginEmail.trim();
    if (!targetEmail || !loginPass) {
      return Alert.alert('Credentials Required', 'Please enter your email and password.');
    }
    try {
      setLoading(true);
      await login(targetEmail, loginPass);
    } catch (e) {
      Alert.alert('Login failed', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    setEmail('admin@inventory.com');
    setPassword('admin123');
    handleLogin('admin@inventory.com', 'admin123');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.wrap}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Hero */}
        <View style={styles.heroSection}>
          <View style={styles.logoBadge}>
            <Icon name="cube" size={32} color={colors.primary} />
          </View>
          <Text style={styles.brandTitle}>Inventory<Text style={{ color: colors.primary }}>AI</Text></Text>
          <Text style={styles.brandSubtitle}>
            Intelligent Multi-Branch Stock & Logistics
          </Text>
        </View>

        {/* Login Card */}
        <Card variant="elevated" style={styles.card}>
          <Text style={styles.cardHeader}>Welcome Back</Text>
          <Text style={styles.cardSub}>Sign in with your workspace credentials</Text>

          <Input
            label="Email Address"
            icon="mail-outline"
            placeholder="admin@inventory.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Input
            label="Password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Button
            title="Sign In to Workspace"
            onPress={() => handleLogin()}
            loading={loading}
            icon="arrow-forward"
            iconPosition="right"
            size="lg"
            style={styles.submitBtn}
          />

          {/* Quick Demo Login Option */}
          <Pressable
            onPress={handleDemoSignIn}
            style={({ pressed }) => [
              styles.demoChip,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Icon name="flash-outline" size={14} color={colors.accent} style={{ marginRight: 6 }} />
            <Text style={styles.demoChipText}>Quick Demo Sign-In (Auto-Fill)</Text>
          </Pressable>
        </Card>

        {/* Register Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>New to InventoryAI?</Text>
          <Pressable onPress={() => navigation.navigate('Register')} hitSlop={10}>
            <Text style={styles.registerLink}> Create an account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  wrap: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  brandTitle: {
    fontSize: font.hero,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: font.sm,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 260,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  cardHeader: {
    fontSize: font.xl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: font.sm,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  submitBtn: {
    marginTop: spacing.xs,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    marginTop: spacing.md,
  },
  demoChipText: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.accent,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontSize: font.md,
    color: colors.textMuted,
  },
  registerLink: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.primary,
  },
});
