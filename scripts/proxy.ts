// scripts/proxy.ts
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { pathToFileURL } from 'node:url';

const app = new Hono();

// CORS middleware
app.use('*', async (c, next) => {
    c.res.headers.set('Access-Control-Allow-Origin', '*');
    c.res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (c.req.method === 'OPTIONS') {
        return c.text('', 204);
    }

    await next();
});

app.get('/', (c) => {
    return c.text('URL is required', 400);
});

app.get('*', async (c) => {
    let url = c.req.path.substring(1);

    if (!url.startsWith('http')) {
        url = `http://${url}`;
    }

    console.log(`Proxying request to ${url}`);

    try {
        const res = await fetch(url);
        let text = await res.text();

        if (res.status === 404 && url.startsWith('http')) {
            url = url.replace('http', 'https');
            console.log(`Retrying with ${url}`);
            const res2 = await fetch(url);
            text = await res2.text();
            return c.text(text, 200);
        }

        return c.text(text, 200);
    } catch (error) {
        console.error(`Error proxying to ${url}:`, error);
        return c.text('Internal Server Error', 500);
    }
});

const DEFAULT_PORT = 4443;

/**
 * Starts the proxy server.
 * @param port - The port number on which the server will listen.
 */
export const startProxy = async (port: number = DEFAULT_PORT) => {
    await serve({
        fetch: app.fetch,
        port,
    });
    console.log(`Proxy server started on port ${port}.`);
};


// if main module, start the proxy server
if (pathToFileURL(process.argv[1]).href === import.meta.url) {
    startProxy();
}