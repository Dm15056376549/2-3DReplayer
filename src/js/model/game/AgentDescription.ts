import { ParameterMap } from './utils/ParameterMap';
import { TeamSide, GameUtil } from './utils/GameUtil';

/**
 * The AgentDescription class definition.
 *
 * The AgentDescription provides information about the robot model and player number of an agent.
 *
 * @author Stefan Glaser
 */
class AgentDescription
{
  /** The player number of the agent. */
  readonly playerNo: number;

  /** The agent's team side. */
  readonly side: TeamSide;

  /** A list of player type indices, used by this agent. */
  playerTypes: ParameterMap[];

  /** The index of the last used player type of this agent. */
  recentTypeIdx: number;

  /**
   * AgentDescription Constructor
   * Create a new AgentDescription.
   *
   * @param number the player number of this agent
   * @param side the team side
   * @param playerType the initial player type specification of this agent
   */
  constructor (number: number, side: TeamSide, playerType: ParameterMap)
  {
    this.playerNo = number;
    this.side = side;
    this.playerTypes = [playerType];
    this.recentTypeIdx = 0;
  }

  /**
   * Check if this agent is the goal keeper.
   * @returns true if this agent is the goal keeper, false otherwise
   */
  isGoalie (): boolean
  {
    return this.playerNo == 1;
  }

  /**
   * Add the given player type specification to the list of player types if not yet present.
   *
   * @param playerType the player type specification to add
   * @returns false if nothing was modified, true otherwise
   */
  addPlayerType (playerType: ParameterMap): boolean
  {
    const idx = this.playerTypes.indexOf(playerType);

    // Add player type to player type list if not yet present
    if (idx === -1) {
      this.playerTypes.push(playerType);
      this.recentTypeIdx = this.playerTypes.length - 1;
      return true;
    } else {
      this.recentTypeIdx = idx;
      return false;
    }
  }

  /**
   * Retrieve a letter representing the side.
   *
   * @param uppercase true for upper case letter, false for lower case
   * @returns 'l'/'L' for left side, 'r'/'R' for right side and 'n'/'N' for neutral
   */
  getSideLetter (uppercase: boolean = false): string
  {
    return GameUtil.getSideLetter(this.side, uppercase);
  }
}

export { AgentDescription };