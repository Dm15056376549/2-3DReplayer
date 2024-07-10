import { EventDispatcher, GEventObject, GErrorEvent, GProgressEvent } from '../../utils/EventDispatcher';
import { Playlist } from './Playlist';

export interface PlaylistLoadedEvent extends GEventObject
{
  /** The successfully loaded playlist. */
  playlist: Playlist;
}

/** The playlist loader event map interface. */
export interface PlaylistLoaderEventMap {
  'start': GProgressEvent;
  'progress': GProgressEvent;
  'finished': PlaylistLoadedEvent;
  'error': GErrorEvent;
}

/**
 * Possible playlist loader events.
 */
export const enum PlaylistLoaderEvents {
  START = 'start',
  PROGRESS = 'progress',
  FINISHED = 'finished',
  ERROR = 'error'
}

/**
 * The PlaylistLoader class definition.
 *
 * The PlaylistLoader provides
 *
 * @author Stefan Glaser / http://chaosscripting.net
 */
class PlaylistLoader extends EventDispatcher<PlaylistLoaderEventMap>
{
  /** The XMLHttpRequest object used to load remote playlists. */
  xhr?: XMLHttpRequest;

  /** The FileReader object used to load the local playlist files. */
  fileReader?: FileReader;


  /**  */
  xhrOnLoadListener: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => any;
  /**  */
  xhrOnProgressListener: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => any;
  /**  */
  xhrOnErrorListener: (ev: ProgressEvent<XMLHttpRequestEventTarget>) => any;

  /**  */
  fileReaderOnLoadEndListener: (ev: ProgressEvent<FileReader>) => any;

  /**
   * [PlaylistLoader description]
   *
   * ::implements {IPublisher}
   * ::implements {IEventDispatcher}
   */
  constructor ()
  {
    super();

    this.xhr = undefined;
    this.fileReader = undefined;

    this.xhrOnLoadListener = this.xhrOnLoad.bind(this);
    this.xhrOnProgressListener = this.xhrOnProgress.bind(this);
    this.xhrOnErrorListener = this.xhrOnError.bind(this);

    this.fileReaderOnLoadEndListener = this.fileReaderOnLoadEnd.bind(this);
  }

  /**
   * Load a game log from the specified url.
   *
   * @param url the URL to the game log file
   */
  load (url: string): void
  {
    // Clear loader instance
    this.clear();

    // Publish start event
    this.dispatchEvent('start', {
      url: url,
      total: 0,
      progress: 0
    });

    // Create Request
    this.xhr = new XMLHttpRequest();
    this.xhr.open('GET', url, true);

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
   * Load a game log file from the local file system.
   *
   * @param file the file to load
   */
  loadFile (file: File): void
  {
    // Clear loader instance
    this.clear();

    if (!this.fileReader) {
      this.fileReader = new FileReader();
      this.fileReader.addEventListener('loadend', this.fileReaderOnLoadEndListener);
    }

    // Publish start event
    this.dispatchEvent('start', {
      url: file.name,
      total: 0,
      progress: 0
    });

    // Read file
    // this.fileReader.readAsBinaryString(file);
    this.fileReader.readAsText(file);
  }

  /**
   * Clear the loader instance.
   */
  clear (): void
  {
    if (this.xhr) {
      // Remove event listeners
      this.xhr.removeEventListener('load', this.xhrOnLoadListener);
      this.xhr.removeEventListener('progress', this.xhrOnProgressListener);
      this.xhr.removeEventListener('error', this.xhrOnErrorListener);

      // Abort active request
      this.xhr.abort();
      this.xhr = undefined;
    }
  }

  /**
   * The XHR onLoad callback.
   *
   * // ANYFIX: Should be "ProgressEvent<XMLHttpRequestEventTarget>", but then a lot of stuff is not specified...
   * @param event the xhr event
   */
  xhrOnLoad (event: any): void
  {
    if (event.target.status === 200 || event.target.status === 0) {

      // Parse response
      this.createPlaylist(event.target.response);
    } else {
      // Error during loading
      this.dispatchEvent('error', {
        msg: this.getXHRErrorMessage()
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
      // Parse file content
      // TODO: Think about how to handle a ArrayBuffer response instead of simply assuming a string type.
      this.createPlaylist(event.target.result as string);
    } else {
      // Clear loader instance
      this.clear();

      // Error during loading
      this.dispatchEvent('error', {
        msg: 'ERROR: Loading file failed!'
      });
    }
  }

  /**
   * The XHR onProgress callback.
   *
   * @param event the xhr event
   */
  xhrOnProgress (event: ProgressEvent<XMLHttpRequestEventTarget>): void
  {
    // Dispatch progress event
    this.dispatchEvent('progress', {
      total: event.total,
      progress: event.loaded
    });
  }

  /**
   * The XHR onError callback.
   *
   * @param event the xhr event
   */
  xhrOnError (event: ProgressEvent<XMLHttpRequestEventTarget>): void
  {
    // Dispatch errer event
    this.dispatchEvent('error', {
      msg: this.getXHRErrorMessage()
    });
  }

  /**
   * Create a playlist instance from the given data.
   *
   * @param data the current data
   */
  createPlaylist (data: string): void
  {
    const playlist = Playlist.fromJSONString(data);

    // Clear loader instance
    this.clear();

    if (playlist) {
      this.dispatchEvent('finished', {
        playlist: playlist
      });
    } else {
      this.dispatchEvent('error', {
        msg: 'ERROR while parsing Playlist data!'
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

export { PlaylistLoader };
