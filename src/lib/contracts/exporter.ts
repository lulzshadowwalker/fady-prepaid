export interface Exporter<T> {
  export(data: T | T[]): void;
}
