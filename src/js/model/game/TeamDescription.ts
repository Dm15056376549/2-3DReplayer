import { AgentDescription } from './AgentDescription';
import { ParameterMap } from './utils/ParameterMap';
import { TeamSide, GameUtil } from './utils/GameUtil';
import { Color } from 'three';
import { EventDispatcher, GChangeEvent, GEventObject } from '../../utils/EventDispatcher';


/** The team description event map interface. */
export interface TeamDescriptionEventMap {
  'name': GChangeEvent<string>;
  'color': GChangeEvent<Color>;
  'agents': GEventObject;
}


/**
 * The TeamDescription class definition.
 *
 * The TeamDescription provides information about a team.
 *
 * @author Stefan Glaser
 */
class TeamDescription extends EventDispatcher<TeamDescriptionEventMap>
{
  /** The team side (see TeamSide) */
  readonly side: TeamSide;

  /** The name of the team. */
  private _name: string;

  /** The team color. */
  private _color: Color;

  /** The list of agents playing for this team. */
  private _agents: AgentDescription[];

  /**
   * TeamDescription Constructor
   * Create a new TeamDescription with the given parameters.
   *
   * @param name the name of the team
   * @param color the team color
   * @param side the team side (see TeamSide)
   */
  constructor (name: string, color: Color, side: TeamSide)
  {
    super();

    this.side = side;
    this._name = name;
    this._color = color;
    this._agents = [];
  }

  /**
   * Set the name of this team.
   *
   * @param newName the new name of the team
   */
  set name (newName: string)
  {
    newName = newName.split('_').join(' ');

    if (this._name !== newName) {
      const prevName = this._name;
      this._name = newName;

      // Publish name change event
      this.dispatchEvent('name', {
        oldValue: prevName,
        newValue: this._name
      });
    }
  }

  /**
   * Retrieve the name of this team.
   * @returns the team name
   */
  get name (): string
  {
    return this._name;
  }

  /**
   * Set the color of this team.
   *
   * @param color the new color of the team
   * @returns true, if the color was updated, false otherwise
   */
  set color (color: Color)
  {
    if (!this._color.equals(color)) {
      const prevColor = this._color;
      this._color = color;

      // Publish color change event
      this.dispatchEvent('color', {
        oldValue: prevColor,
        newValue: this.color
      });
    }
  }

  /**
   * Retrieve the color of the team.
   * @returns the team color
   */
  get color (): Color
  {
    return this._color;
  }

  /**
   * Retrieve the list of agent discriptions representing this team.
   * @returns the agent descriptions respesenting this team
   */
  get agents (): AgentDescription[]
  {
    return this._agents;
  }

  /**
   * Add an agent description for the given player number and robot model.
   * If there doesn't exist an agent description to the given player number,
   * this method will create a new agent description with the given player number and robot model.
   * If there already exists an agent description with the given player number,
   * this method will add the given robot model to the agent description if it is not yet present.
   *
   * @param number the agent player number
   * @param playerType the player type
   * @returns false if nothing was modified, true otherwise
   */
  addAgent (number: number, playerType: ParameterMap): boolean
  {
    let i = this._agents.length;

    // Check if there already exists a agent description with the given number
    while (i--) {
      if (this._agents[i].playerNo === number) {
        // Add the given player type to the agent
        if (this._agents[i].addPlayerType(playerType)) {
          // Publish agents change event
          this.dispatchEvent('agents', {});
          return true;
        } else {
          return false;
        }
      }
    }

    // If no agent definition was found for the given player number, create a new one
    this._agents.push(new AgentDescription(number, this.side, playerType));

    // Publish agents change event
    this.dispatchEvent('agents', {});

    return true;
  }

  /**
   * Retrieve the index of the last used player type specification of the agent with the given player number.
   *
   * @param  playerNo the player number of the agent of interest
   * @returns the index of the last used player type specification
   */
  getRecentTypeIdx (playerNo: number): number
  {
    let i = this.agents.length;

    // Retrieve the requested index from the agent description if existing
    while (i--) {
      if (this.agents[i].playerNo === playerNo) {
        return this.agents[i].recentTypeIdx;
      }
    }

    // return zero by default, if no corresponding agent description was found
    return 0;
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

export { TeamDescription };
