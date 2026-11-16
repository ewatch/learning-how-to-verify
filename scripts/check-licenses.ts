// Compares the license of every GitHub-hosted tool with what GitHub reports.
// Usage: node scripts/check-licenses.ts   (needs `gh` logged in, or GITHUB_TOKEN)
import { execFileSync } from 'node:child_process';
import { TOOLS } from '../src/data/tools.ts';

let bad = 0;
const seen = new Map<string, string>();
for (const tool of TOOLS) {
  const m = tool.repo.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)$/);
  if (!m) { console.log(`skip  ${tool.id} (${tool.repo})`); continue; }
  const repo = m[1];
  let actual = seen.get(repo);
  if (actual === undefined) {
    try {
      const out = execFileSync('gh', ['api', `repos/${repo}`, '--jq', '[.license.spdx_id // "NONE", .archived, .full_name] | @tsv'], { encoding: 'utf8' }).trim();
      const [spdx, archived, full] = out.split('\t');
      actual = spdx + (archived === 'true' ? ' ARCHIVED' : '') + (full.toLowerCase() !== repo.toLowerCase() ? ` MOVED:${full}` : '');
    } catch { actual = 'NOT-FOUND'; }
    seen.set(repo, actual);
  }
  if (actual === 'NOASSERTION') { console.log(`manual ${tool.id.padEnd(19)} data=${tool.license} (GitHub cannot classify; checked by hand)`); continue; }
  if (actual !== tool.license) { bad++; console.log(`DIFF  ${tool.id.padEnd(20)} data=${tool.license.padEnd(14)} github=${actual}`); }
}
console.log(bad ? `\n${bad} mismatches` : 'all licenses match');
process.exit(bad ? 1 : 0);
