import type {
  AuditDataset,
  AuditFinding,
  BusinessFinding,
  BusinessReport,
  DeveloperFinding,
  DeveloperReport,
  DualAuditReport,
  ReportLanguage
} from '@/lib/audit/types';

const languageNames: Record<ReportLanguage, string> = {
  ENGLISH: 'English',
  HINGLISH: 'natural Hinglish written in Roman Hindi',
  HINDI: 'Hindi in Devanagari script',
  BENGALI: 'Bengali in Bengali script',
  MARATHI: 'Marathi in Devanagari script',
  GUJARATI: 'Gujarati in Gujarati script',
  TAMIL: 'Tamil',
  TELUGU: 'Telugu'
};

const severityWeight: Record<AuditFinding['severity'], number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

function pathLabel(url: string | null) {
  if (!url) return 'The affected page';
  try {
    const parsed = new URL(url);
    return parsed.pathname === '/' ? 'Homepage' : parsed.pathname.replace(/\/$/, '').replace(/[-_]/g, ' ').replace(/^\//, '') || 'Homepage';
  } catch {
    return 'The affected page';
  }
}

function localized(language: ReportLanguage, english: string, hinglish: string, hindi: string, bengali: string) {
  if (language === 'HINGLISH') return hinglish;
  if (language === 'HINDI') return hindi;
  if (language === 'BENGALI') return bengali;
  return english;
}

function businessCopy(finding: AuditFinding, language: ReportLanguage) {
  const key = finding.key.toLowerCase();
  if (key.includes('largest-contentful-paint') || key.includes('first-contentful-paint') || key.includes('speed-index')) return {
    problem: localized(language, 'Important page content may appear late', 'Website ka main content visitor ko der se dikh sakta hai', 'वेबसाइट का मुख्य कंटेंट विज़िटर को देर से दिखाई दे सकता है', 'ওয়েবসাইটের মূল content visitor-এর কাছে দেরিতে দেখা যেতে পারে'),
    experience: localized(language, 'The first view can feel slow, especially on a phone or a slower connection.', 'Phone ya slow internet par website ka pehla view slow lag sakta hai.', 'मोबाइल या धीमे इंटरनेट पर वेबसाइट का पहला दृश्य धीमा लग सकता है।', 'মোবাইল বা ধীর internet-এ website-এর প্রথম view ধীর মনে হতে পারে।')
  };
  if (key.includes('blocking') || key.includes('interactive') || key.includes('javascript')) return {
    problem: localized(language, 'The page may take longer to respond', 'Page ko respond karne mein zyada time lag sakta hai', 'पेज को जवाब देने में अधिक समय लग सकता है', 'Page respond করতে বেশি সময় লাগতে পারে'),
    experience: localized(language, 'A visitor may see a page that looks ready but does not respond immediately to taps or clicks.', 'Visitor ko page ready dikh sakta hai, lekin tap ya click ka response late aa sakta hai.', 'विज़िटर को पेज तैयार दिखाई दे सकता है, लेकिन टैप या क्लिक का जवाब देर से मिल सकता है।', 'Visitor-এর কাছে page ready মনে হলেও tap বা click-এর response দেরিতে আসতে পারে।')
  };
  if (key.includes('meta-description')) return {
    problem: localized(language, 'Google may not have a clear summary for this page', 'Google ko is page ka clear summary nahi mil raha ho sakta hai', 'Google को इस पेज का स्पष्ट सारांश नहीं मिल रहा हो सकता है', 'Google এই page-এর পরিষ্কার summary নাও পেতে পারে'),
    experience: localized(language, 'The search result may show a less useful description of what the business offers.', 'Search result mein business ki service ka description kam clear dikh sakta hai.', 'सर्च रिज़ल्ट में बिज़नेस की सेवा का विवरण कम स्पष्ट दिख सकता है।', 'Search result-এ business-এর service-এর description কম পরিষ্কার দেখা যেতে পারে।')
  };
  if (key.includes('missing-title') || key === 'document-title') return {
    problem: localized(language, 'This page is not clearly named', 'Is page ka naam clearly set nahi hai', 'इस पेज का नाम स्पष्ट रूप से सेट नहीं है', 'এই page-এর নাম পরিষ্কারভাবে সেট করা নেই'),
    experience: localized(language, 'Browsers, search results and assistive tools may have less context about the page.', 'Browser, search result aur accessibility tools ko page samajhne ke liye kam context mil sakta hai.', 'ब्राउज़र, सर्च रिज़ल्ट और accessibility tools को पेज समझने के लिए कम जानकारी मिल सकती है।', 'Browser, search result ও accessibility tools page সম্পর্কে কম context পেতে পারে।')
  };
  if (key.includes('noindex')) return {
    problem: localized(language, 'This page is asking search engines not to show it', 'Yeh page search engines ko ise dikhane se rok raha hai', 'यह पेज सर्च इंजन को इसे दिखाने से रोक रहा है', 'এই page search engine-কে এটি দেখাতে নিষেধ করছে'),
    experience: localized(language, 'The page may not appear in Google results even when its content is useful.', 'Content useful hone ke baad bhi page Google results mein nahi dikh sakta.', 'कंटेंट उपयोगी होने के बाद भी पेज Google रिज़ल्ट में नहीं दिख सकता है।', 'Content useful হলেও page Google result-এ নাও দেখা যেতে পারে।')
  };
  if (key.includes('missing-h1') || key.includes('canonical')) return {
    problem: localized(language, 'Search engines may get a less clear picture of this page', 'Search engines ko is page ka structure ya preferred URL kam clear mil raha ho sakta hai', 'सर्च इंजन को इस पेज का स्ट्रक्चर या पसंदीदा URL कम स्पष्ट मिल रहा हो सकता है', 'Search engine এই page-এর structure বা preferred URL কম পরিষ্কারভাবে বুঝতে পারে'),
    experience: localized(language, 'The page can be harder to understand and organize for search and accessibility tools.', 'Search aur accessibility tools ke liye page ko samajhna aur organize karna mushkil ho sakta hai.', 'सर्च और accessibility tools के लिए पेज को समझना और व्यवस्थित करना कठिन हो सकता है।', 'Search ও accessibility tools-এর জন্য page বোঝা ও organize করা কঠিন হতে পারে।')
  };
  if (key.includes('alt') || key.includes('lang') || key.includes('axe') || finding.category === 'ACCESSIBILITY') return {
    problem: localized(language, 'Some visitors may not be able to use this page comfortably', 'Kuch visitors ke liye page use karna mushkil ho sakta hai', 'कुछ विज़िटर के लिए पेज का उपयोग करना कठिन हो सकता है', 'কিছু visitor-এর জন্য page ব্যবহার করা কঠিন হতে পারে'),
    experience: localized(language, 'Screen readers or other assistive tools may not be able to explain every part of the page clearly.', 'Screen reader ya accessibility tool page ke har part ko clearly explain nahi kar sakta.', 'स्क्रीन रीडर या accessibility tool पेज के हर हिस्से को स्पष्ट रूप से नहीं बता सकता है।', 'Screen reader বা accessibility tool page-এর সব অংশ পরিষ্কারভাবে বোঝাতে নাও পারে।')
  };
  if (finding.category === 'SECURITY') return {
    problem: localized(language, 'The website configuration can be strengthened', 'Website configuration ko aur secure banaya ja sakta hai', 'वेबसाइट कॉन्फ़िगरेशन को और सुरक्षित बनाया जा सकता है', 'Website configuration আরও নিরাপদ করা যায়'),
    experience: localized(language, 'A browser has fewer protective instructions than recommended for this page.', 'Browser ko is page ke liye recommended protective instructions kam mil rahi hain.', 'ब्राउज़र को इस पेज के लिए सुझाए गए protective instructions कम मिल रहे हैं।', 'Browser এই page-এর জন্য recommended protective instruction কম পাচ্ছে।')
  };
  return {
    problem: localized(language, 'A website quality check needs attention', 'Website ka ek important quality check improve karna hai', 'वेबसाइट की एक महत्वपूर्ण quality check में सुधार की जरूरत है', 'Website-এর একটি গুরুত্বপূর্ণ quality check-এ উন্নতি দরকার'),
    experience: localized(language, 'Some visitors may experience extra friction on the affected page.', 'Affected page par kuch visitors ko extra friction feel ho sakta hai.', 'प्रभावित पेज पर कुछ विज़िटर को अतिरिक्त परेशानी हो सकती है।', 'Affected page-এ কিছু visitor extra friction অনুভব করতে পারে।')
  };
}

function evidence(finding: AuditFinding) {
  const parts: string[] = [];
  if (finding.metric && finding.measuredValue !== null) parts.push(`${finding.metric}: ${String(finding.measuredValue)}`);
  else if (finding.measuredValue !== null) parts.push(`Measured value: ${String(finding.measuredValue)}`);
  if (finding.recommendedValue !== null) parts.push(`Recommended: ${String(finding.recommendedValue)}`);
  if (finding.affectedElement) parts.push(`Element: ${finding.affectedElement}`);
  if (finding.selector) parts.push(`Selector: ${finding.selector}`);
  if (finding.resourceUrl) parts.push(`Resource: ${finding.resourceUrl}`);
  const raw = Object.entries(finding.rawEvidence).filter(([, value]) => value !== null && value !== undefined && value !== '').slice(0, 4);
  if (!parts.length && raw.length) parts.push(raw.map(([key, value]) => `${key}: ${typeof value === 'object' ? JSON.stringify(value) : String(value)}`).join(' · '));
  return parts.length ? parts.join(' · ').slice(0, 1200) : null;
}

function fallbackBusiness(dataset: AuditDataset, language: ReportLanguage): BusinessReport {
  const ordered = [...dataset.findings].sort((a, b) => severityWeight[a.severity] - severityWeight[b.severity]);
  const findings: BusinessFinding[] = ordered.map((finding) => {
    const copy = businessCopy(finding, language);
    const where = pathLabel(finding.affectedUrl);
    return {
      findingId: finding.id,
      problem: copy.problem,
      where,
      customerExperience: copy.experience,
      businessImpact: finding.businessImpact || localized(language, 'This can add friction for potential customers.', 'Isse potential customers ke experience mein friction aa sakta hai.', 'इससे संभावित ग्राहकों के अनुभव में परेशानी आ सकती है।', 'এতে potential customer-এর experience-এ friction আসতে পারে।'),
      importance: finding.severity,
      recommendedAction: finding.developerFix || localized(language, 'Ask your developer to review the evidence and make the smallest safe fix.', 'Developer ko evidence review karke safe fix karne ko boliye.', 'डेवलपर से evidence देखकर सुरक्षित सुधार करने को कहें।', 'Developer-কে evidence দেখে safe fix করতে বলুন।'),
      technicalEvidence: evidence(finding)
    };
  });
  const attention = findings.slice(0, 4).map((finding) => `${finding.problem} — ${finding.where}`);
  const good: string[] = [];
  if ((dataset.scores.performance ?? 0) >= 90) good.push(localized(language, 'The main speed checks are in a healthy range.', 'Main speed checks healthy range mein hain.', 'मुख्य speed checks अच्छी range में हैं।', 'মূল speed check ভালো range-এ আছে।'));
  if ((dataset.scores.seo ?? 0) >= 90 && !dataset.findings.some((finding) => finding.category === 'SEO')) good.push(localized(language, 'The technical SEO checks that ran did not find a priority issue.', 'Jo technical SEO checks chale, unmein priority issue nahi mila.', 'जो technical SEO checks चले, उनमें priority issue नहीं मिला।', 'যে technical SEO check চলেছে, তাতে priority issue পাওয়া যায়নি।'));
  if (dataset.infrastructure.https) good.push(localized(language, 'The website is available over HTTPS.', 'Website HTTPS par available hai.', 'वेबसाइट HTTPS पर उपलब्ध है।', 'Website HTTPS-এ available।'));
  if (dataset.pages.length > 1) good.push(`${dataset.pages.length} public pages were discovered and checked for page-level signals.`);
  if (!good.length) good.push(localized(language, 'The audit completed with evidence from the public website.', 'Audit public website ke actual evidence ke saath complete hua.', 'ऑडिट public website के actual evidence के साथ पूरा हुआ।', 'Audit public website-এর actual evidence দিয়ে complete হয়েছে।'));
  const seoIssues = dataset.findings.filter((finding) => finding.category === 'SEO').length;
  const googleVisibility = seoIssues
    ? localized(language, `${seoIssues} technical SEO check(s) need attention. This may make it harder for search engines to understand some pages.`, `${seoIssues} technical SEO check(s) mein attention chahiye. Isse search engines ko kuch pages samajhne mein problem ho sakti hai.`, `${seoIssues} technical SEO check में सुधार की जरूरत है। इससे सर्च इंजन को कुछ पेज समझने में समस्या हो सकती है।`, `${seoIssues}টি technical SEO check-এ attention দরকার। এতে search engine কিছু page বুঝতে সমস্যায় পড়তে পারে।`)
    : localized(language, 'Technical SEO checks passed for the signals that were available. This audit does not confirm actual Google ranking.', 'Available signals ke hisaab se technical SEO checks pass hue. Yeh audit actual Google ranking confirm nahi karta.', 'उपलब्ध signals के हिसाब से technical SEO checks पास हुए। यह ऑडिट actual Google ranking confirm नहीं करता।', 'Available signal অনুযায়ী technical SEO check pass করেছে। এই audit actual Google ranking confirm করে না।');
  const summary = dataset.partial
    ? localized(language, 'The website audit completed, but one or more external performance checks were unavailable. The report only shows evidence Scoryn could verify.', 'Website audit complete hua, lekin kuch external performance checks available nahi the. Report mein sirf wahi evidence hai jo Scoryn verify kar saka.', 'वेबसाइट ऑडिट पूरा हुआ, लेकिन कुछ external performance checks उपलब्ध नहीं थे। रिपोर्ट में केवल verified evidence दिखाया गया है।', 'Website audit complete হয়েছে, কিন্তু কিছু external performance check available ছিল না। Report-এ শুধু verified evidence দেখানো হয়েছে।')
    : dataset.findings.length
      ? localized(language, 'The website is working, but a few speed, search, accessibility or configuration issues may affect the visitor experience.', 'Website kaam kar rahi hai, lekin kuch speed, search, accessibility ya configuration issues visitor experience ko affect kar sakte hain.', 'वेबसाइट काम कर रही है, लेकिन कुछ speed, search, accessibility या configuration issues visitor experience को प्रभावित कर सकते हैं।', 'Website কাজ করছে, কিন্তু কিছু speed, search, accessibility বা configuration issue visitor experience-এ প্রভাব ফেলতে পারে।')
      : localized(language, 'The available checks did not find a priority issue on this website.', 'Available checks mein website par koi priority issue nahi mila.', 'उपलब्ध checks में वेबसाइट पर कोई priority issue नहीं मिला।', 'Available check-এ website-এ কোনো priority issue পাওয়া যায়নি।');
  return {
    mode: 'business-owner', language, title: 'SCORYN WEBSITE HEALTH REPORT', summary, workingWell: good, needsAttention: attention.length ? attention : [localized(language, 'No priority issue was found in the checks that completed.', 'Jo checks complete hue, unmein koi priority issue nahi mila.', 'जो checks पूरे हुए, उनमें कोई priority issue नहीं मिला।', 'যে check complete হয়েছে, তাতে কোনো priority issue পাওয়া যায়নি।')],
    customerExperience: findings.slice(0, 3).map((finding) => finding.customerExperience), googleVisibility,
    rankingDisclaimer: dataset.ranking.note,
    topPriorities: findings.slice(0, 3).map((finding) => ({ findingId: finding.findingId, title: finding.problem, reason: finding.businessImpact })),
    findings,
    nextSteps: findings.slice(0, 3).map((finding) => finding.recommendedAction)
  };
}

function developerReport(dataset: AuditDataset, language: ReportLanguage): DeveloperReport {
  const findings: DeveloperFinding[] = dataset.findings.map((finding) => ({
    ...finding,
    likelyCause: typeof finding.rawEvidence.likelyCause === 'string' ? finding.rawEvidence.likelyCause : null,
    evidence: [finding.description, evidence(finding)].filter(Boolean).join(' Evidence: ').slice(0, 1800)
  }));
  return {
    mode: 'developer', language, title: 'SCORYN DEVELOPER AUDIT REPORT',
    summary: `Normalized evidence from ${dataset.pages.length} discovered page(s). PageSpeed/Lighthouse: ${dataset.engines.pageSpeed}; Axe-core: ${dataset.engines.axeCore}; Unlighthouse: ${dataset.engines.unlighthouse}; Web-check signals: ${dataset.engines.webCheck}.`,
    scores: dataset.scores, pages: dataset.pages, metrics: dataset.metrics, infrastructure: dataset.infrastructure, engineStatus: dataset.engines, findings, ranking: dataset.ranking
  };
}

function parseJsonObject(text: string) {
  const clean = text.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try { return JSON.parse(clean.slice(start, end + 1)); } catch { return null; }
}

async function aiBusinessOverlay(dataset: AuditDataset, base: BusinessReport, language: ReportLanguage) {
  const key = process.env.NVIDIA_API_KEY;
  if (!key) return base;
  const input = {
    language: languageNames[language],
    rule: 'Use only the supplied evidence. Never invent metrics, URLs, elements, rankings, customer counts, revenue impact, or causes. Technical evidence remains in the separate field.',
    summary: dataset.scores,
    findings: dataset.findings.slice(0, 18).map((finding) => ({ id: finding.id, title: finding.title, category: finding.category, severity: finding.severity, url: finding.affectedUrl, metric: finding.metric, measured: finding.measuredValue, recommended: finding.recommendedValue, element: finding.affectedElement, selector: finding.selector, resource: finding.resourceUrl, description: finding.description, businessImpact: finding.businessImpact, fix: finding.developerFix }))
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 14_000);
  try {
    const response = await fetch(process.env.NVIDIA_BASE_URL ? `${process.env.NVIDIA_BASE_URL.replace(/\/$/, '')}/chat/completions` : 'https://integrate.api.nvidia.com/v1/chat/completions', { method: 'POST', signal: controller.signal, headers: { accept: 'application/json', 'content-type': 'application/json', authorization: `Bearer ${key}` }, body: JSON.stringify({ model: process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct', temperature: 0.15, max_tokens: 2400, messages: [{ role: 'system', content: 'You write a factual website audit for a non-technical business owner. Return JSON only.' }, { role: 'user', content: `Output language: ${languageNames[language]}. Return an object with summary, workingWell (array), needsAttention (array), customerExperience (array), googleVisibility, topPriorities (array of {findingId,title,reason}), and findings (array of {findingId,problem,where,customerExperience,businessImpact,importance,recommendedAction,technicalEvidence}). Preserve only IDs from the input. Keep explanations clear and short. Do not claim actual Google rankings. Input:\n${JSON.stringify(input)}` }] }) });
    if (!response.ok) return base;
    const data: any = await response.json();
    const output = parseJsonObject(String(data?.choices?.[0]?.message?.content || ''));
    if (!output || typeof output !== 'object') return base;
    const known = new Set(dataset.findings.map((finding) => finding.id));
    const overlayFindings = Array.isArray(output.findings) ? output.findings.filter((item: any) => known.has(item?.findingId)).map((item: any) => {
      const original = base.findings.find((finding) => finding.findingId === item.findingId)!;
      return { ...original, problem: typeof item.problem === 'string' ? item.problem.slice(0, 240) : original.problem, where: typeof item.where === 'string' ? item.where.slice(0, 240) : original.where, customerExperience: typeof item.customerExperience === 'string' ? item.customerExperience.slice(0, 500) : original.customerExperience, businessImpact: typeof item.businessImpact === 'string' ? item.businessImpact.slice(0, 500) : original.businessImpact, importance: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(item.importance) ? item.importance : original.importance, recommendedAction: typeof item.recommendedAction === 'string' ? item.recommendedAction.slice(0, 700) : original.recommendedAction, technicalEvidence: original.technicalEvidence };
    }) : base.findings;
    return {
      ...base,
      summary: typeof output.summary === 'string' ? output.summary.slice(0, 900) : base.summary,
      workingWell: Array.isArray(output.workingWell) ? output.workingWell.filter((value: unknown): value is string => typeof value === 'string').slice(0, 8) : base.workingWell,
      needsAttention: Array.isArray(output.needsAttention) ? output.needsAttention.filter((value: unknown): value is string => typeof value === 'string').slice(0, 8) : base.needsAttention,
      customerExperience: Array.isArray(output.customerExperience) ? output.customerExperience.filter((value: unknown): value is string => typeof value === 'string').slice(0, 8) : base.customerExperience,
      googleVisibility: typeof output.googleVisibility === 'string' ? output.googleVisibility.slice(0, 900) : base.googleVisibility,
      topPriorities: Array.isArray(output.topPriorities) ? output.topPriorities.filter((item: any) => known.has(item?.findingId)).slice(0, 3).map((item: any) => ({ findingId: item.findingId, title: typeof item.title === 'string' ? item.title.slice(0, 240) : base.topPriorities.find((priority) => priority.findingId === item.findingId)?.title || '', reason: typeof item.reason === 'string' ? item.reason.slice(0, 500) : '' })) : base.topPriorities,
      findings: overlayFindings
    };
  } catch {
    return base;
  } finally {
    clearTimeout(timer);
  }
}

export async function buildDualReports(dataset: AuditDataset, language: ReportLanguage): Promise<DualAuditReport> {
  const business = await aiBusinessOverlay(dataset, fallbackBusiness(dataset, language), language);
  return { business, developer: developerReport(dataset, language) };
}

