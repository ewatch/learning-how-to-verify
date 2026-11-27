import type { Locale } from '../data/types';
import { PRACTICES } from '../data/practices';
import { IN_USE } from '../data/in-use';
import { GLOSSARY } from '../data/glossary';
import { GUIDES } from '../data/guides';
import { TOOL_BY_ID } from '../data/tools';
import { LAYERS, LANGS, PHASES } from '../data/taxonomy';
import { START_ROUTES, START_TOUR, START_COPY, DIAGNOSE_COPY } from '../data/start';
import { WHY } from '../data/why';
import { HOME } from '../data/home';
import { PARTS, PETSTORE_COPY } from '../data/petstore';
import { REFERENCES, REFERENCES_COPY } from '../data/references';
import { ABOUT_COPY, GLOSSARY_COPY, LIFECYCLE_COPY, STACK_COPY, GUIDES_INDEX_COPY } from '../data/page-copy';
import { href, other, t } from '../i18n/ui';
import type { SearchDoc } from './search-core';

const clean = (parts: (string | undefined | null)[]): string =>
  parts
    .filter((x): x is string => Boolean(x))
    .join(' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

export function buildSearchIndex(lang: Locale): SearchDoc[] {
  const alt = other(lang);
  const layerMap = new Map(LAYERS.map((l) => [l.id, l]));
  const docs: SearchDoc[] = [];

  // 1. Practices
  for (const p of PRACTICES) {
    const layer = layerMap.get(p.layer)!;
    const toolNames = [
      ...new Set(
        Object.values(p.tools)
          .flat()
          .filter((id): id is string => Boolean(id))
          .map((id) => TOOL_BY_ID.get(id)?.name ?? id),
      ),
    ];
    const snippetFiles = (p.snippets ?? []).map((s) => s.file).filter(Boolean);
    const snippetEnforcers = (p.snippets ?? []).map((s) => s.enforcedBy?.[lang]).filter(Boolean);
    const snippetDesc = (p.snippets ?? []).map((s) => s.description?.[lang]).filter(Boolean);
    const snippetFocus = (p.snippets ?? []).flatMap((s) => (s.focus ?? []).map((f) => f.note[lang]));
    const variantNames = (p.variants ?? []).map((v) => v.name[lang]);
    const variantTexts = (p.variants ?? []).map((v) => v.text[lang]);
    const evidenceTexts = [
      ...p.evidence.general.findings.map((fi) => fi.text[lang]),
      ...p.evidence.ai.findings.map((fi) => fi.text[lang]),
      ...(IN_USE[p.id] ?? []).map((fi) => fi.text[lang]),
    ];

    docs.push({
      id: `practice:${p.id}`,
      kind: 'practice',
      title: p.name[lang],
      url: href(lang, `practices/${p.id}/`),
      summary: clean([p.oneLiner[lang]]),
      layer: p.layer,
      meta: layer.name[lang],
      keywords: clean([
        p.id,
        p.name[alt],
        layer.name[lang],
        ...toolNames,
        ...snippetFiles,
        ...snippetEnforcers,
        ...variantNames,
        p.catches[lang],
      ]),
      body: clean([
        p.intro[lang],
        p.domain.what[lang],
        ...p.worth.map((x) => x[lang]),
        ...p.limits.map((x) => x[lang]),
        p.ai[lang],
        ...variantTexts,
        ...evidenceTexts,
        ...snippetDesc,
        ...snippetFocus,
        ...p.steps.map((x) => x[lang]),
        p.done[lang],
        ...p.think.flatMap((q) => [q.q[lang], q.a[lang]]),
      ]),
    });
  }

  // 2. Glossary terms
  for (const term of GLOSSARY) {
    docs.push({
      id: `glossary:${term.id}`,
      kind: 'glossary',
      title: term.term[lang],
      url: `${href(lang, 'glossary/')}#${term.id}`,
      summary: clean([term.def[lang]]),
      meta: t(lang, 'navGlossary'),
      keywords: clean([
        term.id,
        term.term[alt],
        ...(term.aliases?.[lang] ?? []),
        ...(term.aliases?.[alt] ?? []),
      ]),
      body: '',
    });
  }

  // 3. Tool guides
  for (const g of GUIDES) {
    const tool = TOOL_BY_ID.get(g.tool);
    docs.push({
      id: `guide:${g.id}`,
      kind: 'guide',
      title: g.title[lang],
      url: href(lang, `guides/${g.id}/`),
      summary: clean([g.outcome[lang]]),
      meta: t(lang, 'searchGuideKind'),
      keywords: clean([
        g.id,
        tool?.name,
        ...g.steps.map((s) => s.code?.file),
        ...g.steps.map((s) => s.title[lang]),
      ]),
      body: clean([
        g.installNote[lang],
        ...g.steps.map((s) => s.text[lang]),
        ...g.mistakes.map((m) => m[lang]),
      ]),
    });
  }

  // 4. Tech stack language pages
  for (const lg of LANGS) {
    const ownPractices = PRACTICES.filter((p) => (p.tools[lg.id]?.length ?? 0) > 0);
    const toolNames = [
      ...new Set(
        ownPractices.flatMap((p) => (p.tools[lg.id] ?? []).map((id) => TOOL_BY_ID.get(id)?.name ?? id)),
      ),
    ];
    docs.push({
      id: `stack:${lg.id}`,
      kind: 'stack',
      title: `${lg.name} — ${t(lang, 'navStack')}`,
      url: href(lang, `stack/${lg.id}/`),
      summary: clean([STACK_COPY.intro[lang]]),
      meta: t(lang, 'navStack'),
      keywords: clean([lg.name, lg.short, ...toolNames]),
      body: clean(ownPractices.map((p) => p.name[lang])),
    });
  }

  // 5. Overview pages
  const pageLabel = t(lang, 'searchPageKind');
  docs.push(
    {
      id: 'page:home',
      kind: 'page',
      title: HOME.funnelTitle[lang],
      url: href(lang, ''),
      summary: clean([HOME.lead[lang]]),
      meta: pageLabel,
      keywords: clean([t(lang, 'navFunnel'), t(alt, 'navFunnel'), HOME.headline[lang], ...LAYERS.map((l) => l.name[lang])]),
      body: clean([HOME.funnelIntro[lang], HOME.evidence[lang], ...LAYERS.map((l) => l.idea[lang])]),
    },
    {
      id: 'page:start',
      kind: 'page',
      title: START_COPY.title[lang],
      url: href(lang, 'start/'),
      summary: clean([START_COPY.description[lang]]),
      meta: pageLabel,
      keywords: clean([START_COPY.title[alt], ...START_TOUR.map((s) => s.title?.[lang])]),
      body: clean([
        START_COPY.intro[lang],
        ...START_COPY.outcomes.map((x) => x[lang]),
        ...START_TOUR.flatMap((s) => [s.exercise[lang], s.task[lang]]),
      ]),
    },
    {
      id: 'page:diagnose',
      kind: 'page',
      title: DIAGNOSE_COPY.title[lang],
      url: href(lang, 'diagnose/'),
      summary: clean([DIAGNOSE_COPY.description[lang]]),
      meta: pageLabel,
      keywords: clean([DIAGNOSE_COPY.title[alt], DIAGNOSE_COPY.chooser[lang]]),
      body: clean(START_ROUTES.flatMap((r) => [r.label[lang], r.why[lang], r.exercise[lang], r.done[lang]])),
    },
    {
      id: 'page:lifecycle',
      kind: 'page',
      title: LIFECYCLE_COPY.heading[lang],
      url: href(lang, 'lifecycle/'),
      summary: clean([LIFECYCLE_COPY.intro[lang]]),
      meta: pageLabel,
      keywords: clean([t(lang, 'navLifecycle'), ...PHASES.map((ph) => ph.name[lang])]),
      body: clean([LIFECYCLE_COPY.details[lang]]),
    },
    {
      id: 'page:stack',
      kind: 'page',
      title: STACK_COPY.heading[lang],
      url: href(lang, 'stack/'),
      summary: clean([STACK_COPY.intro[lang]]),
      meta: pageLabel,
      keywords: clean([t(lang, 'navStack'), ...LANGS.map((lg) => lg.name)]),
      body: clean([STACK_COPY.languageIntro[lang], STACK_COPY.coreIntro[lang]]),
    },
    {
      id: 'page:glossary',
      kind: 'page',
      title: t(lang, 'navGlossary'),
      url: href(lang, 'glossary/'),
      summary: clean([GLOSSARY_COPY.description[lang]]),
      meta: pageLabel,
      keywords: clean([t(alt, 'navGlossary')]),
      body: clean([GLOSSARY_COPY.intro[lang]]),
    },
    {
      id: 'page:why-layers',
      kind: 'page',
      title: WHY.title[lang],
      url: href(lang, 'why-layers/'),
      summary: clean([WHY.intro[lang]]),
      meta: pageLabel,
      keywords: clean([WHY.title[alt], ...WHY.findings.map((f) => f.claim[lang])]),
      body: clean([
        ...WHY.findings.flatMap((f) => [f.text[lang], f.fix[lang]]),
        WHY.outro[lang],
      ]),
    },
    {
      id: 'page:petstore',
      kind: 'page',
      title: PETSTORE_COPY.title[lang],
      url: href(lang, 'petstore/'),
      summary: clean([PETSTORE_COPY.description[lang]]),
      meta: pageLabel,
      keywords: clean([PETSTORE_COPY.title[alt], ...PARTS.map((pt) => pt.name[lang])]),
      body: clean([
        PETSTORE_COPY.intro[lang],
        PETSTORE_COPY.story[lang],
        ...PARTS.map((pt) => pt.text[lang]),
      ]),
    },
    {
      id: 'page:guides',
      kind: 'page',
      title: t(lang, 'navGuides'),
      url: href(lang, 'guides/'),
      summary: clean([GUIDES_INDEX_COPY.intro[lang]]),
      meta: pageLabel,
      keywords: clean([t(alt, 'navGuides'), ...GUIDES.map((g) => g.title[lang])]),
      body: '',
    },
    {
      id: 'page:references',
      kind: 'page',
      title: t(lang, 'navReferences'),
      url: href(lang, 'references/'),
      summary: clean([REFERENCES_COPY.lede[lang]]),
      meta: pageLabel,
      keywords: clean([t(alt, 'navReferences'), ...REFERENCES.flatMap((r) => [r.title, r.author])]),
      body: clean(REFERENCES.flatMap((r) => [r.about[lang], ...(r.points ?? []).map((pt) => pt[lang])])),
    },
    {
      id: 'page:about',
      kind: 'page',
      title: t(lang, 'navAbout'),
      url: href(lang, 'about/'),
      summary: clean([ABOUT_COPY.description[lang]]),
      meta: pageLabel,
      keywords: clean([t(alt, 'navAbout'), 'privacy', 'Datenschutz', 'self-verification', 'sources', 'Quellen']),
      body: clean([
        ABOUT_COPY.privacy[lang],
        ABOUT_COPY.sourcesNote[lang],
        ...ABOUT_COPY.checks(PRACTICES.length, TOOL_BY_ID.size).map((c) => c[lang]),
      ]),
    },
  );

  return docs;
}
