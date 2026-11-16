/** Pure data for the `scope` diagram family (no DOM; testable in node). */
export type Lang = 'en' | 'de';
export type BoxState = 'real' | 'fake' | 'off' | 'inner';
export type L10n = { en: string; de: string };

export const BOXES: { id: string; label: L10n; short: L10n }[] = [
  { id: 'ui', label: { en: 'Browser UI', de: 'Browser-UI' }, short: { en: 'UI', de: 'UI' } },
  { id: 'api', label: { en: 'API', de: 'API' }, short: { en: 'API', de: 'API' } },
  { id: 'domain', label: { en: 'Domain: reserve', de: 'Domain: reserve' }, short: { en: 'Domain', de: 'Domain' } },
  { id: 'db', label: { en: 'Database', de: 'Datenbank' }, short: { en: 'DB', de: 'DB' } },
  { id: 'ext', label: { en: 'Payment / mail', de: 'Payment / Mail' }, short: { en: 'Ext', de: 'Ext' } },
];

export interface Catch { box: number; span?: [number, number]; label: L10n }
export interface Note { box: number; label: L10n }
export interface ScopeSpec {
  /** state of each of the 5 boxes */
  boxes: [BoxState, BoxState, BoxState, BoxState, BoxState];
  /** box indices the request visits, in order */
  path: number[];
  catch: Catch;
  notes?: Note[];
  /** only a health ping travels (smoke) */
  ping?: boolean;
  /** screenshot frame around the UI box (ui-ux) */
  frame?: boolean;
  caption: L10n;
  takeaway: L10n;
}

const S = (a: BoxState, b: BoxState, c: BoxState, d: BoxState, e: BoxState): ScopeSpec['boxes'] => [a, b, c, d, e];

export const MODES = ['functional-tests', 'component-tests', 'integration-tests', 'e2e-tests', 'acceptance-tests', 'smoke-tests', 'ui-ux-tests'] as const;

export const SPECS: Record<string, ScopeSpec> = {
  'functional-tests': {
    boxes: S('off', 'real', 'inner', 'inner', 'fake'), path: [1, 2, 3, 4],
    catch: { box: 1, label: { en: 'Wrong response', de: 'Falsche Antwort' } },
    notes: [{ box: 2, label: { en: 'Internals ignored', de: 'Intern egal' } }],
    caption: { en: 'A functional test calls only the public API with "reserve Rex" and checks the response, while the internals stay out of sight.', de: 'Ein Functional Test ruft nur die öffentliche API mit „reserve Rex“ auf und prüft die Antwort; die Interna bleiben unsichtbar.' },
    takeaway: { en: 'Test what the API promises, not how it works inside.', de: 'Teste, was die API verspricht, nicht ihr Innenleben.' },
  },
  'component-tests': {
    boxes: S('real', 'fake', 'off', 'off', 'off'), path: [0, 1],
    catch: { box: 0, label: { en: 'Wrong prop', de: 'Falsche Prop' } },
    caption: { en: 'A component test renders the real UI component and answers its API calls with a fake.', de: 'Ein Component Test rendert die echte UI-Komponente und beantwortet ihre API-Aufrufe mit einem Fake.' },
    takeaway: { en: 'One real piece, everything around it faked: fast and precise.', de: 'Ein echtes Stück, alles drumherum gefakt: schnell und genau.' },
  },
  'integration-tests': {
    boxes: S('off', 'real', 'real', 'real', 'fake'), path: [1, 2, 3, 4],
    catch: { box: 3, label: { en: 'SQL rejected', de: 'SQL abgelehnt' } },
    caption: { en: 'An integration test runs API, domain and a real database together and fakes only the external service.', de: 'Ein Integration Test lässt API, Domain und eine echte Datenbank zusammenlaufen und fakt nur den externen Dienst.' },
    takeaway: { en: 'Real wiring finds what mocks hide.', de: 'Echte Verdrahtung findet, was Mocks verstecken.' },
  },
  'e2e-tests': {
    boxes: S('real', 'real', 'real', 'real', 'real'), path: [0, 1, 2, 3, 4],
    catch: { box: 1, span: [0, 1], label: { en: 'Wrong endpoint', de: 'Falscher Endpoint' } },
    caption: { en: 'An end-to-end test clicks through the real browser UI and every layer down to the payment sandbox.', de: 'Ein End-to-End-Test klickt durch die echte Browser-UI und jede Schicht bis zur Payment-Sandbox.' },
    takeaway: { en: 'Closest to real use, but slowest: keep these few.', de: 'Am nächsten an echter Nutzung, aber am langsamsten: wenige halten.' },
  },
  'acceptance-tests': {
    boxes: S('off', 'real', 'real', 'fake', 'fake'), path: [1, 2, 3],
    catch: { box: 2, label: { en: 'Rule missed', de: 'Regel fehlt' } },
    notes: [
      { box: 0, label: { en: 'Given Rex free', de: 'Given Rex frei' } },
      { box: 1, label: { en: 'When reserve', de: 'When reserve' } },
      { box: 3, label: { en: 'Then reserved', de: 'Then reserviert' } },
    ],
    caption: { en: 'An acceptance test walks one business rule as Given, When, Then through the real domain with fast fakes behind it.', de: 'Ein Acceptance Test geht eine Geschäftsregel als Given, When, Then durch die echte Domain, mit schnellen Fakes dahinter.' },
    takeaway: { en: 'It proves the business rule, in the customer\'s words.', de: 'Er beweist die Geschäftsregel in den Worten des Kunden.' },
  },
  'smoke-tests': {
    boxes: S('real', 'real', 'real', 'real', 'real'), path: [0, 1, 2, 3, 4], ping: true,
    catch: { box: 4, label: { en: 'Service down', de: 'Dienst down' } },
    notes: [{ box: 0, label: { en: 'Health ping', de: 'Health-Ping' } }],
    caption: { en: 'A smoke test sends only a tiny health ping through every real box after a deploy.', de: 'Ein Smoke Test schickt nach dem Deploy nur einen kleinen Health-Ping durch jede echte Box.' },
    takeaway: { en: 'Not "is it correct?" but "is it alive?".', de: 'Nicht „stimmt es?“, sondern „lebt es?“.' },
  },
  'ui-ux-tests': {
    boxes: S('real', 'fake', 'off', 'off', 'off'), path: [0, 1], frame: true,
    catch: { box: 0, label: { en: 'Missing label', de: 'Label fehlt' } },
    notes: [{ box: 0, label: { en: 'Screenshot', de: 'Screenshot' } }],
    caption: { en: 'A UI/UX test captures a screenshot of the real page and checks accessibility, with the API faked.', de: 'Ein UI/UX-Test macht einen Screenshot der echten Seite und prüft Accessibility, die API ist gefakt.' },
    takeaway: { en: 'Logic can pass while the screen is still unusable.', de: 'Die Logik kann bestehen, während der Screen unbrauchbar bleibt.' },
  },
};

/** Compare scopes: unit is domain-only; the rest reuse their mode's spec. */
export const COMPARE = ['unit', 'component', 'integration', 'e2e'] as const;
export type CompareKey = (typeof COMPARE)[number];

const UNIT: ScopeSpec = {
  boxes: S('off', 'off', 'real', 'fake', 'fake'), path: [2],
  catch: { box: 2, label: { en: 'Wrong rule', de: 'Falsche Regel' } },
  caption: { en: 'A unit test exercises only the domain box; everything it touches is faked.', de: 'Ein Unit Test prüft nur die Domain-Box; alles, was sie berührt, ist gefakt.' },
  takeaway: { en: 'Smallest scope: instant, but blind to wiring.', de: 'Kleinster Scope: sofort da, aber blind für Verdrahtung.' },
};

export const COMPARE_SPECS: Record<CompareKey, ScopeSpec> = {
  unit: UNIT,
  component: SPECS['component-tests'],
  integration: SPECS['integration-tests'],
  e2e: SPECS['e2e-tests'],
};

export const COMPARE_LABELS: Record<CompareKey, L10n> = {
  unit: { en: 'unit', de: 'unit' },
  component: { en: 'component', de: 'component' },
  integration: { en: 'integration', de: 'integration' },
  e2e: { en: 'e2e', de: 'e2e' },
};

export const UI = {
  compare: { en: 'Compare', de: 'Vergleich' },
  play: { en: 'Play', de: 'Abspielen' },
  replay: { en: 'Replay', de: 'Nochmal' },
  real: { en: 'real', de: 'echt' },
  fake: { en: 'fake', de: 'fake' },
  request: { en: 'reserve Rex', de: 'reserve Rex' },
} as const;

/** Unknown modes fall back to the end-to-end spec, so something sensible renders. */
export function specFor(mode: string): ScopeSpec {
  return SPECS[mode] ?? SPECS['e2e-tests'];
}

/** Which compare segment matches a mode, if any. */
export function compareKeyFor(mode: string): CompareKey | null {
  if (mode === 'component-tests') return 'component';
  if (mode === 'integration-tests') return 'integration';
  if (mode === 'e2e-tests') return 'e2e';
  return null;
}
