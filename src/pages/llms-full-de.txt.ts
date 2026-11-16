import type { APIRoute } from 'astro';
import { PRACTICES } from '../data/practices';
import { practiceMarkdown } from '../lib/markdown';
export const GET: APIRoute = () => new Response(['# Verifizieren lernen: alle Praktiken (Deutsch)', '', ...PRACTICES.map((p) => practiceMarkdown(p, 'de'))].join('\n\n---\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
