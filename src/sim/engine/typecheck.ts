import ts from 'typescript';
import es5 from 'typescript/lib/lib.es5.d.ts?raw';
import decorators from 'typescript/lib/lib.decorators.d.ts?raw';
import legacy from 'typescript/lib/lib.decorators.legacy.d.ts?raw';
import { TYPE_REVISIONS, type TypeRevision } from '../../data/typecheck';

export interface TypecheckResult {
  diagnostics: { code: number; line: number; column: number; message: string }[];
  checks: { id: 'available' | 'missing' | 'taken'; pass: boolean; got: string }[];
}

/** Real semantic checking in a virtual filesystem; only fixed teaching presets execute. */
export function checkRevision(id: TypeRevision, strict: boolean): TypecheckResult {
  const revision = TYPE_REVISIONS.find((r) => r.id === id);
  if (!revision) throw new Error('Unknown compiler exercise revision');
  const files: Record<string, string> = {
    '/reserve.ts': revision.code,
    '/lib.es5.d.ts': es5,
    '/lib.decorators.d.ts': decorators,
    '/lib.decorators.legacy.d.ts': legacy,
  };
  const options: ts.CompilerOptions = {
    strict, noUncheckedIndexedAccess: strict, noEmitOnError: true,
    target: ts.ScriptTarget.ES2022, lib: ['lib.es5.d.ts'], types: [],
  };
  let emitted = '';
  const host: ts.CompilerHost = {
    getSourceFile: (file, languageVersion) => files[file] === undefined ? undefined : ts.createSourceFile(file, files[file], languageVersion),
    getDefaultLibFileName: () => '/lib.es5.d.ts',
    writeFile: (file, text) => { if (file === '/reserve.js') emitted = text; },
    getCurrentDirectory: () => '/', getDirectories: () => [],
    getCanonicalFileName: (file) => file, useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n', fileExists: (file) => files[file] !== undefined,
    readFile: (file) => files[file],
  };
  const program = ts.createProgram(['/reserve.ts'], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program).map((d) => {
    const pos = d.file?.getLineAndCharacterOfPosition(d.start ?? 0);
    return { code: d.code, line: (pos?.line ?? 0) + 1, column: (pos?.character ?? 0) + 1, message: ts.flattenDiagnosticMessageText(d.messageText, '\n') };
  });
  if (diagnostics.length) return { diagnostics, checks: [] };
  program.emit();
  if (!emitted) throw new Error('Compiler did not emit the exercise');
  type Pets = Record<string, { reservedBy: string | null }>;
  const reserve = new Function(`${emitted}\nreturn reserve;`)() as (pets: Pets, id: string, person: string) => string;
  const probes = [
    { id: 'available', pets: { rex: { reservedBy: null } }, person: 'anna', result: 'reserved', owner: 'anna' },
    { id: 'missing', pets: {}, person: 'anna', result: 'missing', owner: undefined },
    { id: 'taken', pets: { rex: { reservedBy: 'anna' } }, person: 'ben', result: 'taken', owner: 'anna' },
  ] as const;
  const checks = probes.map((p) => {
    const pets: Pets = structuredClone(p.pets);
    try {
      const result = reserve(pets, 'rex', p.person);
      const owner = pets.rex?.reservedBy;
      return { id: p.id, pass: result === p.result && owner === p.owner, got: `result=${result}; reservedBy=${owner ?? 'undefined'}` };
    } catch (error) {
      return { id: p.id, pass: false, got: error instanceof Error ? `${error.name}: ${error.message}` : String(error) };
    }
  });
  return { diagnostics, checks };
}
