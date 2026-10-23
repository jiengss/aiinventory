import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import client from '../../api/client';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, spacing, font, radius } from '../../theme';

export default function ImageRecognitionScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState('pick');
  const [photo, setPhoto] = useState(null);
  const [detections, setDetections] = useState(null);
  const [loading, setLoading] = useState(false);
  const camRef = useRef(null);

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });
    if (!res.canceled && res.assets && res.assets.length > 0) {
      setPhoto(res.assets[0]);
      setDetections(null);
    }
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        return Alert.alert('Permission Denied', 'Camera permission is required.');
      }
    }
    setMode('camera');
  };

  const takePhoto = async () => {
    if (camRef.current) {
      const pic = await camRef.current.takePictureAsync({ quality: 0.85 });
      setPhoto(pic);
      setMode('pick');
      setDetections(null);
    }
  };

  const analyze = async () => {
    if (!photo) return;
    try {
      setLoading(true);
      const form = new FormData();
      form.append('image', {
        uri: photo.uri,
        name: 'shelf.jpg',
        type: 'image/jpeg',
      });
      const { data } = await client.post('/vision/recognize', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDetections(data.items || []);
    } catch (e) {
      Alert.alert('Analysis Failed', e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'camera') {
    return (
      <View style={styles.camContainer}>
        <CameraView ref={camRef} style={styles.camView} facing="back">
          <View style={styles.shelfTargetGuide}>
            <View style={styles.shelfLineTop} />
            <Text style={styles.shelfGuideHint}>Position shelf items within view</Text>
            <View style={styles.shelfLineBottom} />
          </View>
        </CameraView>
        <View style={styles.camBar}>
          <Pressable onPress={() => setMode('pick')} style={styles.cancelBtn}>
            <Icon name="close" size={24} color={colors.white} />
          </Pressable>
          <Pressable onPress={takePhoto} style={styles.shutterBtn}>
            <View style={styles.shutterInner} />
          </Pressable>
          <View style={{ width: 44 }} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Vision Shelf Counter</Text>
        <Text style={styles.subtitle}>
          Point at inventory racks, bins, or retail displays to auto-detect and enumerate stock.
        </Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.choiceCard} onPress={openCamera}>
          <View style={[styles.choiceIcon, { backgroundColor: colors.primarySoft }]}>
            <Icon name="camera" size={22} color={colors.primary} />
          </View>
          <Text style={styles.choiceTitle}>Take Shelf Photo</Text>
        </Pressable>

        <Pressable style={styles.choiceCard} onPress={pick}>
          <View style={[styles.choiceIcon, { backgroundColor: colors.infoSoft }]}>
            <Icon name="images" size={22} color={colors.info} />
          </View>
          <Text style={styles.choiceTitle}>Upload from Gallery</Text>
        </Pressable>
      </View>

      {photo && (
        <Card variant="elevated" style={styles.previewCard}>
          <View style={styles.previewTop}>
            <Text style={styles.previewLabel}>Captured Shelf Image</Text>
            <Pressable onPress={() => { setPhoto(null); setDetections(null); }}>
              <Icon name="close-circle-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>

          <Image source={{ uri: photo.uri }} style={styles.previewImage} />

          {!detections && (
            <Button
              title="Analyze & Count Items"
              icon="sparkles"
              onPress={analyze}
              loading={loading}
              size="lg"
            />
          )}
        </Card>
      )}

      {detections && (
        <Card variant="accent" style={styles.detectionsCard}>
          <View style={styles.detectionsHeader}>
            <View style={styles.detectedBadge}>
              <Icon name="checkmark-circle" size={14} color={colors.accent} style={{ marginRight: 4 }} />
              <Text style={styles.detectedBadgeText}>Vision Analysis Complete</Text>
            </View>
            <Text style={styles.detectionsCount}>
              {detections.length} Product{detections.length === 1 ? '' : 's'} Identified
            </Text>
          </View>

          {detections.length === 0 ? (
            <Text style={styles.emptyDetections}>No distinct items identified in the image.</Text>
          ) : (
            detections.map((d, i) => {
              const confPct = Math.round((d.confidence ?? 0.9) * 100);
              return (
                <View key={i} style={styles.itemRow}>
                  <View style={styles.itemIconBox}>
                    <Icon name="cube-outline" size={18} color={colors.primary} />
                  </View>

                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.itemName}>{d.product_name || d.label}</Text>
                    <View style={styles.confidenceRow}>
                      <View style={styles.confidenceBarBg}>
                        <View style={[styles.confidenceBarFill, { width: `${confPct}%` }]} />
                      </View>
                      <Text style={styles.confText}>{confPct}% confidence</Text>
                    </View>
                  </View>

                  <View style={styles.qtyPill}>
                    <Text style={styles.qtyText}>×{d.quantity ?? 1}</Text>
                  </View>
                </View>
              );
            })
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
  actionsRow: {
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
  },
  choiceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  choiceTitle: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.text,
  },
  previewCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  previewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  previewLabel: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: radius.sm,
    backgroundColor: colors.bgSubtle,
    marginBottom: spacing.md,
    resizeMode: 'cover',
  },
  detectionsCard: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentBorder,
  },
  detectionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  detectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  detectedBadgeText: {
    fontSize: font.xs,
    fontWeight: '700',
    color: colors.accent,
  },
  detectionsCount: {
    fontSize: font.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  emptyDetections: {
    fontSize: font.sm,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: radius.sm,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  itemName: {
    fontSize: font.sm,
    fontWeight: '700',
    color: colors.text,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  confidenceBarBg: {
    width: 60,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
    marginRight: 6,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  confText: {
    fontSize: font.xs - 1,
    color: colors.textMuted,
  },
  qtyPill: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  qtyText: {
    fontSize: font.sm,
    fontWeight: '800',
    color: colors.primaryDark,
  },
  camContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shelfTargetGuide: {
    width: '90%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shelfLineTop: {
    width: '100%',
    height: 2,
    backgroundColor: colors.accentLight,
  },
  shelfLineBottom: {
    width: '100%',
    height: 2,
    backgroundColor: colors.accentLight,
  },
  shelfGuideHint: {
    color: colors.white,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    fontSize: font.xs,
  },
  camBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  cancelBtn: {
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
