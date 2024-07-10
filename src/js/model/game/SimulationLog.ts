import { GameScore } from './GameScore';
import { GameState } from './GameState';
import { ParameterMap } from './utils/ParameterMap';
import { TeamDescription } from './TeamDescription';
import { WorldState } from './WorldState';
import { SparkUtil, Environment3DParams } from './utils/SparkUtil';
import { SServerUtil, Environment2DParams } from './utils/SServerUtil';
import { SimulationType, TeamSide } from './utils/GameUtil';
import { Color } from 'three';
import { EventDispatcher, GEventObject } from '../../utils/EventDispatcher';


/** The Simulation log event map interface. */
export interface SimulationLogEventMap {
  // /** Notify that the environment parameter have been changed / updated. */
  // 'environment-changed': GEventObject;
  /** Notify that the player parameter have been changed / updated, */
  'player-changed': GEventObject;
  /** Notify that the list of states has been modified (new states added / existing states removed). */
  'states-changed': GEventObject;
};


/**
 * The (Soccer) SimulationLog class definition.
 *
 * The SimulationLog is the central class holding information about a simulation.
 * A SimulationLog may represent a full log / replay file of a recorded simulation, but can also be used to buffer simulation states received by a (live) stream or live monitor connection.
 *
 * @author Stefan Glaser
 */
class SimulationLog extends EventDispatcher<SimulationLogEventMap>
{
  /** The simulation log / replay file or streaming url. */
  ressource: URL | File;

  /** The simulation type (2D or 3D). */
  readonly type: SimulationType;

  /** The state update frequency of the simulation log. */
  frequency: number;

  /** The list of server/simulation environment parameters. */
  environmentParams: ParameterMap;

  /** The list of player parameters. */
  playerParams: ParameterMap;

  /** The list of player type parameters. */
  playerTypes: ParameterMap[];

  /** The description of the left team. */
  readonly leftTeam: TeamDescription;

  /** The description of the right team. */
  readonly rightTeam: TeamDescription;

  /** The list of all world states. */
  readonly states: WorldState[];

  /** The time value of the first state. */
  startTime: number;

  /** The time value of the last state. */
  endTime: number;

  /** The duration of the simulation log. */
  duration: number;

  /** A list of game states over time. */
  readonly gameStateList: GameState[];

  /** A list of game scores over time. */
  readonly gameScoreList: GameScore[];

  /** Indicator if the simulation log is fully loaded. */
  fullyLoaded: boolean;

  /**
   * SimulationLog Constructor
   * Create a new simulation log.
   * 
   * @param ressource the simulation log ressource
   * @param type the simulation type
   */
  constructor (ressource: URL | File, type: SimulationType)
  {
    super();

    this.ressource = ressource;
    this.type = type;
    this.frequency = 1;
    this.environmentParams = new ParameterMap();
    this.playerParams = new ParameterMap();
    this.playerTypes = [];
    this.leftTeam = new TeamDescription('Left Team', new Color(0xffff00), TeamSide.LEFT);
    this.rightTeam = new TeamDescription('Right Team', new Color(0xff0000), TeamSide.RIGHT);
    this.states = [];
    this.startTime = 0;
    this.endTime = 0;
    this.duration = 0;
    this.gameStateList = [];
    this.gameScoreList = [];
    this.fullyLoaded = false;

    // Create defaults
    if (type === SimulationType.TWOD) {
      this.environmentParams = SServerUtil.createDefaultEnvironmentParams();
      this.playerParams = SServerUtil.createDefaultPlayerParams();
      this.playerTypes = SServerUtil.createDefaultPlayerTypeParams();
    } else {
      this.environmentParams = SparkUtil.createDefaultEnvironmentParams();
      this.playerParams = SparkUtil.createDefaultPlayerParams();
      this.playerTypes = SparkUtil.createDefaultPlayerTypeParams();
    }

    this.updateFrequency();
  }

  /**
   * Check if the ressource of this simulation log is a URL.
   * 
   * @returns true, if the ressource is an URL, false otherwise
   */
  isURLRessource (): boolean
  {
    return this.ressource instanceof URL;
  }

  /**
   * Check if the ressource of this simulation log is a file.
   * 
   * @returns true, if the ressource is an file, false otherwise
   */
  isFileRessource (): boolean
  {
    return this.ressource instanceof File;
  }

  /**
   * Update the frequency value from environment parameter list.
   */
  updateFrequency (): void
  {
    let step = undefined;

    if (this.type === SimulationType.TWOD) {
      step = this.environmentParams.getNumber(Environment2DParams.SIMULATOR_STEP);
    } else {
      step = this.environmentParams.getNumber(Environment3DParams.LOG_STEP);
    }

    if (step) {
      this.frequency = 1000 / step;
    }
  }

  /**
   * Fetch the index of the world state that corresponds to the given time.
   *
   * @param time the global time
   * @returns the world state index corresponding to the specified time
   */
  getIndexForTime (time: number): number
  {
    const idx = Math.floor(time * this.frequency);

    if (idx < 0) {
      return 0;
    } else if (idx >= this.states.length) {
      return this.states.length - 1;
    }

    return idx;
  }

  /**
   * Retrieve the world state for the given time.
   *
   * @param time the global time
   * @returns the world state closest to the specified time
   */
  getStateForTime (time: number): WorldState | undefined
  {
    return this.states[this.getIndexForTime(time)];
  }

  /**
   * Called to indicate that the team descriptions of the simulation log were updated.
   */
  onTeamsUpdated (): void
  {
    this.dispatchEvent('player-changed', {});
  }

  /**
   * Called to indicate that the simulation log data was changed/extended.
   */
  onStatesUpdated (): void
  {
    // Update times
    if (this.states.length > 0) {
      this.startTime = this.states[0].time;
      this.endTime = this.states[this.states.length - 1].time;
      this.duration = this.endTime - this.startTime;

      // Extract game states and scores from state array
      this.gameStateList.length = 0;
      this.gameScoreList.length = 0;

      let previousGameState = this.states[0].gameState;
      let previousScore = this.states[0].score;
      this.gameStateList.push(previousGameState);
      this.gameScoreList.push(previousScore);

      for (let i = 1; i < this.states.length; i++) {
        if (previousGameState !== this.states[i].gameState) {
          previousGameState = this.states[i].gameState;
          this.gameStateList.push(previousGameState);
        }

        if (previousScore !== this.states[i].score) {
          previousScore = this.states[i].score;
          this.gameScoreList.push(previousScore);
        }
      }
    }

    this.dispatchEvent('states-changed', {});
  }

  /**
   * Called to indicate that the simulation log file is fully loaded and parsed and no further states, etc. will be appended.
   */
  finalize (): void
  {
    this.fullyLoaded = true;

    // Refresh the simulation log information a last time and publish change to finished
    this.onStatesUpdated();
  }
}

export { SimulationLog };
