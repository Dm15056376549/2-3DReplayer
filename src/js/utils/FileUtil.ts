/**
 * Simple file helpers.
 * 
 * @author Stefan Glaser
 */
class FileUtil
{
  /**
   * Extract the base path from an url.
   *
   * @param url the url to extract the base path from
   * @returns the base path
   */
  static getBasePath (url: string): string
  {
    const loc = new URL(url);
    let endIdx = loc.pathname.lastIndexOf('/');
    if (endIdx === -1) {
      // No parameter indication character found
      return '/';
    }

    return loc.pathname.slice(0, endIdx + 1);
  }

  /**
   * Extract the hostname from an url string.
   *
   * @param url the url to extract the hostname from
   * @returns the hostname
   */
  static getHostname (url: string): string
  {
    const loc = new URL(url);
    return loc.hostname;
  }
  
  /**
   * Extract the file name from an url string.
   *
   * @param url the url to extract the file name from
   * @returns the file name or the given url if the url doesn't contain any subfolders
   */
  static getFileName (url: string): string
  {
    let endIdx = url.indexOf('?');
    if (endIdx === -1) {
      // No parameter indication character found
      endIdx = url.length;
    }

    const startIdx = url.slice(0, endIdx).lastIndexOf('/');

    return url.slice(startIdx + 1, endIdx);
  }

  /**
   * Extract the file type from an url string.
   *
   * @param url the url to extract the file type from
   * @returns the file type or undefined if the path doesn't refer a file
   */
  static getFileType (url: string): string | undefined
  {
    // TODO: Find a proper solution...
    const lastDotIdx = url.lastIndexOf('.');

    if (lastDotIdx !== -1) {
      return url.slice(lastDotIdx + 1);
    } else {
      return undefined;
    }
  }

  /**
   * Filter a list of files according to their name suffixes.
   *
   * @param files a list of files
   * @param suffixes the list of suffixes to filter for
   * @param gzipAllowed indicator if gzipped versions are accepted
   * @returns a list of files with the given suffixes
   */
  static filterFiles (files: File[] | FileList, suffixes: string[], gzipAllowed: boolean = false): File[] {
    const filteredFiles:File[] = [];

    for (let i = 0; i < files.length; i++) {
      let fileName = files[i].name;
      if (gzipAllowed && fileName.slice(-3) === '.gz') {
        fileName = fileName.slice(0, -3);
      }

      for (let j = 0; j < suffixes.length; j++) {
        if (fileName.slice(-suffixes[j].length) === suffixes[j]) {
          filteredFiles.push(files[i]);
          break;
        }
      }
    }

    return filteredFiles;
  }

  /**
   * Check if the given url/path/file references a known replay file ending.
   *
   * @param url the url to check
   * @param gzipAllowed indicator if gzipped versions are accepted
   * @returns true, if the given url references a known replay file ending, false otherwise
   */
  static isReplayFile (url: string, gzipAllowed: boolean = false): boolean {
    const fileName = FileUtil.getFileName(url);
    const suffix9 = fileName.slice(-9);
    const suffix6 = fileName.slice(-6);

    if (suffix6 === '.rpl3d' || suffix6 === '.rpl2d' || fileName.slice(-7) === '.replay') {
      return true;
    } else if (gzipAllowed && (suffix9 === '.rpl3d.gz' || suffix9 === '.rpl2d.gz' || fileName.slice(-10) === '.replay.gz')) {
      return true;
    }

    return false;
  }

  /**
   * Check if the given url/path/file references a known sserver log file ending.
   *
   * @param url the url to check
   * @param gzipAllowed indicator if gzipped file versions are accepted
   * @returns true, if the given url references a known sserver log file ending, false otherwise
   */
  static isSServerLogFile (url: string, gzipAllowed: boolean = false): boolean {
    const fileName = FileUtil.getFileName(url);

    return fileName.slice(-4) === '.rcg' || (gzipAllowed !== undefined && fileName.slice(-7) === '.rcg.gz');
  }
}

export { FileUtil };
