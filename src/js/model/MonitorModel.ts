import { EventDispatcher, GChangeEvent } from '../utils/EventDispatcher';
import { LogPlayer } from './logplayer/LogPlayer';
import { MonitorSettings } from './settings/MonitorSettings';
import { Playlist } from './logplayer/Playlist';
import { World } from './gl/world/World';
import { FileUtil } from '../utils/FileUtil';

/** The monitor model event map interface. */
export interface MonitorModelEventMap {
  'change': GChangeEvent<MonitorStates>;
}

/**
 * The monitor model state/mode enum.
 */
export const enum MonitorStates {
  INIT = 'init',
  REPLAY = 'replay',
  STREAM = 'stream',
  LIVE = 'live'
}

/**
 * The MonitorModel definition.
 *
 * @author Stefan Glaser
 */
class MonitorModel extends EventDispatcher<MonitorModelEventMap>
{
  /** Indicator if the monitor is started in embedded mode. */
  embedded: boolean;

  /** The current state of the monitor. */
  state: MonitorStates;

  /** The various monitor settings. */
  settings: MonitorSettings;

  /** The GL world instance. */
  world: World;

  /** The game log player instance. */
  logPlayer: LogPlayer;

  /**
   * MonitorModel Constructor
   *
   * ::implements {IPublisher}
   * ::implements {IEventDispatcher}
   * @param embedded indicator if the monitor is in embedded mode
   */
  constructor (embedded: boolean)
  {
    super();

    this.embedded = embedded;
    this.state = MonitorStates.INIT;
    this.settings = new MonitorSettings();
    
    this.world = new World();
    this.world.setShadowsEnabled(this.settings.monitorConfig.shadowsEnabled);
    
    this.logPlayer = new LogPlayer(this.world, this.settings.monitorConfig);

    // Add log player event listeners
    this.logPlayer.addEventListener('game-log-change', this.handleLogPlayerChange, this);
    this.logPlayer.addEventListener('playlist-change', this.handleLogPlayerChange, this);
  }

  /**
   * Set the state of the monitor model.
   *
   * @param newState the new monitor model state
   */
  setState (newState: MonitorStates): void
  {
    if (this.state === newState) {
      // Already in the "new" state, thus nothing to do
      return;
    }

    const oldState = this.state;
    this.state = newState;

    // Publish state change event
    this.dispatchEvent('change', {
      oldValue: oldState,
      newValue: newState
    });
  }

  /**
   * Try to load the game log at the specified url.
   *
   * @param url the game log url
   */
  loadGameLog (url: string): void
  {
    this.logPlayer.loadGameLog(url);
  }

  /**
   * Try to load the playlist at the specified url.
   *
   * @param url the playlist url
   */
  loadPlaylist (url: string): void
  {
    this.logPlayer.loadPlaylist(url);
  }

  /**
   * Try to load the given files.
   *
   * @param files a list of local files to load/open
   */
  loadFiles (files: File[] | FileList): void
  {
    // Check for game log file(s) (.replay, .rpl2d, .rpl3d, .rcg)
    //  -> check for single game log file
    //  -> check for multiple game log files (playlist)
    //
    // Check for json file (.json)
    //  -> check for archive definition
    //  -> check for playlist definition
    const gameLogFiles = FileUtil.filterFiles(files, ['.replay', '.rpl2d', '.rpl3d', '.rcg'], true);
    const jsonFiles = FileUtil.filterFiles(files, ['.json']);

    if (gameLogFiles.length === 1) {
      // Load single game log file
      this.logPlayer.loadGameLogFile(gameLogFiles[0]);
    } else if(gameLogFiles.length > 1) {
      // Create a game log playlist
      const playlist = new Playlist('Local Playlist');
      playlist.addFiles(gameLogFiles);

      this.logPlayer.setPlaylist(playlist);
    } else if (jsonFiles.length > 0) {
      for (let i = 0; i < jsonFiles.length; i++) {
        // Process json-files individually

      }
    } else if (files.length > 0) {
      alert('Unsupported file type(s)!');
    }
  }

  /**
   * Connect to the given streaming server.
   *
   * @param url the replay streaming server url
   */
  connectStream (url: string): void
  {
    throw new Error('MonitorModel::connectStream(): Not implemented yet!');
  }

  /**
   * Connect to a simulation server.
   *
   * @param url the simulation server web-socket url.
   */
  connectSimulator (url: string): void
  {
    throw new Error('MonitorModel::connectSimulator(): Not implemented yet!');
  }

  /**
   * LogPlayer->"game-log-change"|"playlist-change" event listener.
   * This event listener is triggered when the game log or the playlist within the player has changed.
   *
   * @param evt the event object
   */
  handleLogPlayerChange (): void
  {
    // Make sure the monitor is in replay mode
    this.setState(MonitorStates.REPLAY);
  }
}

export { MonitorModel };
