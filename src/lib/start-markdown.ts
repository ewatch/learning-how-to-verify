import type { Locale } from '../data/types';
import { START_COPY as C, START_ROUTES, START_LOOP, START_TOUR, startAgentPrompt } from '../data/start';
import { PRACTICE_BY_ID } from '../data/practices';
import { GUIDES } from '../data/guides';
import { SITE_URL } from './site';
import { t } from '../i18n/ui';

export function startMarkdown(locale: Locale): string {
  const page = (path: string) => `${SITE_URL}/${locale}/${path}index.md`;
  const name = (id: string) => PRACTICE_BY_ID.get(id)!.name[locale];
  const practice = (id: string) => `[${name(id)}](${page(`practices/${id}/`)})`;
  const out = [`# ${C.title[locale]}`, '', C.intro[locale], '', `## ${C.chooser[locale]}`, '', C.chooseHint[locale], ''];
  for (const route of START_ROUTES) {
    out.push(`### ${route.label[locale]}`, '', route.why[locale], '', `${C.first[locale]}: ${practice(route.practice)}`, '',
      `**${C.exercise[locale]}:** ${route.exercise[locale]}`, '',
      `**${C.feedback[locale]}:** ${route.feedback[locale]}`, '',
      `**${C.done[locale]}:** ${route.done[locale]}`, '',
      `${C.next[locale]}: ${practice(route.next)}`, '',
      `#### ${C.copy[locale]}`, '', '```text', startAgentPrompt(route, locale), '```', '');
  }
  out.push(`## ${C.loop[locale]}`, '', C.loopHint[locale], '');
  for (const step of START_LOOP) out.push(`### ${step.title[locale]}`, '', step.text[locale], '');
  out.push(`## ${C.learn[locale]}`, '', C.learnHint[locale], '');
  START_TOUR.forEach((step, i) => {
    const link = 'practice' in step ? practice(step.practice!) : `[${step.title![locale]}](${SITE_URL}/${locale}/${step.path})`;
    out.push(`${i + 1}. ${link}: ${step.exercise[locale]}`);
  });
  out.push('', `## ${C.guides[locale]}`, '', C.guidesHint[locale], '',
    ...GUIDES.map((g) => `- [${g.title[locale]}](${page(`guides/${g.id}/`)})`),
    `- [${t(locale, 'navStack')}](${SITE_URL}/${locale}/stack/)`, '');
  return out.join('\n');
}
