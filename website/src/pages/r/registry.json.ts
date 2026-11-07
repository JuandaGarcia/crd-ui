import type { APIRoute } from 'astro';
import { registryIndex } from '../../lib/registry';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(registryIndex, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
