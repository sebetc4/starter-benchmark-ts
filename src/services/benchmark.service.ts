import type { BenchmarkOptions, PartialBenchmarkOptions } from "@/types";

type BenchmarkResult = {
  average: string;
  min: string;
  max: string;
  median: string;
  opsPerSecond: number;
  standardDeviation: string;
  samples: number[];
};

export class Benchmark {
  private static readonly DEFAULT_OPTIONS: BenchmarkOptions = {
    iterations: 1000,
    warmupIterations: 1000,
    samples: 10,
    name: "Unnamed Benchmark",
  };

  static run<T>(
    fn: (...args: any[]) => T,
    args: any[] = [],
    partialOptions: PartialBenchmarkOptions = {}
  ): BenchmarkResult {
    const options = { ...this.DEFAULT_OPTIONS, ...partialOptions };
    const times = this.executeBenchmark(fn, args, options);

    return this.calculateStats(times, options.iterations);
  }

  static compare(
    implementations: Map<string, (...args: any[]) => any>,
    args: any[] = [],
    partialOptions: PartialBenchmarkOptions = {}
  ): void {
    const options = { ...this.DEFAULT_OPTIONS, ...partialOptions };
    const results = new Map<string, BenchmarkResult>();
    let fastest: { name: string; opsPerSecond: number } = { name: "", opsPerSecond: 0 };

    for (const [name, fn] of implementations) {
      console.log(`\nRunning benchmark for: ${name}`);
      const result = this.run(fn, args, { ...options, name });
      results.set(name, result);

      if (result.opsPerSecond > fastest.opsPerSecond) {
        fastest = { name, opsPerSecond: result.opsPerSecond };
      }
    }

    this.printResults(results, fastest.name);
  }

  private static executeBenchmark(
    fn: (...args: any[]) => any,
    args: any[],
    options: BenchmarkOptions
  ): number[] {
    const times: number[] = [];

    // Warm-up phase
    Array.from({ length: options.warmupIterations }).forEach(() => fn(...args));

    // Test phase
    for (let i = 0; i < options.samples; i++) {
      const start = performance.now();
      for (let j = 0; j < options.iterations; j++) fn(...args);
      const end = performance.now();
      times.push(end - start);
    }

    return times;
  }

  private static calculateStats(times: number[], iterations: number): BenchmarkResult {
    const sorted = times.slice().sort((a, b) => a - b);
    const average = this.calculateAverage(times);
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
      samples: times,
    };
  }

  private static calculateAverage(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private static calculateMedian(sorted: number[]): number {
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[middle]
      : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  private static calculateStandardDeviation(values: number[], mean: number): number {
    const variance =
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private static printResults(results: Map<string, BenchmarkResult>, fastest: string): void {
    console.log("\nBenchmark Results:\n");

    results.forEach((result, name) => {
      console.log(`${name}${name === fastest ? " (Fastest)" : ""}:`);
      console.log(`  Average: ${result.average}ms`);
      console.log(`  Median: ${result.median}ms`);
      console.log(`  Min: ${result.min}ms`);
      console.log(`  Max: ${result.max}ms`);
      console.log(`  Standard Deviation: ${result.standardDeviation}ms`);
      console.log(`  Ops/sec: ${result.opsPerSecond.toLocaleString()}\n`);
    });

    const fastestOps = results.get(fastest)!.opsPerSecond;
    results.forEach((result, name) => {
      if (name !== fastest) {
        const diff = ((fastestOps / result.opsPerSecond) - 1) * 100;
        console.log(`${fastest} is ${diff.toFixed(1)}% faster than ${name}`);
      }
    });
  }
}