import { context } from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import { inject } from '../inject';

const args = process.argv.slice(2);
const watchMode = args.includes('--watch');

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
                    if (watchMode) inject();
                    else {
                        console.log('Build complete.');
                        process.exit(0);
                    }
                })
            },
        },
        sassPlugin()],
    });

    if (watchMode) {
        await ctx.watch();
        console.log('Watching...');
    } else {
        await ctx.rebuild();
    }
})();