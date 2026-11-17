import type { Locale } from '../data/types';
import { START_COPY as C, DIAGNOSE_COPY as D, START_ROUTES, START_LOOP, START_TOUR, startAgentPrompt } from '../data/start';
import { PRACTICE_BY_ID } from '../data/practices';
import { GUIDES } from '../data/guides';
import { SITE_URL } from './site';
import { t } from '../i18n/ui';

const helpers = (locale: Locale) => {
  const page = (path: string) => `${SITE_URL}/${locale}/${path}index.md`;
  const name = (id: string) => PRACTICE_BY_ID.get(id)!.name[locale];
  const practice = (id: string) => `[${name(id)}](${page(`practices/${id}/`)})`;
  return { page, name, practice };
};

/** "Getting Started": the guided tour. */
export function startMarkdown(locale: Locale): string {
  const { page, practice } = helpers(locale);
  const out = [`# ${C.title[locale]}`, '', C.intro[locale], '',
    `**${C.after[locale]}:**`, '', ...C.outcomes.map((o) => `- ${o[locale]}`), '',
    `**${C.timeLabel[locale]}:** ${C.time[locale]}`, '',
    `## ${C.example[locale]}`, '', `${C.exampleText[locale]} **${C.rule[locale]}**`, '',
    `- \`reserve(rex, anna)\` → ${C.reservedFor[locale]}`,
    `- \`reserve(rex, ben)\` → ${C.rejected[locale]}`, '',
    C.fee[locale], '',
    `## ${C.learn[locale]}`, '', C.learnHint[locale], ''];
  START_TOUR.forEach((step, i) => {
    const p = step.practice ? PRACTICE_BY_ID.get(step.practice)! : undefined;
    const link = p ? practice(p.id) : `[${step.title![locale]}](${page(step.path!)})`;
    out.push(`${i + 1}. ${link}: ${step.exercise[locale]}${p?.sim ? ` (${C.sim[locale]})` : ''}`);
  });
  out.push('', `## ${C.whatNext[locale]}`, '',
    `### ${C.diagnose[locale]}`, '', `${C.diagnoseHint[locale]} [${D.title[locale]}](${page('diagnose/')})`, '',
    `### ${C.guides[locale]}`, '', C.guidesHint[locale], '',
    ...GUIDES.map((g) => `- [${g.title[locale]}](${page(`guides/${g.id}/`)})`),
    `- [${t(locale, 'navStack')}](${page('stack/')})`, '');
  return out.join('\n');
}

/** "Diagnose my project": the problem chooser and the feedback loop. */
export function diagnoseMarkdown(locale: Locale): string {
  const { page, practice } = helpers(locale);
  const out = [`# ${D.title[locale]}`, '', D.intro[locale], '', `${D.tour[locale]} [${D.tourLink[locale]}](${page('start/')})`, '',
    `## ${D.chooser[locale]}`, '', D.chooseHint[locale], ''];
  for (const route of START_ROUTES) {
    out.push(`### ${route.label[locale]}`, '', route.why[locale], '', `${D.first[locale]}: ${practice(route.practice)}`, '',
      `**${D.exercise[locale]}:** ${route.exercise[locale]}`, '',
      `**${D.feedback[locale]}:** ${route.feedback[locale]}`, '',
      `**${D.done[locale]}:** ${route.done[locale]}`, '',
      `${D.next[locale]}: ${practice(route.next)}`, '',
      `#### ${D.copy[locale]}`, '', '```text', startAgentPrompt(route, locale), '```', '');
  }
  out.push(`## ${D.loop[locale]}`, '', D.loopHint[locale], '');
  for (const step of START_LOOP) out.push(`### ${step.title[locale]}`, '', step.text[locale], '');
  return out.join('\n');
}
