import { EventDispatcher, GEventObject, GErrorEvent, GProgressEvent } from '../../../utils/EventDispatcher';
import { SimulationLog } from '../SimulationLog';
import { SimulationProviderEventMap, ISimulationProvider } from './SimulationProvider';
import { ISimulationLogParser } from '../parser/SimulationLogParser';
import { ReplayParser } from '../replay/ReplayParser';
import { ULGParser } from '../sserver/ULGParser';
import { FileUtil } from '../../../utils/FileUtil';
import { inflate } from 'pako';

/**
 * The SimulationLogLoader class definition.
 *
 * @author Stefan Glaser
 */
class SimulationLogLoader extends EventDispatcher<SimulationProviderEventMap> implements ISimulationProvider
{
  /** The simulation log parser instance. */
  parser?: ISimulationLogParser;

  /** The XMLHttpRequest object used to load remote simulation log files. */
  xhr?: XMLHttpRequest;

  /** The currently loading xhr ressource. */
  xhrRessource?: URL;

  /** The FileReader object used to load the local simulation log files. */
  fileReader?: FileReader;

  /** The currently loading file ressource. */
  fileRessource?: File;



  /**  */
  xhrOnLoadListener: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => any;
  /**  */
  xhrOnProgressListener: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => any;
  /**  */
  xhrOnErrorListener: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => any;

  /**  */
  fileReaderOnLoadEndListener: (ev: ProgressEvent<FileReader>) => any;


  constructor ()
  {
    super();

    this.parser = undefined;
    this.xhr = undefined;
    this.xhrRessource = undefined;
    this.fileReader = undefined;
    this.fileRessource = undefined;

    this.xhrOnLoadListener = this.xhrOnLoad.bind(this);
    this.xhrOnProgressListener = this.xhrOnProgress.bind(this);
    this.xhrOnErrorListener = this.xhrOnError.bind(this);

    this.fileReaderOnLoadEndListener = this.fileReaderOnLoadEnd.bind(this);
  }

  getSimulationLog(): SimulationLog {
    return undefined;
  }

  /**
   * Load a simulation log from the specified url.
   *
   * @param url the URL to the simulation log file
   */
  load (url: string): void
  {
    // Clear loader instance
    this.clear();

    // Create a parser instance
    if (!this.createParserFor(url, true)) {
      return;
    }

    // Publish start event
    this.dispatchEvent('start', {
      url: url,
      total: 0,
      progress: 0
    });

    // Create Request
    this.xhrRessource = new URL(url, new URL(window.location.href));
    this.xhr = new XMLHttpRequest();
    this.xhr.open('GET', this.xhrRessource, true);

    // Add event listeners
    this.xhr.addEventListener('load', this.xhrOnLoadListener);
    this.xhr.addEventListener('progress', this.xhrOnProgressListener);
    this.xhr.addEventListener('error', this.xhrOnErrorListener);

    // Set mime type
    if (this.xhr.overrideMimeType) {
      this.xhr.overrideMimeType('text/plain');
    }

    // Send request
    this.xhr.send(null);
  }

  /**
   * Load a simulation log file from the local file system.
   *
   * @param file the file to load
   */
  loadFile (file: File): void
  {
    // Clear loader instance
    this.clear();

    // Create a parser instance
    if (!this.createParserFor(file.name)) {
      return;
    }

    this.fileRessource = file;
    this.fileReader = new FileReader();
    this.fileReader.addEventListener('loadend', this.fileReaderOnLoadEndListener);

    // Publish start event
    this.dispatchEvent('start', {
      url: file.name,
      total: 0,
      progress: 0
    });

    // Read file
    if (FileUtil.getFileType(file.name) === 'gz') {
      this.fileReader.readAsArrayBuffer(file);
    } else {
      this.fileReader.readAsText(file);
    }
  }

  /**
   * Load a simulation log file from the local file system.
   *
   * @param name the file name / url / etc.
   * @param gzipAllowed indicator if gzipped file versions are accepted
   * @returns
   */
  createParserFor (name: string, gzipAllowed: boolean = true): boolean
  {
    if (FileUtil.isSServerLogFile(name, gzipAllowed)) {
      // Try ulg parser
      this.parser = new ULGParser();
    } else if (FileUtil.isReplayFile(name, gzipAllowed)) {
      // Use replay parser
      this.parser = new ReplayParser();
    } else {
      this.dispatchEvent('error', {
        msg: 'Error while loading file! Failed to create simulation log parser!'
      });
    }

    return !!this.parser;
  }

  /**
   * Clear the loader instance.
   *
   * @param keepIteratorAlive indicator if iterator should not be disposed
   */
  clear (keepIteratorAlive: boolean = false): void
  {
    // Clear xhr instance
    if (this.xhr) {
      // Remove event listeners
      this.xhr.removeEventListener('load', this.xhrOnLoadListener);
      this.xhr.removeEventListener('progress', this.xhrOnProgressListener);
      this.xhr.removeEventListener('error', this.xhrOnErrorListener);

      // Abort active request
      this.xhr.abort();
      this.xhr = undefined;
      this.xhrRessource = undefined;
    }

    // Clear file loader instance
    if (this.fileReader) {
      // Remove event listeners
      this.fileReader.removeEventListener('loadend', this.fileReaderOnLoadEndListener);

      // Abort active request
      this.fileReader.abort();
      this.fileReader = undefined;
      this.fileRessource = undefined;
    }

    if (this.parser) {
      this.parser.dispose(keepIteratorAlive);
    }

    this.parser = undefined;
  }

  /**
   * The XHR onLoad callback.
   *
   * // ANYFIX: Should be "ProgressEvent<XMLHttpRequestEventTarget>", but then a lot of stuff is not specified...
   * @param  event the xhr event
   */
  xhrOnLoad (event: any): void
  {
    if (event.target.status === 200 || event.target.status === 0) {
      // Parse remaining response
      this.parse(event.target.response, this.xhrRessource);

      // Dispatch finished event
      this.dispatchEvent('finished', {});
    } else {
      // Error during loading
      this.dispatchEvent('error', {
        // msg: this.getXHRErrorMessage()
        msg: 'File not found!'
      });
    }
  }

  /**
   * The FileReader onLoadEnd callback.
   *
   * @param event the FileReader event
   */
  fileReaderOnLoadEnd (event: ProgressEvent<FileReader>): void
  {
    if (!!event.target && event.target.readyState == FileReader.DONE) { // DONE == 2
      let toParse = event.target.result;

      // Check if file result is gzipped
      if (toParse instanceof ArrayBuffer) {
        // Inflate result
        toParse = inflate(toParse, {to: 'string'});
      }

      // Parse file content
      this.parse(toParse, this.fileRessource);

      // Dispatch finished event
      this.dispatchEvent('finished', {});
    } else {
      // Clear loader instance
      this.clear();

      // Error during loading
      this.dispatchEvent('error', {
        msg: 'Loading file failed!'
      });
    }
  }

  /**
   * The XHR onProgress callback.
   *
   * // ANYFIX: Should be "ProgressEvent<XMLHttpRequestEventTarget>", but then a lot of stuff is not specified...
   * @param event the xhr event
   */
  xhrOnProgress (event: any): void
  {
    // Dispatch progress event
    this.dispatchEvent('progress', {
      total: event.total,
      progress: event.loaded
    });

    if (event.target.status === 200 || event.target.status === 0) {
      this.parse(event.target.response, this.xhrRessource, true);
    }
  }

  /**
   * The XHR onError callback.
   *
   * @param event the xhr event
   */
  xhrOnError (event: any): void
  {
    // Dispatch errer event
    this.dispatchEvent('error', {
      msg: this.getXHRErrorMessage()
    });
  }

  /**
   * Try or continue parsing a simulation log.
   *
   * @param data the current data
   * @param ressource the data ressource
   * @param partial flag for partial / not yet fully loaded data (default: false)
   * @param incremental flag for incremental data chunks (default: false)
   */
  parse (data: string | ArrayBuffer | null, ressource: URL | File, partial: boolean = false, incremental: boolean = false): void
  {
    if (!data || !this.parser) {
      // Nothing to parse
      return;
    }

    try {
      // TODO: Think about how to handle a ArrayBuffer response instead of simply assuming a string type.
      if (this.parser.parse(data as string, ressource, partial, incremental)) {
        // A new simulation log instance was successfully created
        this.dispatchEvent('new-sim-log', {
          simulationLog: this.parser.getSimulationLog()
        });
      }

      if (!partial) {
        // Clear loader instance
        this.clear(true);
      }
    } catch (ex: any) {
      // Clear loader instance
      this.clear();

      // Dispatch errer event
      this.dispatchEvent('error', {
        msg: ex.toString()
      });
    }
  }

  /**
   * Retrieve the error message of the active XHR object, or create some default message if there is no error message available.
   *
   * @returns the error/status message
   */
  getXHRErrorMessage (): string
  {
    let message = 'No active XMLHttpRequest to check for an error!';

    if (this.xhr) {
      message = this.xhr.statusText;

      if (!message || message === '') {
        message = 'Unknown reason!';
      }
    }

    // Clear loader instance
    this.clear();

    return message;
  }
}

export { SimulationLogLoader };
