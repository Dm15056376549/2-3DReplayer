import { GameScore } from '../GameScore';
import { GameState } from '../GameState';
import { AgentState } from '../AgentState';
import { ObjectState } from '../ObjectState';
import { WorldState } from '../WorldState';

/**
 * The PartialWorldState class definition.
 *
 * The PartialWorldState provides information about the state of the game, the ball and all agents on the field.
 *
 * @author Stefan Glaser
 */
class PartialWorldState
{
  /** The global time. */
  time: number;

  /** The global time step. */
  timeStep: number;

  /** The game time. */
  gameTime: number;

  /** The state of the game. */
  gameState: GameState;

  /** The left team score. */
  score: GameScore;

  /** The state of the ball. */
  ballState: ObjectState;

  /** The states of all left agents. */
  leftAgentStates: Array<AgentState | undefined>;

  /** The states of all right agents. */
  rightAgentStates: Array<AgentState | undefined>;

  /**
   * PartialWorldState Constructor
   * Create a new PartialWorldState holding the given information.
   *
   * @param time the global time
   * @param timeStep the global time step
   * @param gameTime the game time
   */
  constructor (time: number, timeStep: number, gameTime: number)
  {
    this.time = time;
    this.timeStep = timeStep;
    this.gameTime = gameTime;
    this.gameState = new GameState(time, 'unknown');
    this.score = new GameScore(time, 0, 0);
    this.ballState = new ObjectState();
    this.leftAgentStates = [];
    this.rightAgentStates = [];
  }

  /**
   * Reinitialize the gameTime attribute.
   *
   * @param gameTime the game time
   */
  setGameTime (gameTime: number): void
  {
    this.gameTime = Math.round(gameTime * 1000) / 1000;
  }

  /**
   * Reinitialize the gameState and gameTime attributes.
   *
   * @param playMode the play mode string (will create a copy if needed)
   */
  setPlaymode (playMode: string): void
  {
    if (this.gameState.playMode !== playMode) {
      this.gameState = new GameState(this.time, playMode);
    }
  }

  /**
   * Reinitialize the gameScore and gameTime attributes.
   *
   * @param goalsLeft the left team score
   * @param goalsRight the right team score
   * @param penScoreLeft the left team penalty score
   * @param penMissLeft the left team penalty misses
   * @param penScoreRight the right team penalty score
   * @param penMissRight the right team penalty misses
   */
  setScore (goalsLeft: number, goalsRight: number, penScoreLeft: number = 0, penMissLeft: number = 0, penScoreRight: number = 0, penMissRight: number = 0): void
  {
    if (this.score.goalsLeft !== goalsLeft ||
        this.score.goalsRight !== goalsRight ||
        this.score.penaltyScoreLeft !== penScoreLeft ||
        this.score.penaltyMissLeft !== penMissLeft ||
        this.score.penaltyScoreRight !== penScoreRight ||
        this.score.penaltyMissRight !== penMissRight) {
      this.score = new GameScore(this.time, goalsLeft, goalsRight, penScoreLeft, penMissLeft, penScoreRight, penMissRight);
    }
  }

  /**
   * Create a new world state instance from this partial world state and append it to the list.
   * A new world state is only created if more then one agent state is present.
   *
   * @param states the world state list
   * @returns true, if a new world state was appended, false otherwise
   */
  appendTo (states: WorldState[]): boolean
  {
    if (this.leftAgentStates.length + this.rightAgentStates.length > 0) {
      states.push(new WorldState(
          this.time,
          this.gameTime,
          this.gameState,
          this.score,
          this.ballState.state,
          WorldState.unwrapAgentStatesArray(this.leftAgentStates),
          WorldState.unwrapAgentStatesArray(this.rightAgentStates))
        );

      // Progress time
      this.time = Math.round((this.time + this.timeStep) * 1000) / 1000;

      // Reset agent states
      this.leftAgentStates = [];
      this.rightAgentStates = [];

      return true;
    }

    return false;
  }
}

export { PartialWorldState };
