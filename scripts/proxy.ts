import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

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
    const res = await fetch(url);
    const text = await res.text();

    if (res.status === 404 && url.startsWith('http')) {
        url = url.replace('http', 'https');
        console.log(`Retrying with ${url}`);
        const res2 = await fetch(url);
        const text2 = await res2.text();
        return c.text(text2, 200);
    }
    
    return c.text(text, 200);
});

const PORT = 4443;
serve({
    fetch: app.fetch,
    port: PORT,
});

console.log(`Proxy server started on :${PORT}.`);