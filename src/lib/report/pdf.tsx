import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const s = StyleSheet.create({
  page: { padding: 38, fontFamily: 'Helvetica', color: '#111', fontSize: 9 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  brand: { fontSize: 16, fontWeight: 700 },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  section: { fontSize: 14, fontWeight: 700, marginTop: 18, marginBottom: 8 },
  subheading: { fontSize: 10, fontWeight: 700, marginTop: 8, marginBottom: 3 },
  muted: { color: '#666' },
  scoreRow: { flexDirection: 'row', gap: 6, marginTop: 16, marginBottom: 18 },
  score: { flexGrow: 1, border: '1px solid #ddd', borderRadius: 7, padding: 8 },
  scoreNum: { fontSize: 16, fontWeight: 700 },
  issue: { border: '1px solid #e4e4e4', borderRadius: 7, padding: 10, marginBottom: 7 },
  issueTitle: { fontSize: 11, fontWeight: 700, marginBottom: 4 },
  line: { marginTop: 3, lineHeight: 1.35 },
  label: { color: '#666', fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  cta: { marginTop: 20, padding: 14, borderRadius: 7, backgroundColor: '#111', color: '#fff' },
  code: { fontFamily: 'Courier', fontSize: 8, color: '#333' }
});

const languageLabel: Record<string, string> = { ENGLISH: 'English', HINGLISH: 'Hinglish', HINDI: 'Hindi', BENGALI: 'Bengali', MARATHI: 'Marathi', GUJARATI: 'Gujarati', TAMIL: 'Tamil', TELUGU: 'Telugu' };

function score(value: unknown) { return typeof value === 'number' ? String(value) : '—'; }
function value(value: unknown) { return value === null || value === undefined || value === '' ? 'Not reported' : String(value); }

export function ReportPDF({ data, fontFamily = 'Helvetica', mode = 'business' }: { data: any; fontFamily?: string; mode?: 'business' | 'developer' }) {
  const audit = data.audit || {};
  const branding = data.branding || {};
  const business = audit.businessReport || data.businessReport;
  const developer = audit.developerReport || data.developerReport;
  const partial = Boolean(audit.partial);
  const scores = [['Overall', audit.overallScore], ['Performance', audit.performanceScore], [partial ? 'Technical SEO' : 'SEO', audit.seoScore], ['Accessibility', audit.accessibilityScore], ['Best Practices', audit.bestPracticesScore]];

  return <Document>
    <Page size="A4" style={[s.page, { fontFamily }]} wrap>
      <View style={s.top}><Text style={s.brand}>{branding.agencyName || 'Scoryn'}</Text><Text style={s.muted}>{mode === 'business' ? 'Business Owner Report' : 'Developer Report'}</Text></View>
      <Text style={s.title}>{business?.title || (mode === 'business' ? 'SCORYN WEBSITE HEALTH REPORT' : 'SCORYN DEVELOPER AUDIT REPORT')}</Text>
      <Text style={s.muted}>{audit.url}</Text>
      <Text style={[s.muted, { marginTop: 4 }]}>Report language: {languageLabel[audit.reportLanguage] || 'English'} · {partial ? 'Partial checks — unavailable engines are marked' : 'Generated from one normalized audit dataset'}</Text>

      <View style={s.scoreRow}>{scores.map(([label, valueToShow]) => <View style={s.score} key={String(label)}><Text style={s.scoreNum}>{score(valueToShow)}</Text><Text style={s.muted}>{String(label)}</Text></View>)}</View>

      {mode === 'business' ? <>
        <Text style={s.section}>Overall website health</Text>
        <Text style={s.line}>{business?.summary || 'Scoryn completed the available website checks.'}</Text>
        <Text style={s.section}>What’s working well</Text>
        {(business?.workingWell || []).slice(0, 8).map((item: string, index: number) => <Text key={index} style={s.line}>• {item}</Text>)}
        <Text style={s.section}>What needs attention</Text>
        {(business?.needsAttention || []).slice(0, 8).map((item: string, index: number) => <Text key={index} style={s.line}>• {item}</Text>)}
        <Text style={s.section}>What your customers may experience</Text>
        {(business?.customerExperience || []).slice(0, 6).map((item: string, index: number) => <Text key={index} style={s.line}>• {item}</Text>)}
        <Text style={s.section}>What may affect Google visibility</Text>
        <Text style={s.line}>{business?.googleVisibility || 'Technical SEO checks do not confirm actual Google ranking.'}</Text>
        <Text style={s.line}>{business?.rankingDisclaimer || 'Actual Google ranking cannot be confirmed without Search Console or ranking data.'}</Text>
        <Text style={s.section}>Top priorities</Text>
        {(business?.findings || []).slice(0, 12).map((issue: any, index: number) => <View key={issue.findingId || index} style={s.issue} wrap={false}>
          <Text style={s.issueTitle}>{index + 1}. {issue.problem}</Text>
          <Text style={s.label}>Where</Text><Text style={s.line}>{value(issue.where)}</Text>
          <Text style={s.label}>What customers may experience</Text><Text style={s.line}>{value(issue.customerExperience)}</Text>
          <Text style={s.label}>Business impact</Text><Text style={s.line}>{value(issue.businessImpact)}</Text>
          <Text style={s.label}>Recommended action</Text><Text style={s.line}>{value(issue.recommendedAction)}</Text>
          {issue.technicalEvidence && <><Text style={s.label}>Technical details</Text><Text style={s.code}>{issue.technicalEvidence}</Text></>}
        </View>)}
      </> : <>
        <Text style={s.section}>Audit coverage</Text>
        <Text style={s.line}>{developer?.summary || `Detailed evidence from ${developer?.pages?.length || 0} page(s).`}</Text>
        <Text style={s.section}>Engine status</Text>
        <Text style={s.line}>{JSON.stringify(developer?.engineStatus || {})}</Text>
        <Text style={s.section}>Measured metrics</Text>
        {Object.entries(developer?.metrics || {}).map(([key, metric]: [string, any]) => <Text key={key} style={s.line}>{metric.label || key}: {value(metric.displayValue)}{metric.numericValue !== null ? ` (${metric.numericValue})` : ''}</Text>)}
        <Text style={s.section}>Actionable findings</Text>
        {(developer?.findings || []).slice(0, 24).map((issue: any, index: number) => <View key={issue.id || index} style={s.issue}>
          <Text style={s.issueTitle}>{index + 1}. {issue.title}</Text>
          <Text style={s.label}>Category · Severity · Source</Text><Text style={s.line}>{value(issue.category)} · {value(issue.severity)} · {value(issue.source)}</Text>
          <Text style={s.label}>Affected URL</Text><Text style={s.code}>{value(issue.affectedUrl)}</Text>
          <Text style={s.label}>Measured · Recommended</Text><Text style={s.line}>{value(issue.measuredValue)} · {value(issue.recommendedValue)}</Text>
          <Text style={s.label}>Element · Selector · Resource</Text><Text style={s.code}>{value(issue.affectedElement)} · {value(issue.selector)} · {value(issue.resourceUrl)}</Text>
          <Text style={s.label}>Evidence</Text><Text style={s.line}>{value(issue.evidence || issue.description)}</Text>
          <Text style={s.label}>Fix</Text><Text style={s.line}>{value(issue.developerFix)}</Text>
        </View>)}
        <Text style={s.section}>Search ranking boundary</Text>
        <Text style={s.line}>{developer?.ranking?.note || 'Technical SEO checks do not confirm actual Google search ranking.'}</Text>
      </>}

      <View style={s.cta}><Text style={{ fontSize: 12, fontWeight: 700 }}>Next step</Text><Text style={{ marginTop: 4, color: '#ddd' }}>{branding.signature || `Contact ${branding.agencyName || 'your developer'} for implementation and optimization.`}</Text></View>
    </Page>
  </Document>;
}
