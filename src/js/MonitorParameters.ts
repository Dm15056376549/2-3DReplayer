interface ArchiveEntry {
  url: string;
  name: string;
}

/**
 * Class for parsing and holding monitor parameters.
 *
 * @author Stefan Glaser
 */
class MonitorParameters
{
  /** The monitor parameter object. */
  monitorParams: Record<string, any>;

  /** The query parameter object. */
  queryParams: Record<string, string>;

  /**
   * MonitorParameter Constructor
   *
   * @param params the external monitor parameter object
   */
  constructor (params: Record<string, any> = {})
  {
    this.monitorParams = params;
    this.queryParams = MonitorParameters.parseQueryParams();
  }

  /**
   * Retrieve a query parameter.
   *
   * @param key the parameter key
   * @returns the query parameter if specified, or undefined otherwise
   */
  getQueryParam (key: string): string | undefined
  {
    if (this.queryParams[key]) {
      return this.queryParams[key];
    }

    return undefined;
  }

  /**
   * Check for embedded parameter.
   *
   * @returns true, if embedded mode is set and true, false otherwise
   */
  isEmbedded (): boolean
  {
    return this.monitorParams['embedded'] === true;
  }

  /**
   * Retrieve archives parameter.
   *
   * @returns the list of predefined archive locations
   */
  getArchives (): ArchiveEntry[]
  {
    if (this.monitorParams['archives']) {
      return this.monitorParams['archives'];
    }

    return [];
  }

  /**
   * Retrieve the game log / replay url parameter.
   *
   * @returns the game log url if specified, or undefined otherwise
   */
  getGameLogURL (): string | undefined
  {
    let url = this.getQueryParam('gamelog');

    if (!url) {
      // Alternatively check for "replay" parameter
      url = this.getQueryParam('replay');
    }

    return url;
  }

  /**
   * Retrieve the playlist url parameter.
   *
   * @returns the playlist url if specified, or undefined otherwise
   */
  getPlaylistURL (): string | undefined
  {
    return this.getQueryParam('list');
  }

  /**
   * Extract the query parameters from a query string or the current location.
   *
   * @param query the query string to parse or undefined for window.location.search
   * @returns the query parameter map
   */
  static parseQueryParams (query: string = window.location.search): Record<string, string>
  {

    const regex = /[?&]?([^=]+)=([^&]*)/g;
    const params: Record<string, string> = {};
    let tokens;

    query = query.split('+').join(' ');

    while (tokens = regex.exec(query)) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
  }
}

export { MonitorParameters };
