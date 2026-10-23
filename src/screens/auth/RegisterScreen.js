import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, font, radius, shadows } from '../../theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      return Alert.alert('Required Fields', 'Please complete all fields to create your account.');
    }
    try {
      setLoading(true);
      await register({ name: name.trim(), email: email.trim(), password });
    } catch (e) {
      Alert.alert('Registration Failed', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
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
        {/* Back Link */}
        <Pressable
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Icon name="arrow-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backText}>Back to Sign In</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join your organization&apos;s inventory management workspace
          </Text>
        </View>

        {/* Card */}
        <Card variant="elevated" style={styles.card}>
          <Input
            label="Full Name"
            icon="person-outline"
            placeholder="Jane Doe"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Work Email"
            icon="mail-outline"
            placeholder="jane@company.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            icon="lock-closed-outline"
            placeholder="Minimum 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Button
            title="Create Workspace Account"
            onPress={handleRegister}
            loading={loading}
            icon="person-add-outline"
            size="lg"
            style={{ marginTop: spacing.xs }}
          />
        </Card>

        {/* Security badge */}
        <View style={styles.securityRow}>
          <Icon name="shield-checkmark-outline" size={16} color={colors.success} style={{ marginRight: 6 }} />
          <Text style={styles.securityText}>Role-based access control & multi-branch security</Text>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: font.sm,
    color: colors.textSecondary,
    fontWeight: '600',
    marginLeft: 6,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: font.hero,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: font.md,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 22,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    ...shadows.md,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  securityText: {
    fontSize: font.xs,
    color: colors.textMuted,
  },
});
