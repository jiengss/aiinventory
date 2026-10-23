import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Loading from '../../components/Loading';
import { colors, spacing, font, radius } from '../../theme';

export default function TransferSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requestingId, setRequestingId] = useState(null);

  const search = async () => {
    try {
      setLoading(true);
      const { data } = await client.get('/transfer/available', { params: { product_name: query } });
      setResults(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const requestTransfer = async (row) => {
    try {
      setRequestingId(row.id);
      await client.post('/transfer/request', {
        product_id: row.product_id,
        from_branch_id: row.branch_id,
        quantity: 1,
      });
      Alert.alert(
        'Transfer Requested',
        `Request dispatched to ${row.branch_name || 'branch'} for 1 unit.`,
        [
          { text: 'View All Transfers', onPress: () => navigation.navigate('TransferList') },
          { text: 'Close', style: 'cancel' },
        ]
      );
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Input
          placeholder="Enter item name (e.g. Headphones, Paracetamol)..."
          value={query}
          onChangeText={setQuery}
          icon="search-outline"
          rightIcon={query ? 'close-circle' : null}
          onRightIconPress={() => setQuery('')}
          style={{ marginBottom: spacing.xs }}
        />
        <Button
          title="Search Multi-Branch Inventory"
          icon="location-outline"
          onPress={search}
          loading={loading}
          size="md"
        />
      </View>

      {loading && <Loading label="Locating stock in branches…" sublabel="Querying real-time warehouse databases" />}

      {results === null && !loading && (
        <View style={styles.initialWrap}>
          <View style={styles.initialIconWrap}>
            <Icon name="git-network-outline" size={38} color={colors.primary} />
          </View>
          <Text style={styles.initialTitle}>Inter-Branch Stock Locator</Text>
          <Text style={styles.initialSub}>
            Find stock instantly in nearby fulfillment centers and create transfer orders with one tap.
          </Text>
        </View>
      )}

      {results !== null && !loading && (
        <FlatList
          data={results}
          keyExtractor={(r, index) => String(r.id || index)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isRequesting = requestingId === item.id;
            return (
              <Card variant="elevated" style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.branchIconWrap}>
                    <Icon name="business" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.branchName}>{item.branch_name}</Text>
                    <View style={styles.distanceRow}>
                      <Icon name="navigate-outline" size={12} color={colors.textMuted} style={{ marginRight: 3 }} />
                      <Text style={styles.distanceText}>
                        {item.distance_km ?? '—'} km away
                      </Text>
                    </View>
                  </View>

                  <View style={styles.availPill}>
                    <Text style={styles.availNumber}>{item.quantity}</Text>
                    <Text style={styles.availUnit}>avail</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Button
                    title="Request 1 Unit Transfer"
                    variant="soft"
                    size="sm"
                    icon="arrow-forward"
                    iconPosition="right"
                    onPress={() => requestTransfer(item)}
                    loading={isRequesting}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            );
          }}
          ListEmptyComponent={
            <View style={styles.initialWrap}>
              <View style={styles.initialIconWrap}>
                <Icon name="alert-circle-outline" size={38} color={colors.warning} />
              </View>
              <Text style={styles.initialTitle}>No Available Stock Found</Text>
              <Text style={styles.initialSub}>
                None of your connected branches currently have this product available for transfer.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  searchHeader: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  resultCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  branchIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  branchName: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  distanceText: {
    fontSize: font.xs,
    color: colors.textMuted,
    fontWeight: '500',
  },
  availPill: {
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  availNumber: {
    fontSize: font.md,
    fontWeight: '800',
    color: colors.success,
  },
  availUnit: {
    fontSize: 9,
    color: colors.success,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderColor: colors.borderLight,
    paddingTop: spacing.sm,
  },
  initialWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  initialIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  initialTitle: {
    fontSize: font.lg,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  initialSub: {
    fontSize: font.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 290,
  },
});
