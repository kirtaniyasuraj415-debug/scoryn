export const REPORT_LANGUAGES=[
  'ENGLISH',
  'HINGLISH',
  'HINDI',
  'BENGALI',
  'MARATHI',
  'GUJARATI',
  'TAMIL',
  'TELUGU'
] as const;

export type ReportLanguage=typeof REPORT_LANGUAGES[number];

export function isReportLanguage(value:unknown):value is ReportLanguage{
  return REPORT_LANGUAGES.includes(value as ReportLanguage);
}

const languageNames:Record<ReportLanguage,string>={
  ENGLISH:'English',
  HINGLISH:'Hinglish written in Roman script',
  HINDI:'Hindi in Devanagari script',
  BENGALI:'Bengali in Bengali script',
  MARATHI:'Marathi in Devanagari script',
  GUJARATI:'Gujarati in Gujarati script',
  TAMIL:'Tamil in Tamil script',
  TELUGU:'Telugu in Telugu script'
};

type AuditIssue={
  key:string;
  title:string;
  category?:string;
  severity?:string;
  explanation:string;
  businessImpact?:string;
  technicalDetail?:string;
};

const fallbackCopy:Partial<Record<ReportLanguage,Record<string,Partial<AuditIssue>>>>={
  HINGLISH:{
    'missing-title':{
      title:'Page title missing hai',
      explanation:'Page ke initial HTML mein clear title nahi mila.',
      businessImpact:'Clear title search engines aur browser users ko page samajhne mein help karta hai.'
    },
    'missing-meta-description':{
      title:'Meta description missing ya bahut short hai',
      explanation:'Page ke initial HTML mein useful meta description detect nahi hui.',
      businessImpact:'Better description Google result mein page ko clear tarike se present karne mein help kar sakti hai.'
    },
    'missing-h1':{
      title:'Primary H1 heading detect nahi hua',
      explanation:'Page ke initial HTML mein clear H1 heading nahi mila.',
      businessImpact:'Clear H1 content structure ko visitors aur search engines dono ke liye better banata hai.'
    },
    'missing-canonical':{
      title:'Canonical URL detect nahi hua',
      explanation:'Page ke initial HTML mein canonical link nahi mila.',
      businessImpact:'Canonical search engines ko preferred page version samajhne mein help karta hai.'
    },
    'missing-lang':{
      title:'HTML language declare nahi ki gayi',
      explanation:'HTML element par page language declare nahi hai.',
      businessImpact:'Language metadata screen readers aur accessibility tools ko content sahi tarike se interpret karne mein help karta hai.'
    },
    'noindex':{
      title:'Page par noindex directive ho sakta hai',
      explanation:'Page search engines ko indexing se rokne ka signal de raha hai.',
      businessImpact:'Noindex ki wajah se page Google Search mein appear nahi karega.'
    }
  },
  HINDI:{
    'missing-title':{
      title:'पेज का टाइटल नहीं मिला',
      explanation:'पेज के शुरुआती HTML में स्पष्ट टाइटल नहीं मिला।',
      businessImpact:'स्पष्ट टाइटल ब्राउज़र और सर्च इंजन को पेज समझने में मदद करता है।'
    },
    'missing-meta-description':{
      title:'मेटा डिस्क्रिप्शन नहीं मिला या बहुत छोटा है',
      explanation:'पेज के शुरुआती HTML में उपयोगी मेटा डिस्क्रिप्शन नहीं मिला।',
      businessImpact:'अच्छा मेटा डिस्क्रिप्शन सर्च रिजल्ट में पेज को स्पष्ट तरीके से दिखाने में मदद कर सकता है।'
    },
    'missing-h1':{
      title:'मुख्य H1 हेडिंग नहीं मिली',
      explanation:'पेज के शुरुआती HTML में स्पष्ट H1 हेडिंग नहीं मिली।',
      businessImpact:'स्पष्ट H1 विज़िटर और सर्च इंजन दोनों के लिए कंटेंट स्ट्रक्चर बेहतर करता है।'
    },
    'missing-canonical':{
      title:'कैनोनिकल URL नहीं मिला',
      explanation:'पेज के शुरुआती HTML में canonical link नहीं मिला।',
      businessImpact:'Canonical URL सर्च इंजन को पसंदीदा पेज वर्जन समझने में मदद करता है।'
    },
    'missing-lang':{
      title:'HTML भाषा घोषित नहीं है',
      explanation:'HTML element पर पेज की भाषा घोषित नहीं की गई है।',
      businessImpact:'भाषा की जानकारी screen reader और accessibility tools को कंटेंट सही समझने में मदद करती है।'
    },
    'noindex':{
      title:'पेज पर noindex directive हो सकता है',
      explanation:'पेज सर्च इंजन को इसे index न करने का संकेत दे रहा है।',
      businessImpact:'Noindex होने पर यह पेज Google Search में दिखाई नहीं देगा।'
    }
  },
  BENGALI:{
    'missing-title':{
      title:'পেজের টাইটেল পাওয়া যায়নি',
      explanation:'পেজের প্রাথমিক HTML-এ স্পষ্ট টাইটেল পাওয়া যায়নি।',
      businessImpact:'স্পষ্ট টাইটেল ব্রাউজার ও সার্চ ইঞ্জিনকে পেজটি বুঝতে সাহায্য করে।'
    },
    'missing-meta-description':{
      title:'মেটা ডেসক্রিপশন নেই বা খুব ছোট',
      explanation:'পেজের প্রাথমিক HTML-এ কার্যকর মেটা ডেসক্রিপশন পাওয়া যায়নি।',
      businessImpact:'ভালো মেটা ডেসক্রিপশন সার্চ রেজাল্টে পেজটি পরিষ্কারভাবে উপস্থাপন করতে সাহায্য করতে পারে।'
    },
    'missing-h1':{
      title:'প্রধান H1 হেডিং পাওয়া যায়নি',
      explanation:'পেজের প্রাথমিক HTML-এ স্পষ্ট H1 হেডিং পাওয়া যায়নি।',
      businessImpact:'স্পষ্ট H1 ভিজিটর ও সার্চ ইঞ্জিনের জন্য কনটেন্ট স্ট্রাকচার ভালো করে।'
    },
    'missing-canonical':{
      title:'Canonical URL পাওয়া যায়নি',
      explanation:'পেজের প্রাথমিক HTML-এ canonical link পাওয়া যায়নি।',
      businessImpact:'Canonical URL সার্চ ইঞ্জিনকে পেজের পছন্দের সংস্করণ বুঝতে সাহায্য করে।'
    },
    'missing-lang':{
      title:'HTML ভাষা ঘোষণা করা হয়নি',
      explanation:'HTML element-এ পেজের ভাষা উল্লেখ করা নেই।',
      businessImpact:'ভাষার তথ্য screen reader ও accessibility tool-কে কনটেন্ট সঠিকভাবে বুঝতে সাহায্য করে।'
    },
    'noindex':{
      title:'পেজে noindex directive থাকতে পারে',
      explanation:'পেজটি সার্চ ইঞ্জিনকে index না করার নির্দেশ দিচ্ছে।',
      businessImpact:'Noindex থাকলে পেজটি Google Search-এ দেখা যাবে না।'
    }
  }
};

function applyFallback(issue:AuditIssue,language:ReportLanguage):AuditIssue{
  const local=fallbackCopy[language]?.[issue.key];
  if(!local) return issue;
  return {...issue,...local};
}

function parseJsonArray(text:string){
  const clean=text.trim().replace(/^\x60{3}(?:json)?/i,'').replace(/\x60{3}$/,'').trim();
  const start=clean.indexOf('[');
  const end=clean.lastIndexOf(']');
  if(start<0||end<start) return null;
  try{
    const value=JSON.parse(clean.slice(start,end+1));
    return Array.isArray(value)?value:null;
  }catch{
    return null;
  }
}

async function callNvidia(model:string,prompt:string,key:string){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),15000);
  try{
    const res=await fetch('https://integrate.api.nvidia.com/v1/chat/completions',{
      method:'POST',
      signal:controller.signal,
      headers:{
        accept:'application/json',
        'content-type':'application/json',
        authorization:`Bearer ${key}`
      },
      body:JSON.stringify({
        model,
        temperature:.2,
        top_p:.8,
        max_tokens:1800,
        stream:false,
        messages:[
          {
            role:'system',
            content:'You are Scoryn, a web audit consultant. Rewrite technical website audit findings for a non-technical business owner. Never invent percentages, revenue loss, rankings, traffic numbers, or facts not present in the input.'
          },
          {role:'user',content:prompt}
        ]
      })
    });
    if(!res.ok) throw new Error(`NVIDIA ${model} failed: ${res.status}`);
    const data:any=await res.json();
    const text=data?.choices?.[0]?.message?.content;
    if(typeof text!=='string'||!text.trim()) throw new Error('NVIDIA returned empty output.');
    return text.trim();
  }finally{
    clearTimeout(timeout);
  }
}

export async function explainAuditIssues(
  issues:AuditIssue[],
  language:ReportLanguage
):Promise<AuditIssue[]>{
  if(!issues.length) return issues;

  const base=issues.map(i=>applyFallback(i,language));
  const key=process.env.NVIDIA_API_KEY;
  if(!key) return base;

  const compact=base.slice(0,12).map((i,index)=>({
    index,
    key:i.key,
    title:i.title,
    explanation:i.explanation,
    businessImpact:i.businessImpact||'',
    severity:i.severity||'MEDIUM'
  }));

  const prompt=[
    `Output language: ${languageNames[language]}.`,
    'Return ONLY a JSON array. Keep exactly the same number of items and preserve each index.',
    'For every item return: index, title, explanation, businessImpact.',
    'Title should be short. Explanation should be simple and maximum 2 sentences. Business impact should be realistic and maximum 1 sentence.',
    'Do not invent statistics or claim Google ranking changes as guaranteed.',
    'Technical terms such as H1, SEO, LCP, CLS, canonical, meta description may stay in English when clearer.',
    'Input:',
    JSON.stringify(compact)
  ].join('\n');

  const models=['z-ai/glm-5.3-flash','openai/gpt-oss-20b'];

  for(const model of models){
    try{
      const raw=await callNvidia(model,prompt,key);
      const parsed=parseJsonArray(raw);
      if(!parsed||parsed.length!==compact.length) continue;

      return base.map((issue,index)=>{
        const item=parsed.find((x:any)=>Number(x?.index)===index)??parsed[index];
        if(!item) return issue;
        return {
          ...issue,
          title:typeof item.title==='string'&&item.title.trim()?item.title.trim():issue.title,
          explanation:typeof item.explanation==='string'&&item.explanation.trim()?item.explanation.trim():issue.explanation,
          businessImpact:typeof item.businessImpact==='string'&&item.businessImpact.trim()?item.businessImpact.trim():issue.businessImpact
        };
      });
    }catch(e){
      console.error('[Scoryn audit explanation]',e);
    }
  }

  return base;
}
