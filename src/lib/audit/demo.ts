function hash(input: string) {
  let n = 0;
  for (const ch of input) n = (n * 31 + ch.charCodeAt(0)) >>> 0;
  return n;
}

export function createDemoAudit(url: string) {
  const h = hash(url);
  const score = (offset: number, min = 62, span = 32) => min + ((h >> offset) % span);
  const performance = score(0, 55, 39);
  const seo = score(4, 72, 25);
  const accessibility = score(8, 68, 29);
  const bestPractices = score(12, 70, 27);
  return {
    performance,
    seo,
    accessibility,
    bestPractices,
    overall: Math.round((performance + seo + accessibility + bestPractices) / 4),
    issues: [
      { key: 'largest-contentful-paint', title: 'Largest Contentful Paint can be improved', category: 'PERFORMANCE', severity: 'HIGH', explanation: 'Your main content appears later than ideal, which can make the site feel slow to potential customers.', businessImpact: 'A slower first impression can reduce engagement and enquiries, especially on mobile.' },
      { key: 'image-optimization', title: 'Images are heavier than necessary', category: 'PERFORMANCE', severity: 'MEDIUM', explanation: 'Some images can be delivered in smaller modern formats without reducing visible quality.', businessImpact: 'Lighter pages load faster and use less mobile data, helping visitors stay on the site.' },
      { key: 'meta-description', title: 'Search snippet can be clearer', category: 'SEO', severity: 'MEDIUM', explanation: 'The page metadata can better explain what the business offers to searchers.', businessImpact: 'Clearer search snippets can improve qualified clicks from Google.' }
    ]
  };
}
