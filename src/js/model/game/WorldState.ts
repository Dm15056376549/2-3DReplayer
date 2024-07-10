import { GameState } from './GameState';
import { GameScore } from './GameScore';
import { ObjectState } from './ObjectState';
import { AgentState } from './AgentState';

/**
 * The WorldState class definition.
 *
 * The WorldState provides information about the state of the game, the ball and all agents on the field.
 *
 * @author Stefan Glaser
 */
class WorldState
{
  /** The global time. */
  time: number;

  /** The game time. */
  gameTime: number;

  /** The state of the game. */
  gameState: GameState;

  /** The game score. */
  score: GameScore;

  /** The state of the ball. */
  ballStateArr: number[] | Float32Array;

  /** The states of all left agents. */
  leftAgentStateArrs: Array<number[] | Float32Array | undefined>;

  /** The states of all right agents. */
  rightAgentStateArrs: Array<number[] | Float32Array | undefined>;

  /**
   * WorldState Constructor
   * Create a new WorldState holding the given information.
   *
   * @param time the global time
   * @param gameTime the game time
   * @param gameState the game state
   * @param score the game score
   * @param ball the ball state
   * @param leftAgents array of agent states for the left team
   * @param rightAgents array of agent states for the right team
   */
  constructor (time: number, gameTime: number, gameState: GameState, score: GameScore, ball: number[] | Float32Array, leftAgents: Array<number[] | Float32Array | undefined>, rightAgents: Array<number[] | Float32Array | undefined>)
  {
    this.time = time;
    this.gameTime = gameTime;
    this.gameState = gameState;
    this.score = score;
    this.ballStateArr = ball;
    this.leftAgentStateArrs = leftAgents;
    this.rightAgentStateArrs = rightAgents;
  }

  /**
   * Retrieve the ball state.
   * @returns the ball state object
   */
  get ballState (): ObjectState
  {
    return new ObjectState(this.ballStateArr);
  }

  /**
   * Retrieve the list of left agent states.
   * @returns the list of left agent state objects
   */
  get leftAgentStates (): Array<AgentState | undefined>
  {
    return WorldState.wrapAgentStatesArray(this.leftAgentStateArrs);
  }

  /**
   * Retrieve the list of right agent states.
   * @returns the list of right agent state objects
   */
  get rightAgentStates (): Array<AgentState | undefined>
  {
    return WorldState.wrapAgentStatesArray(this.rightAgentStateArrs);
  }

  /**
   * Wrap agent state arrays in actual agent state objects.
   * 
   * @param statesArr the array of states to wrap
   * @returns a new array with agent state objects wrapping the agent state arrays
   */
  static wrapAgentStatesArray (statesArr: Array<number[] | Float32Array | undefined>): Array<AgentState | undefined>
  {
    return statesArr.map(stateArr => stateArr !== undefined ? new AgentState(stateArr) : undefined);
  }

  /**
   * Extract the list of underlying agent state information arrays.
   * 
   * @param agentStates the array of agent state objects to unwrap
   * @returns a new array containing the underlying agent state information arrays
   */
  static unwrapAgentStatesArray (agentStates: Array<AgentState | undefined>): Array<number[] | Float32Array | undefined>
  {
    return agentStates.map(agentState => agentState !== undefined ? agentState.state : undefined);
  }
}

export { WorldState };