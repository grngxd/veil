// this script is just for development: it creates a proxy server that proxies requests to other servers

// if you wanna use your own proxy server, you can use this script,
// or make your own that fufills url: [server]/* -> http(s):/*,
// so for example https://localhost:4443/https://google.com will proxy to https://google.com
// and https://localhost:4443/http://google.com will proxy to http://google.com
// and https://localhost:4443/google.com will proxy to http://google.com, and try https://google.com if that fails

// i chose hono because its cheap and easy to use,
// this whole thing couldve fit in 1 line if you tried really hard
// but i wanted to add some headers to make it work with the web client

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