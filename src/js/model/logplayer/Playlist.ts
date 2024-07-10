import { EventDispatcher, GChangeEvent, GEventObject, GIndexedChangeEvent } from '../../utils/EventDispatcher';
import { SimulationLogInfo } from '../../utils/SimulationLogInfo';

export interface GameLogEntryUpdatedEvent extends GEventObject
{
  entry: GameLogEntry;
  index: number;
}

/** The playlist event map interface. */
export interface PlaylistEventMap {
  'change': GIndexedChangeEvent<GameLogEntry | undefined>;
  'update': GameLogEntryUpdatedEvent;
  'active-change': GChangeEvent<number>;
  'autoplay-change': GChangeEvent<boolean>;
}

/**
 * The GameLogEntry class definition.
 *
 * @author Stefan Glaser
 */
class GameLogEntry
{
  /** The playlist entry title. */
  title: string;

  /** The playlist entry resource. */
  resource: string | File;

  /** The error message for this entry (undefined -> no error). */
  errorMsg?: string;

  /** The simulation log info instance to this entry. */
  info?: SimulationLogInfo;

  /**
   * GameLogEntry Constructor
   *
   * @param title the entry title
   * @param resource the simulation log resource url or file
   */
  constructor (title: string, resource: string | File)
  {
    this.title = title;
    this.resource = resource;
    this.errorMsg = undefined;
    this.info = undefined;

    // Try to extract the simulation log info from the resource name
    if (resource instanceof File) {
      this.info = SimulationLogInfo.fromFileName(resource.name);
    } else {
      this.info = SimulationLogInfo.fromURL(resource);
    }
  }
}


/**
 * The Playlist class definition.
 *
 * The Playlist is the central class representing the player logic, canvas handling, etc.
 *
 * @author Stefan Glaser
 */
class Playlist extends EventDispatcher<PlaylistEventMap>
{
  /** The playlist title. */
  title: string;

  /** The playlist entries. */
  entries: GameLogEntry[];

  /** The index of the active playlist entry. */
  activeIndex: number;

  /** Indicator if this list is in autoplay mode. */
  autoplay: boolean;

  /**
   * Playlist Constructor
   *
   * ::implements {IPublisher}
   * ::implements {IEventDispatcher}
   * @param title the title of the playlist
   */
  constructor (title: string)
  {
    super();

    this.title = title;
    this.entries = [];
    this.activeIndex = -1;
    this.autoplay = false;
  }

  /**
   * Set the autoplay property of this playlist.
   *
   * @param autoplay true or undefined to enable autoplay, false to disable
   */
  setAutoplay (autoplay: boolean = true): void
  {
    if (this.autoplay !== autoplay) {
      this.autoplay = autoplay;

      // Publish autoplay change event
      this.dispatchEvent('autoplay-change', {
        oldValue: !autoplay,
        newValue: autoplay
      });
    }
  }

  /**
   * Retrieve the active entry.
   *
   * @return the active entry, or undefined if currently no entry is active
   */
  getActiveEntry (): GameLogEntry | undefined
  {
    return this.activeIndex < 0 ? undefined : this.entries[this.activeIndex];
  }

  /**
   * Add a new entry to this playlist.
   *
   * @param title the title of the new entry
   * @param resource the game log resource url or file
   * @returns true, if a new entry was created, false otherwise
   */
  addEntry (title: string, resource: string | File): boolean
  {
    // Check if entry for the given resource already exists
    for (let i = 0; i < this.entries.length; i++) {
      if (this.entries[i].resource === resource) {
        return false;
      }
    }

    // TODO: Think about enforcing a hard upper limit of allowed entries, as we do not have any influence on the loaded playlist definition

    // Add new resource entry
    this.entries.push(new GameLogEntry(title, resource));


    // Publish change event
    this.dispatchEvent('change', {
      oldValue: undefined,
      newValue: this.entries[-1],
      index: this.entries.length - 1
    });

    return true;
  }

  /**
   * Add the given list of game log files as entries to this playlist.
   *
   * @param files a list of files to add
   */
  addFiles (files: File[] | FileList)
  {
    for (let i = 0; i < files.length; i++) {
      this.addEntry(files[i].name, files[i]);
    }
  }

  /**
   * Mark the entry at the given index as invalid.
   * Invalid entries can occur during processing of the entry resource.
   *
   * @param msg the error message
   */
  markAsInvalid (msg: string)
  {
    if (this.activeIndex < 0) {
      return;
    }

    const entry = this.entries[this.activeIndex];

    if (!!entry && !entry.errorMsg) {
      entry.errorMsg = msg;

      // Publish update event
      this.dispatchEvent('update', {
        entry: entry,
        index: this.activeIndex
      });
    }
  }



  // ============================== PLAYLIST CONTROL FUNCTIONS ==============================
  /**
   * Try to select the next element in the playlist.
   *
   * @param idx the index to select
   * @param ascending the direction to proceed if the specified index is invalidß
   */
  setActiveIndex (idx: number, ascending: boolean = true): void
  {
    // Check is the new index is actually new and within the range of the entries list
    if (this.activeIndex === idx || idx < 0 || idx >= this.entries.length) {
      return;
    }

    // Check if entry is valid
    if (!this.entries[idx].errorMsg) {
      const oldIndex = this.activeIndex;
      this.activeIndex = idx;

      // Publish active change event
      this.dispatchEvent('active-change', {
        oldValue: oldIndex,
        newValue: this.activeIndex
      });
    } else {
      // Try forward to the previous/next entry...
      this.setActiveIndex(idx + (ascending ? 1 : -1));
    }
  }

  /**
   * Try to select the next element in the playlist.
   */
  nextEntry (): void
  {
    this.setActiveIndex(this.activeIndex + 1, true);
  }

  /**
   * Try to select the previous element in the playlist.
   */
  previousEntry (): void
  {
    this.setActiveIndex(this.activeIndex - 1, false);
  }



  // ============================== STATIC PARSING FUNCTION ==============================
  /**
   * Create a new playlist based on a playlist JSON string.
   *
   * @param jsonString the source json string
   * @returns the new playlist
   */
  static fromJSONString (jsonString: string): Playlist | undefined
  {
    let list = undefined;

    try {
      const source = JSON.parse(jsonString);

      if (source['type'] === 'playlist') {
        list = new Playlist(source['title'] !== undefined ? source['title'] : 'My Playlist');
        const logs = source['gamelogs'];

        for (let i = 0; i < logs.length; i++) {
          if (logs[i]['title'] && logs[i]['url']) {
            list.addEntry(logs[i]['title'], logs[i]['url']);
          } else {
            console.log('Invalid playlist entry format.');
          }
        }
      } else {
        console.log('Invalid playlist format.');
      }
    } catch (ex) {
      console.log('ERROR: Parsing playlist json failed!');
    }

    return list;
  }
}

export { GameLogEntry, Playlist };
