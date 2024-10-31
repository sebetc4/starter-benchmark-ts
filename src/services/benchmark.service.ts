import type { BenchmarkOptions, PartialBenchmarkOptions } from "@/types"

type BenchmarkResult = {
    average: string
    min: string
    max: string
    median: string
    opsPerSecond: number
    standardDeviation: string
    samples: number[]
}

export class Benchmark {
  private static readonly DEFAULT_OPTIONS: BenchmarkOptions = {
    iterations: 1000000,
    warmupIterations: 1000,
    samples: 10,
    name: 'Unnamed Benchmark'
  };

  static run<T>(
    fn: () => T,
    partialOptions: PartialBenchmarkOptions = {}
  ): BenchmarkResult {
    const options: BenchmarkOptions = {
      ...this.DEFAULT_OPTIONS,
      ...partialOptions
    };
    
    const times: number[] = [];

    // Warm-up phase
    for (let i = 0; i < options.warmupIterations; i++) {
      fn();
    }

    // Actual test
    for (let i = 0; i < options.samples; i++) {
      const start = performance.now();
      for (let j = 0; j < options.iterations; j++) {
        fn();
      }
      const end = performance.now();
      times.push(end - start);
    }

    return this.calculateStats(times, options.iterations);
  }

  static compare(
    implementations: Map<string, () => any>,
    partialOptions: PartialBenchmarkOptions = {}
  ): void {
    const options: BenchmarkOptions = {
      ...this.DEFAULT_OPTIONS,
      ...partialOptions
    };
    
    const results = new Map<string, BenchmarkResult>();
    let fastest: [string, number] = ['', 0];

    for (const [name, fn] of implementations) {
      console.log(`\nRunning benchmark for: ${name}`);
      const result = this.run(fn, { ...options, name });
      results.set(name, result);

      if (result.opsPerSecond > fastest[1]) {
        fastest = [name, result.opsPerSecond];
      }
    }

    this.printResults(results, fastest[0]);
  }

  private static calculateStats(
    times: number[],
    iterations: number
  ): BenchmarkResult {
    const sorted = [...times].sort((a, b) => a - b);
    const average = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const median = this.calculateMedian(sorted);
    const standardDeviation = this.calculateStandardDeviation(times, average);
    const opsPerSecond = Math.floor(iterations / (average / 1000));

    return {
      average: average.toFixed(3),
      min: min.toFixed(3),
      max: max.toFixed(3),
      median: median.toFixed(3),
      standardDeviation: standardDeviation.toFixed(3),
      opsPerSecond,
      samples: times
    };
  }

  private static calculateMedian(sorted: number[]): number {
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 
      ? sorted[middle] 
      : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  private static calculateStandardDeviation(
    values: number[],
    mean: number
  ): number {
    const variance = values.reduce((acc, val) => {
      const diff = val - mean;
      return acc + diff * diff;
    }, 0) / values.length;
    return Math.sqrt(variance);
  }

  private static printResults(
    results: Map<string, BenchmarkResult>,
    fastest: string
  ): void {
    console.log('\nBenchmark Results:\n');
    
    for (const [name, result] of results) {
      console.log(`${name}${name === fastest ? ' (Fastest)' : ''}:`);
      console.log(`  Average: ${result.average}ms`);
      console.log(`  Median: ${result.median}ms`);
      console.log(`  Min: ${result.min}ms`);
      console.log(`  Max: ${result.max}ms`);
      console.log(`  Standard Deviation: ${result.standardDeviation}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toLocaleString()}\n`);
    }

    const fastestOps = results.get(fastest)!.opsPerSecond;
    for (const [name, result] of results) {
      if (name !== fastest) {
        const diff = ((fastestOps / result.opsPerSecond) - 1) * 100;
        console.log(`${fastest} is ${diff.toFixed(1)}% faster than ${name}`);
      }
    }
  }
}