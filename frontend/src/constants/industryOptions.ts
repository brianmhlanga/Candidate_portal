/** Canonical industry list for candidate questionnaire (dropdown values = labels). */

export const INDUSTRY_OPTIONS = [
    'Accounting & Finance',
    'Administrative & Office Support',
    'Advertising, Marketing & PR',
    'Agriculture & Farming',
    'Architecture & Planning',
    'Arts, Entertainment & Recreation',
    'Automotive',
    'Aviation & Aerospace',
    'Banking & Financial Services',
    'Beauty & Cosmetics',
    'Biotechnology & Pharmaceuticals',
    'البناء / Construction & Building',
    'Consulting & Professional Services',
    'Customer Service & Call Centres',
    'Education & Training',
    'Energy & Utilities (Electricity, Water, Gas)',
    'Engineering',
    'Environmental Services & Sustainability',
    'Events & Hospitality',
    'Fashion & Apparel',
    'Food & Beverage (Production & Services)',
    'Government & Public Sector',
    'Healthcare & Medical',
    'Human Resources & Recruitment',
    'Information Technology & Software',
    'Insurance',
    'Legal Services',
    'Logistics, Transport & Supply Chain',
    'Manufacturing & Production',
    'Media, Journalism & Publishing',
    'Mining & Minerals',
    'Non-Profit & NGOs',
    'Real Estate & Property',
    'Research & Development',
    'Retail & Wholesale',
    'Sales & Business Development',
    'Security & Safety Services',
    'Sports & Fitness',
    'Telecommunications',
    'Tourism & Travel',
    'Trades & Skilled Labour (Plumbing, Electrical, etc.)',
    'E-commerce',
    'Digital Marketing',
    'Gaming & Esports',
    'Renewable Energy',
    'FinTech',
    'EdTech',
    'HealthTech',
    'Construction Materials (Hardware, Bricks, etc.)',
    'Printing & Branding Services'
] as const;

/** Map CV free-text industry to a dropdown value when possible. */
export function matchParsedIndustry(parsed: string | undefined | null): string {
    if (!parsed || typeof parsed !== 'string') return '';
    const t = parsed.trim();
    if (!t) return '';
    const lower = t.toLowerCase();
    const exact = INDUSTRY_OPTIONS.find((o) => o.toLowerCase() === lower);
    if (exact) return exact;
    const candidates = INDUSTRY_OPTIONS.filter(
        (o) => o.toLowerCase().includes(lower) || lower.includes(o.toLowerCase())
    );
    if (candidates.length === 0) return '';
    return [...candidates].sort((a, b) => b.length - a.length)[0];
}
