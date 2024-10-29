import { Exporter } from '@contracts/exporter';

export class CsvExporter implements Exporter<object> {
  #filename: string = 'data.csv';

  /**
   * Export data to a CSV file.
   *
   * @param data Data to be exported.
   * @returns void
   */
  export(data: object | object[]): void {
    const csv = this.convert(data);
    this.download(csv);
  }

  /**
   * Convert data to CSV format.
   *
   * @param data Data to be converted.
   * @returns CSV string
   */
  convert(data: object | object[]): string {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid data format.');
    }

    const headers = Object.keys(data[0]).join(',');
    const rows = data
      .map((obj) =>
        Object.values(obj)
          .map((value) => `"${value}"`)
          .join(',')
      )
      .join('\n');

    return `${headers}\n${rows}`;
  }

  /**
   * Download the CSV file.
   *
   * @param content Content of the CSV file.
   * @returns void
   */
  download(content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.setAttribute('href', url);
    link.setAttribute('download', this.#filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /**
   * Set the filename of the CSV file to be exported.
   *
   * @param filename
   * @returns
   */
  filename(filename: string): CsvExporter {
    this.#filename = filename;

    return this;
  }
}
