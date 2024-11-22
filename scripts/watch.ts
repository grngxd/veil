import { context } from 'esbuild';
import { inject } from './inject';

(async () => {
    const ctx = await context({
        entryPoints: ['packages/core/index.tsx'],
        bundle: true,
        // minify: true,
        outfile: 'out/veil.js',
        platform: 'browser',
        target: 'ES2020',
        format: 'iife',
        sourcemap: true,
        plugins: [{
            name: 'rebuild-notify',
            setup(build) {
                build.onEnd(result => {
                    console.log(`Rebuilding... ${result.errors.length} errors, ${result.warnings.length} warnings`);
                    inject();
                })
            },
        }],
    })

    await ctx.watch()
    console.log('Watching...');
})();