import { Benchmark } from "./services/benchmark.service";
import { PartialBenchmarkOptions } from "./types";

const generateTestArray = (size: number): number[] => {
  return Array.from({ length: size }, (_, i) => i);
};

const implementations = new Map<string, () => number>([
  ['Traditional for loop', () => {
    const arr = generateTestArray(10000);
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
    }
    return sum;
  }],
  
  ['Cached length for loop', () => {
    const arr = generateTestArray(10000);
    let sum = 0;
    for (let i = 0, len = arr.length; i < len; i++) {
      sum += arr[i];
    }
    return sum;
  }],
  
  ['for...of loop', () => {
    const arr = generateTestArray(10000);
    let sum = 0;
    for (const value of arr) {
      sum += value;
    }
    return sum;
  }],
  
  ['forEach method', () => {
    const arr = generateTestArray(10000);
    let sum = 0;
    arr.forEach(value => {
      sum += value;
    });
    return sum;
  }],
  
  ['reduce method', () => {
    const arr = generateTestArray(10000);
    return arr.reduce((sum, value) => sum + value, 0);
  }],
]);

const options: PartialBenchmarkOptions = {
  iterations: 1000, 
  warmupIterations: 100,
  samples: 5, 
  name: 'Array iteration'   
};

Benchmark.compare(implementations, options);