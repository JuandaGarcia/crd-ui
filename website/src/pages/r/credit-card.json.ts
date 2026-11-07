import type { APIRoute } from 'astro';
import { registryItem } from '../../lib/registry';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(registryItem, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
