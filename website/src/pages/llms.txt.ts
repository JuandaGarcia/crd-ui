import type { APIRoute } from 'astro';
import { LLMS_INDEX } from '../lib/docs-md';

export const GET: APIRoute = () =>
  new Response(LLMS_INDEX, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
