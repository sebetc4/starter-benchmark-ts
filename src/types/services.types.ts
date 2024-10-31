export type BenchmarkOptions = {
    iterations: number
    warmupIterations: number
    samples: number
    name: string
}

export type PartialBenchmarkOptions = Partial<BenchmarkOptions>;
