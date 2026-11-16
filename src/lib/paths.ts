import type { Locale } from '../data/types';
export const langPaths = () => (['en', 'de'] as Locale[]).map((lang) => ({ params: { lang }, props: { lang } }));
