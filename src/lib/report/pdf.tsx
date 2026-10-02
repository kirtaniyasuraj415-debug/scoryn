import React from 'react';
import { Document,Page,Text,View,StyleSheet } from '@react-pdf/renderer';

const s=StyleSheet.create({
  page:{padding:38,fontFamily:'Helvetica',color:'#111',fontSize:10},
  top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:28},
  brand:{fontSize:16,fontWeight:700},
  title:{fontSize:24,fontWeight:700,marginBottom:6},
  muted:{color:'#666'},
  scoreRow:{flexDirection:'row',gap:8,marginTop:18,marginBottom:25},
  score:{flexGrow:1,border:'1px solid #ddd',borderRadius:8,padding:10},
  scoreNum:{fontSize:18,fontWeight:700},
  issue:{border:'1px solid #e4e4e4',borderRadius:8,padding:12,marginBottom:8},
  issueTitle:{fontSize:12,fontWeight:700,marginBottom:5},
  impact:{marginTop:6,color:'#555'},
  cta:{marginTop:24,padding:16,borderRadius:8,backgroundColor:'#111',color:'#fff'}
});

const languageLabel:Record<string,string>={
  ENGLISH:'English',
  HINGLISH:'Hinglish',
  HINDI:'Hindi',
  BENGALI:'Bengali',
  MARATHI:'Marathi',
  GUJARATI:'Gujarati',
  TAMIL:'Tamil',
  TELUGU:'Telugu'
};

function score(value:any){
  return typeof value==='number'?String(value):'—';
}

export function ReportPDF({data}:{data:any}){
  const a=data.audit;
  const b=data.branding;
  const partial=Boolean(a.partial);

  return <Document>
    <Page size="A4" style={s.page}>
      <View style={s.top}>
        <Text style={s.brand}>{b.agencyName||'Scoryn'}</Text>
        <Text style={s.muted}>Website Audit Report</Text>
      </View>

      <Text style={s.title}>{a.url}</Text>
      <Text style={s.muted}>
        {partial?'Partial technical audit — Google Lighthouse did not complete this URL.':'Client-ready technical and business impact summary'}
      </Text>
      <Text style={[s.muted,{marginTop:4}]}>Report language: {languageLabel[a.reportLanguage]||'English'}</Text>

      <View style={s.scoreRow}>
        {[
          ['Overall',a.overallScore],
          ['Performance',a.performanceScore],
          [partial?'Technical SEO':'SEO',a.seoScore],
          ['Accessibility',a.accessibilityScore],
          ['Best Practices',a.bestPracticesScore]
        ].map(([label,value])=><View style={s.score} key={label as string}>
          <Text style={s.scoreNum}>{score(value)}</Text>
          <Text style={s.muted}>{label as string}</Text>
        </View>)}
      </View>

      <Text style={{fontSize:16,fontWeight:700,marginBottom:10}}>Priority issues</Text>

      {data.issues.slice(0,12).map((issue:any,index:number)=><View key={index} style={s.issue}>
        <Text style={s.issueTitle}>{issue.title}</Text>
        <Text>{issue.explanation}</Text>
        <Text style={s.impact}>Business impact: {issue.businessImpact}</Text>
      </View>)}

      <View style={s.cta}>
        <Text style={{fontSize:14,fontWeight:700}}>Want these issues fixed?</Text>
        <Text style={{marginTop:5,color:'#ddd'}}>
          {b.signature||`Contact ${b.agencyName||'our agency'} for implementation and optimization.`}
        </Text>
        <Text style={{marginTop:7,color:'#ddd'}}>
          {[b.whatsapp,b.email,b.phone].filter(Boolean).join(' • ')}
        </Text>
      </View>
    </Page>
  </Document>;
}
