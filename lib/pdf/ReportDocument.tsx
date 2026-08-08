/* eslint-disable jsx-a11y/alt-text -- these are @react-pdf/renderer <Image>
   elements (PDF nodes), not HTML <img> tags, so the alt prop doesn't apply. */
// PDF generation choice: @react-pdf/renderer, rendered server-side in the
// /api/reports/[profileId] route handler (Node runtime) into a real PDF
// buffer. Chosen over an HTML-to-print approach because it produces a
// consistent, print-quality, multi-page document without a headless browser
// dependency, which keeps this slice self-contained.
import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import { ZadocProfile, ProductRecommendation } from '@/types/zadoc';

const COLORS = {
  foreground: '#111111',
  muted: '#6B7280',
  success: '#2F9E44',
  avoid: '#E03131',
  border: '#E5E5E3',
  background: '#FAFAF9',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    color: COLORS.foreground,
    fontSize: 11,
    fontFamily: 'Helvetica',
    padding: 40,
  },
  coverPage: {
    backgroundColor: COLORS.background,
    color: COLORS.foreground,
    fontFamily: 'Helvetica',
    padding: 48,
    justifyContent: 'space-between',
  },
  logo: { width: 56, height: 56, marginBottom: 24 },
  coverWordmark: { fontSize: 22, fontFamily: 'Helvetica-Bold', letterSpacing: 2 },
  coverTitle: { fontSize: 30, fontFamily: 'Helvetica-Bold', marginTop: 140, maxWidth: 320 },
  coverMeta: { fontSize: 11, color: COLORS.muted, marginTop: 12 },
  coverFooter: { fontSize: 9, color: COLORS.muted },
  sectionTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', marginBottom: 14 },
  row: { flexDirection: 'row', marginBottom: 20 },
  profileImage: { width: 110, height: 110, borderRadius: 8, marginRight: 20 },
  profileInfo: { flex: 1 },
  label: { fontSize: 9, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  value: { fontSize: 12, marginBottom: 10 },
  scoreBadge: { fontSize: 24, fontFamily: 'Helvetica-Bold' },
  insightItem: {
    flexDirection: 'row', marginBottom: 10, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  bullet: { width: 14, fontSize: 11 },
  insightText: { flex: 1, fontSize: 11, lineHeight: 1.5 },
  productCard: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    padding: 14, marginBottom: 12, flexDirection: 'row',
  },
  productImage: { width: 60, height: 60, borderRadius: 6, marginRight: 14 },
  productBody: { flex: 1 },
  productName: { fontSize: 12, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  productRank: { fontSize: 9, color: COLORS.muted, marginBottom: 6 },
  productReason: { fontSize: 10, lineHeight: 1.4, marginBottom: 6 },
  productMeta: { fontSize: 9, color: COLORS.muted, lineHeight: 1.4 },
  footerBar: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: COLORS.muted, textAlign: 'center' },
  disclaimerBox: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 16,
    backgroundColor: COLORS.background, marginTop: 20,
  },
});

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export interface ReportProps {
  profile: ZadocProfile;
  insights: string[];
  best: ProductRecommendation[];
  avoid: ProductRecommendation[];
  logoDataUri: string;
}

export function ReportDocument({ profile, insights, best, avoid, logoDataUri }: ReportProps) {
  return (
    <Document
      title={`Zadoc Skin Profile Report - ${profile.name}`}
      author="Zadoc"
    >
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        <View>
          <Image src={logoDataUri} style={styles.logo} />
          <Text style={styles.coverWordmark}>ZADOC</Text>
          <Text style={styles.coverTitle}>Your Skin Profile Report</Text>
          <Text style={styles.coverMeta}>{profile.name}</Text>
          <Text style={styles.coverMeta}>Generated {fmtDate(new Date())}</Text>
        </View>
        <Text style={styles.coverFooter}>zadoc.app — informational skincare guidance</Text>
      </Page>

      {/* Profile + Insights */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <View style={styles.row}>
          {profile.image_url ? (
            <Image src={profile.image_url} style={styles.profileImage} />
          ) : null}
          <View style={styles.profileInfo}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.label}>Age</Text>
                <Text style={styles.value}>{profile.age ?? '—'}</Text>
                <Text style={styles.label}>Gender</Text>
                <Text style={styles.value}>{profile.gender ?? '—'}</Text>
                <Text style={styles.label}>Routine level</Text>
                <Text style={styles.value}>{profile.routine_level ?? '—'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.label}>Profile score</Text>
                <Text style={styles.scoreBadge}>{profile.skin_score ?? '—'}</Text>
                <Text style={styles.label}>Skin type</Text>
                <Text style={styles.value}>{profile.skin_type ?? '—'}</Text>
              </View>
            </View>
          </View>
        </View>
        <Text style={styles.label}>Reported condition</Text>
        <Text style={[styles.value, { lineHeight: 1.5 }]}>{profile.reported_condition ?? '—'}</Text>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Skin insights</Text>
        {insights.map((insight, i) => (
          <View key={i} style={styles.insightItem}>
            <Text style={styles.bullet}>{i + 1}.</Text>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}

        <Text style={styles.footerBar} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Best oils */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Best oils for you</Text>
        {best.map((r) => (
          <View key={r.id} style={styles.productCard}>
            <Image src={r.product.images[0]?.image_url} style={styles.productImage} />
            <View style={styles.productBody}>
              <Text style={styles.productRank}>#{r.rank} RECOMMENDED</Text>
              <Text style={styles.productName}>{r.product.name}</Text>
              <Text style={styles.productReason}>{r.reason}</Text>
              <Text style={styles.productMeta}>Benefits: {r.product.benefits.join(', ')}</Text>
              <Text style={styles.productMeta}>Usage: {r.product.usage}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.footerBar} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>

      {/* Avoid oils + disclaimer */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Oils to avoid</Text>
        {avoid.map((r) => (
          <View key={r.id} style={styles.productCard}>
            <Image src={r.product.images[0]?.image_url} style={styles.productImage} />
            <View style={styles.productBody}>
              <Text style={[styles.productRank, { color: COLORS.avoid }]}>#{r.rank} AVOID</Text>
              <Text style={styles.productName}>{r.product.name}</Text>
              <Text style={styles.productReason}>{r.reason}</Text>
              <Text style={styles.productMeta}>Benefits: {r.product.benefits.join(', ')}</Text>
              <Text style={styles.productMeta}>Warnings: {r.product.warnings}</Text>
            </View>
          </View>
        ))}

        <View style={styles.disclaimerBox}>
          <Text style={{ fontSize: 9, lineHeight: 1.6, color: COLORS.muted }}>
            Zadoc provides informational skincare recommendations based on the information and
            image provided. It is not a medical diagnostic service. If you have persistent,
            severe, or concerning skin symptoms, consult a qualified healthcare professional.
          </Text>
        </View>
        <Text style={styles.footerBar} render={({ pageNumber }) => `${pageNumber}`} fixed />
      </Page>
    </Document>
  );
}
