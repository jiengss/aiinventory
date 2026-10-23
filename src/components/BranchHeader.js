import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useBranch } from '../context/BranchContext';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, font, shadows } from '../theme';

export default function BranchHeader({ showGreeting = true }) {
  const { user } = useAuth();
  const { branches, selectedBranch, setSelectedBranch } = useBranch();
  const [modalVisible, setModalVisible] = useState(false);

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
    <View style={styles.header}>
      {showGreeting && (
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetingText}>
              Welcome back,
            </Text>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.name || user?.email?.split('@')[0] || 'Inventory Lead'}
            </Text>
          </View>

          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>{getInitials(user?.name || user?.email)}</Text>
          </View>
        </View>
      )}

      {/* Branch selector pill */}
      <Pressable
        style={styles.branchPill}
        onPress={() => branches?.length > 1 && setModalVisible(true)}
      >
        <View style={styles.branchLeft}>
          <View style={styles.pinIconWrapper}>
            <Icon name="business" size={14} color={colors.primary} />
          </View>
          <View style={styles.branchTextCol}>
            <Text style={styles.branchSub}>Current Branch</Text>
            <Text style={styles.branchName} numberOfLines={1}>
              {selectedBranch?.name || 'Central Warehouse'}
            </Text>
          </View>
        </View>

        {branches?.length > 1 && (
          <View style={styles.switchBadge}>
            <Text style={styles.switchText}>Change</Text>
            <Icon name="chevron-down" size={12} color={colors.primary} />
          </View>
        )}
      </Pressable>

      {/* Branch selection modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Select Active Branch</Text>
                <Text style={styles.modalSub}>Inventory queries will scope to this branch</Text>
              </View>
              <Pressable
                onPress={() => setModalVisible(false)}
                hitSlop={10}
                style={styles.closeBtn}
              >
                <Icon name="close" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            <FlatList
              data={branches}
              keyExtractor={(b) => String(b.id)}
              renderItem={({ item }) => {
                const isSelected = selectedBranch?.id === item.id;
                return (
                  <Pressable
                    style={[styles.branchItem, isSelected && styles.branchItemSelected]}
                    onPress={() => {
                      setSelectedBranch(item);
                      setModalVisible(false);
                    }}
                  >
                    <View style={styles.branchItemLeft}>
                      <Icon
                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={isSelected ? colors.primary : colors.textMuted}
                        style={{ marginRight: 12 }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.branchItemName,
                            isSelected && styles.branchItemNameSelected,
                          ]}
                        >
                          {item.name}
                        </Text>
                        {item.location && (
                          <Text style={styles.branchItemLoc}>{item.location}</Text>
                        )}
                      </View>
                    </View>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm + 4,
  },
  greetingText: {
    fontSize: font.sm,
    color: colors.textMuted,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  userName: {
    fontSize: font.xl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    borderWidth: 1.5,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.primaryDark,
    fontSize: font.md,
    fontWeight: '800',
  },
  branchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.sm,
  },
  branchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pinIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  branchTextCol: {
    flex: 1,
  },
  branchSub: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  branchName: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
  },
  switchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    marginLeft: 8,
  },
  switchText: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '60%',
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: font.lg,
    fontWeight: '800',
    color: colors.text,
  },
  modalSub: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  branchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
    marginBottom: 6,
    backgroundColor: colors.bgSubtle,
  },
  branchItemSelected: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  branchItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  branchItemName: {
    fontSize: font.md,
    fontWeight: '600',
    color: colors.text,
  },
  branchItemNameSelected: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  branchItemLoc: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
});
