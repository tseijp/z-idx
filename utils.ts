import { expect } from 'vitest'
import index from './index'
import type { ZApi } from './index'

export { index }
export const S = 1 << 10
export const mid = (lo: number, up: number) => lo + ((up - lo) >> 1)

const pack = (v: string | readonly string[]): string[] => (Array.isArray(v) ? ([...v] as string[]) : [v as string])

export const dag = <K extends string>(r: ZApi<K>) => {
        const raw = r as any
        const self = {
                raw: r,
                relative(...levels: (K | readonly K[])[]) {
                        const groups = levels.map(pack)
                        for (const g of groups) for (let i = 1; i < g.length; i += 1) expect(raw[g[0]]).toBe(raw[g[i]])
                        for (let i = 0; i < groups.length; i += 1) for (let j = i + 1; j < groups.length; j += 1) for (const a of groups[i]) for (const b of groups[j]) expect(raw[a]).toBeLessThan(raw[b])
                        return self
                },
                absolute(...pairs: readonly [K, K][]) {
                        for (const [a, b] of pairs) expect(raw[a] as number).toBeLessThan(raw[b] as number)
                        return self
                },
                nowarn() {
                        expect(raw.warns).toEqual([])
                        return self
                },
        }
        return self
}

export const order = (api: Record<string, number>, keys: string[]): string[] => [...keys].sort((a, b) => api[a] - api[b])

export const gap = (api: Record<string, number>, seq: string[]): number => (seq.length < 2 ? 0 : api[seq[1]] - api[seq[0]])
