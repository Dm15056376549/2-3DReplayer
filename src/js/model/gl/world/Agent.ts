import { MovableObject } from './MovableObject';
import { RobotModel } from './RobotModel';
import { AgentDescription } from '../../game/AgentDescription';
import { AgentState } from '../../game/AgentState';
import { Color } from 'three';

/**
 * The Agent class definition.
 *
 * @author Stefan Glaser
 */
class Agent extends MovableObject
{
  /** The agent description. */
  description: AgentDescription;

  /** The list of robot models */
  models: RobotModel[];

  /**
   * Agent Constructor
   *
   * @param description the agent description
   */
  constructor (description: AgentDescription)
  {
    super('agent_' + description.getSideLetter() + description.playerNo);

    this.description = description;
    this.models = [];
  }

  /**
   * Update this agent's state.
   *
   * @param  {!AgentState=} state the current state
   * @param  {!AgentState=} nextState the next state
   * @param  {number=} t the interpolation step
   */
  update (state: AgentState | undefined, nextState: AgentState | undefined, t: number | undefined): void
  {
    if (state === undefined || state.isValid() === false) {
      // Invalid data, thus kill agent
      this.objGroup.visible = false;
      return;
    } else if (this.objGroup.visible === false) {
      // Valid data, thus revive agent
      this.objGroup.visible = true;
    }

    // Update position and rotation of agent root object group
    this.updateBodyPose(state, nextState, t);

    // Activate agent model to current state
    this.setActiveModel(state.modelIndex);

    if (this.models[state.modelIndex] !== undefined) {
      const nextAngles = nextState !== undefined ? nextState.jointAngles : undefined;
      const nextData = nextState !== undefined ? nextState.data : undefined;

      this.models[state.modelIndex].update(state.jointAngles, state.data, nextAngles, nextData, t);
    }
  }

  /**
   * Set the active robot model to the current state
   * @param modelIdx the index of the model
   */
  setActiveModel (modelIdx: number): void
  {
    if (this.models[modelIdx] !== undefined && !this.models[modelIdx].isActive()) {
      let i = this.models.length;

      while (i--) {
        this.models[i].setActive(i === modelIdx);
      }
    }
  }

  /**
   * Set agent team color
   *
   * @param color the new team color
   */
  setTeamColor (color: Color): void
  {
    let i = this.models.length;

    while (i--) {
      this.models[i].setTeamColor(color);
    }
  }
}

export { Agent };
