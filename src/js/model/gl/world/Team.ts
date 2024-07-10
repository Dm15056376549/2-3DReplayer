import { Agent } from './Agent';
import { TeamDescription } from '../../game/TeamDescription';
import { AgentState } from '../../game/AgentState';
import { TeamSide } from '../../game/utils/GameUtil';
import { Color, Object3D } from 'three';

/**
 * The Team class definition.
 *
 * @author Stefan Glaser
 */
class Team
{
  /** The team description */
  description: TeamDescription;

  /** The team object group. */
  objGroup: Object3D;

  /** The (dynamic) team color. */
  color: Color;

  /** The agents belonging to this team */
  agents: Agent[];

  /**
   * Team Constructor
   *
   * @param description
   * @param agents
   */
  constructor (description: TeamDescription, agents: Agent[] = [])
  {
    this.description = description;

    this.objGroup = new Object3D();
    this.objGroup.name = description.side === TeamSide.LEFT ? 'leftTeam' : 'rightTeam';

    this.color = description.color;
    this.agents = agents;

    // Add all initial agents
    let i = this.agents.length;
    while (i--) {
      this.objGroup.add(this.agents[i].objGroup);
    }
  }

  /**
   * Set this team's description.
   *
   * @param description
   */
  set (description: TeamDescription): void
  {
    this.description = description;
    this.color = description.color;
    this.agents = [];

    // Remove all child objects from team group
    let child = this.objGroup.children[0];
    while (child) {
      this.objGroup.remove(child);

      child = this.objGroup.children[0];
    }
  }

  /**
   * Update all agent objects of this team.
   *
   * @param states the current Agent states
   * @param nextStates the next Agent states
   * @param t the interpolation time
   */
  update (states: Array<AgentState | undefined>, nextStates: Array<AgentState | undefined>, t: number): void
  {
    let i = this.agents.length;

    while (i--) {
      const no = this.agents[i].description.playerNo;

      this.agents[i].update(states[no], nextStates[no], t);
    }
  }

  /**
   * (Re)Set team color of all agents in this team.
   *
   * @param color the new team color (if undefined, the default team color from the description is used)
   */
  setColor (color: Color = this.description.color)
  {
    if (!this.color.equals(color)) {
      this.color = color;

      let i = this.agents.length;

      while (i--) {
        this.agents[i].setTeamColor(this.color);
      }
    }
  }
}

export { Team };
