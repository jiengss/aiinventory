import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Image, ScrollView, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, font, radius, shadows } from '../../theme';

export default function DigitizeScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState('pick'); // 'pick' | 'camera'
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const camRef = useRef(null);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      setPhoto(res.assets[0]);
      setResult(null);
      setConfirmed(false);
    }
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        return Alert.alert('Permission Required', 'Camera access is needed to capture invoices.');
      }
    }
    setMode('camera');
  };

  const capturePhoto = async () => {
    if (camRef.current) {
      const pic = await camRef.current.takePictureAsync({ quality: 0.85 });
      setPhoto(pic);
      setMode('pick');
      setResult(null);
      setConfirmed(false);
    }
  };

  const uploadAndOcr = async () => {
    if (!photo) return;
    try {
      setLoading(true);
      const form = new FormData();
      form.append('file', {
        uri: photo.uri,
        name: 'invoice-scan.jpg',
        type: 'image/jpeg',
      });
      const { data } = await client.post('/digitize/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (e) {
      Alert.alert('OCR Failed', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmAndEncode = async () => {
    if (!result?.id) return;
    try {
      setLoading(true);
      await client.post(`/digitize/${result.id}/confirm`);
      setConfirmed(true);
      Alert.alert('Encoded Successfully', 'The extracted inventory items have been recorded in your system.');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={camRef} style={styles.fullCamera} facing="back">
          {/* Viewfinder overlay */}
          <View style={styles.viewfinderFrame}>
            <View style={styles.viewfinderCornerTL} />
            <View style={styles.viewfinderCornerTR} />
            <View style={styles.viewfinderCornerBL} />
            <View style={styles.viewfinderCornerBR} />
            <Text style={styles.viewfinderHint}>Align document inside the frame</Text>
          </View>
        </CameraView>

        <View style={styles.camBar}>
          <Pressable onPress={() => setMode('pick')} style={styles.cancelCamBtn}>
            <Icon name="close" size={24} color={colors.white} />
          </Pressable>
          <Pressable onPress={capturePhoto} style={styles.shutterBtn}>
            <View style={styles.shutterInner} />
          </Pressable>
          <View style={{ width: 44 }} />
        </View>
      </View>
    );
  }

  const extracted = result?.extracted_data;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Intro Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Digitize Paper Documents</Text>
        <Text style={styles.subtitle}>
          Scan invoices, delivery receipts, or POs. Optical character recognition extracts line items automatically.
        </Text>
      </View>

      {/* Action Selector */}
      <View style={styles.actionButtonsRow}>
        <Pressable style={styles.choiceCard} onPress={openCamera}>
          <View style={[styles.choiceIconWrap, { backgroundColor: colors.primarySoft }]}>
            <Icon name="camera" size={22} color={colors.primary} />
          </View>
          <Text style={styles.choiceTitle}>Camera</Text>
          <Text style={styles.choiceSub}>Capture document</Text>
        </Pressable>

        <Pressable style={styles.choiceCard} onPress={pickImage}>
          <View style={[styles.choiceIconWrap, { backgroundColor: colors.infoSoft }]}>
            <Icon name="images" size={22} color={colors.info} />
          </View>
          <Text style={styles.choiceTitle}>Gallery</Text>
          <Text style={styles.choiceSub}>Choose file</Text>
        </Pressable>
      </View>

      {/* Document Preview Frame */}
      {photo && (
        <Card variant="elevated" style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View style={styles.previewTag}>
              <Icon name="document-attach-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.previewTagText}>Document Attached</Text>
            </View>
            <Pressable onPress={() => { setPhoto(null); setResult(null); }} hitSlop={8}>
              <Icon name="trash-outline" size={18} color={colors.danger} />
            </Pressable>
          </View>

          <Image source={{ uri: photo.uri }} style={styles.imagePreview} />

          {!result && (
            <Button
              title="Run AI OCR Extraction"
              icon="sparkles"
              onPress={uploadAndOcr}
              loading={loading}
              size="lg"
            />
          )}
        </Card>
      )}

      {/* Extracted Data Visual Summary */}
      {extracted && (
        <Card variant="accent" style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={styles.resultBadge}>
              <Icon name="checkmark-done" size={16} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.resultBadgeText}>Extracted Invoice Data</Text>
            </View>
            <Text style={styles.resultId}>Doc ID: {result.id}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Invoice Number</Text>
              <Text style={styles.detailValue}>{extracted.invoice || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{extracted.date || 'N/A'}</Text>
            </View>
            <View style={[styles.detailItem, { width: '100%' }]}>
              <Text style={styles.detailLabel}>Supplier / Vendor</Text>
              <Text style={styles.detailValue}>{extracted.supplier || 'N/A'}</Text>
            </View>
          </View>

          {/* Items Table */}
          {Array.isArray(extracted.items) && extracted.items.length > 0 && (
            <View style={styles.itemsTable}>
              <Text style={styles.tableTitle}>Identified Line Items</Text>
              {extracted.items.map((item, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemSku}>{item.sku}</Text>
                  </View>
                  <Text style={styles.itemQty}>{item.qty} units</Text>
                  {item.unit_cost ? (
                    <Text style={styles.itemCost}>${Number(item.unit_cost).toFixed(2)}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          )}

          {!confirmed ? (
            <Button
              title="Confirm & Encode to Stock"
              icon="checkmark-circle"
              onPress={confirmAndEncode}
              loading={loading}
              size="lg"
              style={{ marginTop: spacing.md }}
            />
          ) : (
            <View style={styles.confirmedBanner}>
              <Icon name="shield-checkmark" size={18} color={colors.success} style={{ marginRight: 6 }} />
              <Text style={styles.confirmedBannerText}>Encoded into Inventory</Text>
            </View>
          )}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: font.xl,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: font.sm,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 20,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.md,
  },
  choiceCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    ...shadows.sm,
  },
  choiceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  choiceTitle: {
    fontSize: font.md,
    fontWeight: '700',
    color: colors.text,
  },
  choiceSub: {
    fontSize: font.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  previewCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  previewTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewTagText: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    backgroundColor: colors.bgSubtle,
    resizeMode: 'cover',
  },
  resultCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentBorder,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultBadgeText: {
    fontSize: font.sm,
    fontWeight: '800',
    color: colors.accent,
  },
  resultId: {
    fontSize: font.xs,
    fontFamily: 'monospace',
    color: colors.textMuted,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: spacing.md,
  },
  detailItem: {
    width: '48%',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: font.xs - 1,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  itemsTable: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tableTitle: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: colors.borderLight,
  },
  itemSku: {
    fontSize: font.sm,
    fontFamily: 'monospace',
    fontWeight: '600',
    color: colors.text,
  },
  itemQty: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 12,
  },
  itemCost: {
    fontSize: font.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  confirmedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: colors.successBorder,
    paddingVertical: 12,
    borderRadius: radius.sm,
    marginTop: spacing.md,
  },
  confirmedBannerText: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.success,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullCamera: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderFrame: {
    width: '84%',
    height: '60%',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderCornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primaryLight,
  },
  viewfinderCornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.primaryLight,
  },
  viewfinderCornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: colors.primaryLight,
  },
  viewfinderCornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: colors.primaryLight,
  },
  viewfinderHint: {
    color: colors.white,
    fontSize: font.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  camBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  cancelCamBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 4,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
  },
});
