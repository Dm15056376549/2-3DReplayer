import { EventDispatcher, GChangeEvent, GErrorEvent, GEventObject, GProgressEvent } from '../../utils/EventDispatcher';
import { SimulationLog } from '../game/SimulationLog';
import { WorldState } from '../game/WorldState';
import { NewSimulationLogEvent } from '../game/loader/SimulationProvider';
import { SimulationLogLoader } from '../game/loader/SimulationLogLoader';
import { MonitorConfiguration } from '../settings/MonitorConfiguration';
import { Playlist } from './Playlist';
import { PlaylistLoadedEvent, PlaylistLoader, PlaylistLoaderEvents } from './PlaylistLoader';
import { World } from '../gl/world/World';


/** The log player event map interface. */
export interface LogPlayerEventMap {
  'state-change': GChangeEvent<LogPlayerStates>;
  'time-change': GChangeEvent<number>;
  'game-log-change': GChangeEvent<SimulationLog | undefined>;
  'game-log-updated': GEventObject;
  'playlist-change': GChangeEvent<Playlist | undefined>;
}

/**
 * The game log player states enum.
 */
export const enum LogPlayerStates {
  EMPTY = 0,
  PAUSE = 1,
  PLAY = 2,
  WAITING = 3,
  END = 4
}

/**
 * The LogPlayer class definition.
 *
 * The LogPlayer is the central class representing the player logic, etc.
 *
 * @author Stefan Glaser
 */
class LogPlayer extends EventDispatcher<LogPlayerEventMap>
{
  /** The simulation log loader instance. */
  gameLogLoader: SimulationLogLoader;

  /** The playlist loader instance. */
  playlistLoader: PlaylistLoader;

  /** The GL world instance. */
  world: World;

  /** The monitor configuration instance. */
  monitorConfig: MonitorConfiguration;

  /** The game log instance. */
  gameLog?: SimulationLog;

  /** The game log playlist instance. */
  playlist?: Playlist;

  /** The index of the currently played entry in the playlist. */
  playlistIndex: number;

  /** The player state. */
  state: LogPlayerStates;

  /** The playback speed. */
  playSpeed: number;

  /** The current play time. */
  playTime: number;

  /** The index in the game log state array to the current play time. */
  playIndex: number;

  /** The number of goals in the passed. */
  passedGoals: number;

  /** The number of goals in the future. */
  upcomingGoals: number;

  /** Flag if the world scene should be updated although the player is currently not playing. */
  needsUpdate: boolean;

  /**  */
  handleGameLogUpdateListener: (type: string) => any;

  /**
   * LogPlayer Constructor
   *
   * ::implements {IPublisher}
   * ::implements {IEventDispatcher}
   * @param world the GL world instance
   * @param monitorConfig the monitor configuration
   */
  constructor (world: World, monitorConfig: MonitorConfiguration)
  {
    super();

    this.gameLogLoader = new SimulationLogLoader();
    this.playlistLoader = new PlaylistLoader();
    this.world = world;
    this.monitorConfig = monitorConfig;
    this.gameLog = undefined;
    this.playlist = undefined;
    this.playlistIndex = -1;
    this.state = LogPlayerStates.EMPTY;
    this.playSpeed = 1;
    this.playTime = 0;
    this.playIndex = 0;
    this.passedGoals = 0;
    this.upcomingGoals = 0;
    this.needsUpdate = true;


    this.handleGameLogUpdateListener = this.handleGameLogUpdate.bind(this);

    // Add game log loader listers
    this.gameLogLoader.addEventListener('new-sim-log', this.handleNewGameLog, this);
    this.gameLogLoader.addEventListener('error', this.handleGameLogLoadError, this);

    this.playlistLoader.addEventListener('finished', this.handlePlaylistLoadEnd, this);
    this.playlistLoader.addEventListener('error', this.handlePlaylistLoadError, this);
  }

  /**
   * Dispose this player (removes listeners/callbacks from monitor).
   */
  dispose (): void
  {
    this.setGameLog();
    this.setPlaylist();
  }

  /**
   * Try loading the game log file at the specified url.
   *
   * @param url the game log file url
   */
  loadGameLog (url: string): void
  {
    // Clear playlist
    this.setPlaylist();

    this.gameLogLoader.load(url);
  }

  /**
   * Try loading the game log file.
   *
   * @param file the game log file instance
   */
  loadGameLogFile (file: File): void
  {
    // Clear playlist
    this.setPlaylist();

    this.gameLogLoader.loadFile(file);
  }

  /**
   * Try loading the playlist at the specified url.
   *
   * @param url the playlist url
   */
  loadPlaylist (url: string): void
  {
    this.playlistLoader.load(url);
  }

  /**
   * Try loading the playlist file.
   *
   * @param file the playlist file instance
   */
  loadPlaylistFile (file: File): void
  {
    this.playlistLoader.loadFile(file);
  }

  /**
   * Set the current simulation log instance.
   *
   * @param gameLog the new simulation log instance or undefined to clear the present one
   */
  setGameLog (gameLog?: SimulationLog): void
  {
    if (this.gameLog === gameLog) {
      return;
    }

    if (this.gameLog) {
      this.gameLog.removeEventListener('states-changed', this.handleGameLogUpdateListener);
      this.gameLog.removeEventListener('player-changed', this.handleGameLogUpdateListener);
    }

    const oldGameLog = this.gameLog;
    this.gameLog = gameLog;

    if (this.gameLog) {
      // Create new World representation
      this.world.create(this.gameLog.type,
                        this.gameLog.environmentParams,
                        this.gameLog.playerParams,
                        this.gameLog.playerTypes,
                        this.gameLog.leftTeam,
                        this.gameLog.rightTeam);

      if (!this.gameLog.fullyLoaded) {
        this.gameLog.addEventListener('states-changed', this.handleGameLogUpdateListener);
        this.gameLog.addEventListener('player-changed', this.handleGameLogUpdateListener);
      }

      // Reset player state
      this.playTime = 0;
      this.playIndex = 0;
      this.updateGoalCounts();
      this.needsUpdate = true;

      // Update playlist index if playlist exists
      if (this.playlist) {
        this.playlistIndex = this.playlist.activeIndex;
      }

      // Reset player state to playing (in case of autoplaying a playlist), or to pausing
      if (!!this.playlist && this.playlist.autoplay) {
        this.setState(LogPlayerStates.PLAY);
      } else {
        this.setState(LogPlayerStates.PAUSE);
      }
    } else {
      // Reset playlist index
      this.playlistIndex = -1;

      this.setState(LogPlayerStates.EMPTY);
    }

    // Publish change of game log
    this.dispatchEvent('game-log-change', {
      oldValue: oldGameLog,
      newValue: this.gameLog
    });
  }

  /**
   * Set the current playlist instance.
   *
   * @param list the new playlist instance or undefined to clear the present one
   */
  setPlaylist (list?: Playlist): void
  {
    if (this.playlist === list) {
      return;
    }

    if (this.playlist) {
      // Stop listening to the old playlist instance
      this.playlist.removeEventListener('active-change', this.handlePlaylistIndexChange, this);
    }

    const oldPlaylist = this.playlist;
    this.playlist = list;

    // Clear current game log instance, reset playlist index and switch player state to EMPTY
    this.setGameLog();

    // Publish change of playlist
    this.dispatchEvent('playlist-change', {
      oldValue: oldPlaylist,
      newValue: this.playlist
    });

    if (this.playlist) {
      this.playlist.addEventListener('active-change', this.handlePlaylistIndexChange, this);

      // Try to play the first playlist entry
      this.playlist.nextEntry();
    }
  }

  /**
   * Set the player state.
   *
   * @param newState the new player state
   */
  setState (newState: LogPlayerStates): void
  {
    if (this.state === newState) {
      return;
    }

    const oldState = this.state;
    // console.log('LogPlayer state changed from ' + oldState + ' to ' + newState);

    this.state = newState;

    // Every time we change the state, we should at least render once afterwards
    this.needsUpdate = true;

    // Publish state change event
    this.dispatchEvent('state-change', {
      oldValue: oldState,
      newValue: newState
    });

    // If we reached the end of a game log, check the playlist for autoplaying
    if (this.state === LogPlayerStates.END &&
        !!this.playlist &&
        this.playlist.autoplay) {
      // Try to play the next playlist entry
      this.playlist.setActiveIndex(this.playlistIndex + 1);
    }
  }

  /**
   * Set the play time of the player.
   *
   * @param newTime the new play time
   */
  setPlayTime (newTime: number): void
  {
    if (newTime < 0) {
      newTime = 0;
      this.setState(LogPlayerStates.PAUSE);
    } else if (newTime > this.gameLog.duration) {
      newTime = this.gameLog.duration + 0.000005;

      this.setState(this.gameLog.fullyLoaded ? LogPlayerStates.END : LogPlayerStates.WAITING);
    } else if (this.state === LogPlayerStates.END) {
      this.setState(LogPlayerStates.PAUSE);
    } else if (this.state === LogPlayerStates.WAITING) {
      this.setState(LogPlayerStates.PLAY);
    }

    if (this.playTime === newTime) {
      return;
    }

    const oldTime = this.playTime;
    this.playTime = newTime;

    this.playIndex = this.gameLog.getIndexForTime(newTime);
    this.updateGoalCounts();
    this.needsUpdate = true;

    this.dispatchEvent('time-change', {
      oldValue: oldTime,
      newValue: newTime
    });
  }

  /**
   * Update the upcoming and passed goal counts.
   */
  updateGoalCounts (): void
  {
    const idx = this.gameLog.gameScoreList.indexOf(this.gameLog.states[this.playIndex].score);
    this.upcomingGoals = 0;
    this.passedGoals = 0;

    for (let i = 1; i < this.gameLog.gameScoreList.length; i++) {
      if (i <= idx) {
        this.passedGoals++;
      } else {
        this.upcomingGoals++;
      }
    }
  }

  /**
   * Retrieve the world state to the current play time.
   *
   * @returns the current world state
   */
  getCurrentWorldState (): WorldState | undefined
  {
    return this.gameLog.states[this.playIndex];
  }

  /**
   * Progress play time.
   *
   * @param deltaT the time delta to add to the current time
   */
  progressPlayTime (deltaT: number): void
  {
    this.setPlayTime(this.playTime + deltaT * this.playSpeed);
  }



  // ============================== EVENT LISTENER FUNCTIONS ==============================
  /**
   * Player update function. This is the central method to progress the player state (its play time) and to update the current world representation.
   * Call this method cyclically within your render cycle.
   *
   * @param deltaT the time since the last render call
   */
  update (deltaT: number): void
  {
    // Check for valid game log
    if (!this.gameLog) {
      return;
    }

    // Progress play time if player is in playing state and the time since the last render call is below 0.5 seconds.
    if (this.state === LogPlayerStates.PLAY && deltaT < 0.5) {
      this.progressPlayTime(deltaT);
    }

    if (this.state === LogPlayerStates.PLAY || this.needsUpdate) {
      this.needsUpdate = false;

      // Update world
      let idx = this.playIndex;
      let t = 0;

      if (this.monitorConfig.interpolateStates) {
        t = ((this.gameLog.startTime + this.playTime) - this.gameLog.states[idx].time) * this.gameLog.frequency;
      }

      if (idx + 1 >= this.gameLog.states.length) {
        // Final state
        --idx;
        t = 1;
      }

      this.world.update(this.gameLog.states[idx], this.gameLog.states[idx + 1], t);
    }
  }

  /**
   * GameLog->"update" event handler.
   * This event handler is triggered when the game log data has beed updated.
   */
  handleGameLogUpdate (): void
  {
    this.world.updateTeams(this.gameLog.type);
    this.updateGoalCounts();

    this.dispatchEvent('game-log-updated', {});

    if (this.state === LogPlayerStates.WAITING) {
      this.setState(LogPlayerStates.PLAY);
    }
  }

  /**
   * GameLogLoader->"new-sim-log" event handler.
   * This event handler is triggered when a new simulation log instance is available.
   *
   * @param event the event
   */
  handleNewGameLog (evt: NewSimulationLogEvent): void
  {
    this.setGameLog(evt.simulationLog);
  }

  /**
   * GameLogLoder->"error" event handler.
   * This event handler is triggered when the game log loader finished loading a resource with an error.
   *
   * @param event the event
   */
  handleGameLogLoadError (evt: GErrorEvent): void
  {
    if (this.playlist) {
      // Mark active playlist entry as invalid
      this.playlist.markAsInvalid(evt.msg);

      // Try forward to the next entry
        this.playlist.nextEntry();
    } else {
      // If there exists a playlist, the loading error will be indicated within the corresponding playlist entry.
      // So only alert loading errors if no playlist is present.
      alert('Loading game log failed: ' + evt.msg);
    }
  }

  /**
   * PlaylistLoder->"finished" event handler.
   * This event handler is triggered when the playlist loader finished loading a resource.
   *
   * @param event the event
   */
  handlePlaylistLoadEnd (evt: PlaylistLoadedEvent): void
  {
    this.setPlaylist(evt.playlist);
  }

  /**
   * PlaylistLoder->"error" event handler.
   * This event handler is triggered when the playlist loader encountered an error while loading a resource.
   *
   * @param event the event
   */
  handlePlaylistLoadError (evt: GErrorEvent): void
  {
    alert(evt.msg);
  }

  /**
   * Playlist->"active-change" event handler.
   * This event handler is triggered when the active index within the playlist has changed.
   *
   * @param event the event
   */
  handlePlaylistIndexChange (evt: GChangeEvent<number>): void
  {
    const entry = this.playlist.getActiveEntry();

    if (!!entry && !entry.errorMsg) {
      if (entry.resource instanceof File) {
        this.gameLogLoader.loadFile(entry.resource);
      } else {
        this.gameLogLoader.load(entry.resource as string);
      }
    }
  }



  // ============================== PLAYER CONTROL FUNCTIONS ==============================
  /**
   * The play/pause command.
   */
  playPause (): void
  {
    if (!this.gameLog) {
      return;
    }

    if (this.state === LogPlayerStates.PLAY || this.state == LogPlayerStates.WAITING) {
      this.setState(LogPlayerStates.PAUSE);
    } else if (this.state === LogPlayerStates.PAUSE) {
      this.setState(LogPlayerStates.PLAY);
    } else if (this.state === LogPlayerStates.END) {
      this.setPlayTime(0);
      this.setState(LogPlayerStates.PLAY);
    }
  }

  /**
   * The step (forward/backward) command.
   *
   * @param backwards
   */
  step (backwards: boolean = false): void
  {
    if (!this.gameLog) {
      return;
    }

    if (this.state === LogPlayerStates.PAUSE || this.state === LogPlayerStates.END) {
      // Step one state forward/backward
      this.jump(this.playIndex + (backwards ? -1 : 1));
    } else {
      // Step two seconds forward/backward
      this.progressPlayTime(backwards ? -2 : 2);
    }
  }

  /**
   * The play/pause command.
   *
   * @param idx
   */
  jump (idx: number): void
  {
    if (!this.gameLog) {
      return;
    }

    if (idx < 0) {
      this.setPlayTime(0);
    } else if (idx >= this.gameLog.states.length) {
      this.setPlayTime(this.gameLog.duration + 1);
    } else {
      this.setPlayTime(this.gameLog.states[idx].time + 0.0001);
    }
  }

  /**
   * The play/pause command.
   *
   * @param previous
   */
  jumpGoal (previous: boolean = false): void
  {
    if (!this.gameLog) {
      return;
    }

    let time = this.playTime;
    const scoreList = this.gameLog.gameScoreList;

    if (previous) {
      for (let i = scoreList.length - 1; i > 0; --i) {
        if (scoreList[i].time < time) {
          this.setPlayTime(scoreList[i].time - 6);
          return;
        }
      }
    } else {
      time = time + 6;

      for (let i = 1; i < scoreList.length; ++i) {
        if (scoreList[i].time > time) {
          this.setPlayTime(scoreList[i].time - 6);
          return;
        }
      }
    }
  }
}

export { LogPlayer };
