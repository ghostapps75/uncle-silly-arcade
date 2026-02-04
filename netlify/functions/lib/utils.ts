import { Context } from '@netlify/functions';
import { z } from 'zod';

export const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-app-token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Enforced Header
const APP_TOKEN = process.env.APP_TOKEN || 'dev-token';

export async function validateRequest(req: Request, context: Context) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: CORS_HEADERS });
    }

    // Auth Check
    const token = req.headers.get('x-app-token') || req.headers.get('X-APP-TOKEN');
    if (token !== APP_TOKEN) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: CORS_HEADERS,
        });
    }

    return null; // Valid
}

export function jsonResponse(data: any, status = 200, extraHeaders: Record<string, string> = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { ...CORS_HEADERS, ...extraHeaders, 'Content-Type': 'application/json' },
    });
}

export function errorResponse(message: string, status = 400) {
    return jsonResponse({ error: message }, status);
}

// Zod Helper
export async function parseBody<T>(req: Request, schema: z.ZodSchema<T>): Promise<T | null> {
    try {
        const body = await req.json();
        return schema.parse(body);
    } catch (e) {
        return null;
    }
}

// Global Types for LLM
export const SafeWorldNoteCategory = z.enum(['science', 'nature', 'space', 'kindness']);
export type SafeWorldNoteCategory = z.infer<typeof SafeWorldNoteCategory>;
