import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, radius, spacing, font, shadows } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useBranch } from '../context/BranchContext';

import DashboardScreen from '../screens/inventory/DashboardScreen';
import ProductListScreen from '../screens/inventory/ProductListScreen';
import ProductDetailScreen from '../screens/inventory/ProductDetailScreen';
import StockMovementScreen from '../screens/inventory/StockMovementScreen';
import DigitizeScreen from '../screens/digitize/DigitizeScreen';
import AlertsScreen from '../screens/alerts/AlertsScreen';
import TransferSearchScreen from '../screens/transfers/TransferSearchScreen';
import TransferListScreen from '../screens/transfers/TransferListScreen';
import ReconciliationScreen from '../screens/reconciliation/ReconciliationScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import ImageRecognitionScreen from '../screens/vision/ImageRecognitionScreen';
import PermissionsScreen from '../screens/admin/PermissionsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const commonScreenOptions = {
  headerStyle: {
    backgroundColor: colors.white,
  },
  headerShadowVisible: false,
  headerTintColor: colors.primary,
  headerTitleStyle: {
    fontWeight: '700',
    fontSize: font.lg,
    color: colors.text,
  },
  headerBackTitleVisible: false,
};

function InventoryStack() {
  return (
    <Stack.Navigator screenOptions={commonScreenOptions}>
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Products"
        component={ProductListScreen}
        options={{ title: 'Product Catalog' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Details' }}
      />
      <Stack.Screen
        name="StockMovement"
        component={StockMovementScreen}
        options={{ title: 'Log Stock Movement' }}
      />
    </Stack.Navigator>
  );
}

function TransferStack() {
  return (
    <Stack.Navigator screenOptions={commonScreenOptions}>
      <Stack.Screen
        name="TransferSearch"
        component={TransferSearchScreen}
        options={{ title: 'Find Nearby Stock' }}
      />
      <Stack.Screen
        name="TransferList"
        component={TransferListScreen}
        options={{ title: 'Transfer Requests' }}
      />
    </Stack.Navigator>
  );
}

function MoreMenuScreen({ navigation }) {
  const { logout, user } = useAuth();
  const { selectedBranch } = useBranch();

  const sections = [
    {
      title: 'Operations & Logistics',
      items: [
        {
          label: 'Branch Transfers',
          sub: 'Find nearby stock and track requests',
          icon: 'swap-horizontal',
          iconColor: colors.primary,
          iconBg: colors.primarySoft,
          to: 'Transfers',
        },
        {
          label: 'Shift Reconciliation',
          sub: 'Audit sales vs physical stock movements',
          icon: 'git-compare-outline',
          iconColor: colors.accent,
          iconBg: colors.accentSoft,
          to: 'Reconciliation',
        },
      ],
    },
    {
      title: 'AI Intelligence & Vision',
      items: [
        {
          label: 'Shelf Recognition',
          sub: 'Count shelf items with vision AI',
          icon: 'scan-circle-outline',
          iconColor: colors.info,
          iconBg: colors.infoSoft,
          to: 'ImageRecognition',
        },
        {
          label: 'AI Audit Reports',
          sub: 'Generate stock & discrepancy summaries',
          icon: 'document-text-outline',
          iconColor: colors.warning,
          iconBg: colors.warningSoft,
          to: 'Reports',
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          label: 'Roles & Permissions',
          sub: 'Configure AI-recommended access policies',
          icon: 'shield-checkmark-outline',
          iconColor: colors.secondary,
          iconBg: colors.bgSubtle,
          to: 'Permissions',
        },
      ],
    },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <ScrollView style={styles.menuContainer} contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{getInitials(user?.name || user?.email)}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name || 'Inventory Manager'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'admin@inventory.com'}</Text>
          <View style={styles.roleTag}>
            <Icon name="shield-outline" size={12} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.roleTagText}>{user?.role ? user.role.toUpperCase() : 'STORE MANAGER'}</Text>
          </View>
        </View>
      </View>

      {/* Active Branch Banner */}
      {selectedBranch && (
        <View style={styles.branchBanner}>
          <Icon name="location-outline" size={16} color={colors.accent} style={{ marginRight: 8 }} />
          <Text style={styles.branchBannerText} numberOfLines={1}>
            Assigned: <Text style={{ fontWeight: '700' }}>{selectedBranch.name}</Text>
          </Text>
        </View>
      )}

      {/* Menu Groups */}
      {sections.map((section) => (
        <View key={section.title} style={styles.sectionWrap}>
          <Text style={styles.sectionHeader}>{section.title}</Text>
          <View style={styles.menuGroup}>
            {section.items.map((it, idx) => (
              <Pressable
                key={it.label}
                onPress={() => navigation.navigate(it.to)}
                style={({ pressed }) => [
                  styles.menuItem,
                  idx !== section.items.length - 1 && styles.menuItemBorder,
                  pressed && styles.menuItemPressed,
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: it.iconBg }]}>
                  <Icon name={it.icon} size={20} color={it.iconColor} />
                </View>
                <View style={styles.menuItemTextCol}>
                  <Text style={styles.menuItemTitle}>{it.label}</Text>
                  <Text style={styles.menuItemSub}>{it.sub}</Text>
                </View>
                <Icon name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {/* Logout Action */}
      <Pressable
        onPress={logout}
        style={({ pressed }) => [
          styles.logoutBtn,
          pressed && { opacity: 0.8 },
        ]}
      >
        <Icon name="log-out-outline" size={20} color={colors.danger} style={{ marginRight: 8 }} />
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.versionText}>InventoryAI Mobile v1.0.0 • Supabase Connected</Text>
    </ScrollView>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={commonScreenOptions}>
      <Stack.Screen
        name="MoreMenu"
        component={MoreMenuScreen}
        options={{ title: 'Management & Tools' }}
      />
      <Stack.Screen
        name="Transfers"
        component={TransferStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Reconciliation"
        component={ReconciliationScreen}
        options={{ title: 'Shift Reconciliation' }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'AI Report Generator' }}
      />
      <Stack.Screen
        name="ImageRecognition"
        component={ImageRecognitionScreen}
        options={{ title: 'Vision Item Counter' }}
      />
      <Stack.Screen
        name="Permissions"
        component={PermissionsScreen}
        options={{ title: 'Roles & Permissions' }}
      />
    </Stack.Navigator>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            Home: focused ? 'cube' : 'cube-outline',
            Chat: focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline',
            Scan: focused ? 'scan' : 'scan-outline',
            Alerts: focused ? 'notifications' : 'notifications-outline',
            More: focused ? 'grid' : 'grid-outline',
          };
          const iconName = icons[route.name] || 'ellipse-outline';
          return (
            <View style={focused ? styles.activeTabIndicator : null}>
              <Icon name={iconName} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={InventoryStack}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: true,
          title: 'AI Stock Assistant',
          headerStyle: { backgroundColor: colors.white },
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', fontSize: font.lg, color: colors.text },
          tabBarLabel: 'Assistant',
        }}
      />
      <Tab.Screen
        name="Scan"
        component={DigitizeScreen}
        options={{
          headerShown: true,
          title: 'OCR Invoice Scanner',
          headerStyle: { backgroundColor: colors.white },
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', fontSize: font.lg, color: colors.text },
          tabBarLabel: 'Scan',
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          headerShown: true,
          title: 'Stock Alerts',
          headerStyle: { backgroundColor: colors.white },
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', fontSize: font.lg, color: colors.text },
          tabBarLabel: 'Alerts',
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{ tabBarLabel: 'Hub' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 64,
    paddingTop: 6,
    paddingBottom: 8,
    ...shadows.md,
  },
  tabBarItem: {
    paddingVertical: 2,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  activeTabIndicator: {
    transform: [{ scale: 1.05 }],
  },
  menuContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profileAvatarText: {
    fontSize: font.lg,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: font.lg,
    fontWeight: '800',
    color: colors.text,
  },
  profileEmail: {
    fontSize: font.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    marginTop: 6,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  branchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  branchBannerText: {
    fontSize: font.xs,
    color: colors.accent,
    flex: 1,
  },
  sectionWrap: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  menuGroup: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuItemPressed: {
    backgroundColor: colors.bgSubtle,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
  },
  menuItemSub: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  logoutBtnText: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.danger,
  },
  versionText: {
    textAlign: 'center',
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
});
