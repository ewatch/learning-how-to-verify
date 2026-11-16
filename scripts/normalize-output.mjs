// Normalises TLC/Dafny output so recorded guide outputs are stable across machines.
// Usage: node scripts/normalize-output.mjs < raw.txt > clean.txt
import { readFileSync } from 'node:fs';
export function normalize(s) {
  return s
    .replace(/^Warning: Please run the Java VM.*\n(\(Use the -nowarning.*\n)?/m, '')
    .replace(/Running breadth-first.*\n/, 'Running breadth-first search Model-Checking with 1 worker …\n')
    .replace(/^Parsing file (.*)\n/gm, (_, f) => (/(Naturals|Sequences|FiniteSets|TLC|Integers)\.tla$/.test(f) ? '' : `Parsing file ${f.split('/').pop()}\n`))
    .replace(/^Semantic processing of module (Naturals|Sequences|FiniteSets|TLC|Integers)\n/gm, '')
    .replace(/\(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d\)/g, '(…)')
    .replace(/ at \d{4}-\d\d-\d\d \d\d:\d\d:\d\d\./g, '.')
    .replace(/Finished in \d+(ms|s|min)/g, 'Finished in …')
    .replace(/calculated \(optimistic\):\s+val = [\d.E-]+/g, 'calculated (optimistic):  val = …');
}
if (import.meta.url === `file://${process.argv[1]}`) process.stdout.write(normalize(readFileSync(0, 'utf8')));
