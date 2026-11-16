import type { APIRoute } from 'astro';
import { PRACTICES } from '../data/practices';
import { practiceMarkdown } from '../lib/markdown';
export const GET: APIRoute = () => new Response(['# Learning how to verify: all practices (English)', '', ...PRACTICES.map((p) => practiceMarkdown(p, 'en'))].join('\n\n---\n\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
