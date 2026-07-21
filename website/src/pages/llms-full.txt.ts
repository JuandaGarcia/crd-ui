import type { APIRoute } from 'astro';
import { FULL_DOCS } from '../lib/docs-md';

export const GET: APIRoute = () =>
  new Response(FULL_DOCS, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
