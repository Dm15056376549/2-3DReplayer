/**
 * The DataIterator class definition.
 *
 * @author Stefan Glaser
 */
class DataIterator
{
  /** The data to iterate. */
  data: string;

  /** The regular expression used to split the data into line tokens. */
  regExp: RegExp;

  /** The current data line. */
  line?: string;

  /** Flag for partial / not yet fully loaded data. */
  partialData: boolean;

  /**
   * DataIterator Constructor
   * Create a new data interator.
   *
   * @param data the data string
   * @param partial flag for partial / not yet fully loaded data (default: false)
   */
  constructor (data: string, partial: boolean = false)
  {
    this.data = data;
    this.regExp = new RegExp('[^\r\n]+', 'g');
    this.line = undefined;
    this.partialData = partial;

    // console.log('New data iterator instance created!');
  }

  /**
   * Dispose iterator instance.
   */
  dispose (): void
  {
    // console.log('Dispose data iterator instance!');

    // Clear RegExp instance and buffers
    // I feel kind of strange to add this code, but apparently it readuces memory usage
    this.regExp.lastIndex = 0;
    let i = 10;
    while (--i) {
      this.regExp.exec('TRY\nTO\nEMPTY\nCACHE\n!!!');
    }

    this.data = '';
    this.regExp.lastIndex = 0;
    this.line = undefined;
    this.partialData = false;
  }

  /**
   * Update the iterator data.
   *
   * @param data updated data
   * @param partialData flag for partial / not yet fully loaded data (default: false)
   * @param incremental flag for incremental data chunks (default: false)
   * @returns true, if iterator reached end of data before update, false otherwise
   */
  update (data: string, partial: boolean = false, incremental: boolean = false): boolean
  {
    if (incremental) {
      this.data = this.data.slice(this.regExp.lastIndex) + data;
      this.regExp.lastIndex = 0;
    } else {
      this.data = data;
    }

    this.partialData = partial;

    return !this.line;
  }

  /**
   * Check if the exists a next line.
   */
  hasNext (): boolean
  {
    const idx = this.regExp.lastIndex;
    let result = this.regExp.test(this.data);

    if (this.partialData && this.regExp.lastIndex === this.data.length) {
      result = false;
    }

    // Reset running index in regular expression
    this.regExp.lastIndex = idx;

    return result;
  }

  /**
   * Progress the iterator to the next position (if possible)
   * and return the line array at the new position.
   *
   * @returns the current line array
   */
  next (): string | undefined
  {
    const idx = this.regExp.lastIndex;
    let tokens = this.regExp.exec(this.data);

    if (this.partialData && this.regExp.lastIndex === this.data.length) {
      // Reached end of partial data, but no terminating line ending found, thus reset tokens
      tokens = null;
    }

    // Reached end of data, thus reset regex index
    if (tokens === null || tokens.length === 0) {
      this.regExp.lastIndex = idx;
      this.line = undefined;
    } else {
      this.line = tokens[0];
    }

    return this.line;
  }
}

export { DataIterator };
