// @ts-ignore @TODO FIX TSUP
import type { Options } from 'tsup'

/**
 * ref: https://github.com/pmndrs/react-spring/blob/main/tsup.config.base.ts
 */
interface BuildTarget {
        format: 'cjs' | 'esm'
        dts?: boolean
}

const BUILD_TARGETS: BuildTarget[] = [
        {
                format: 'cjs',
                dts: false,
        },
        {
                format: 'esm',
                dts: true,
        },
]

export interface Config {
        (options: Options): Options
}

export const defaultConfig = (override: Options, options: Options) => {
        const ret: Options[] = BUILD_TARGETS.map((target) => {
                return {
                        ...options,
                        ...target,
                        ...override,
                        outDir: 'dist',
                        splitting: false,
                        sourcemap: !options.watch,
                        clean: !options.watch,
                        minify: !options.watch,
                        target: 'es2020',
                        external: ['*'],
                        entry: ['index.ts'],
                        outExtension: ({ format }) => ({
                                js: format === 'esm' ? '.mjs' : '.js',
                                dts: '.d.ts',
                        }),
                }
        })

        return ret
}

export default (options: Options) => defaultConfig({}, options)
