import { ObjectState, ObjectStateParams } from './ObjectState';

/**
 * Indices in the agent state array.
 */
const enum ASIndices {
  MODEL_IDX = 7,
  FLAGS = 8,
  DATA_IDX = 9,
  JOINT_ANGLES = 10
}



interface AgentStateParams extends ObjectStateParams
{
  modelIdx: number;
  flags: number;
  jointAngles: number[],
  data: number[]
}



/**
 * The AgentState class definition.
 *
 * The AgentState provides information about the state of an agent at a specific time.
 *
 * @author Stefan Glaser
 */
class AgentState extends ObjectState
{
  /**
   * AgentState Constructor
   * Create a new AgentState for the given state information.
   * 
   * @param params the agent state parameter
   */
  constructor (params: number[] | Float32Array | AgentStateParams | undefined = undefined)
  {
    super((params instanceof Float32Array || params instanceof Array) ? params : []);

    if (params === undefined) {
      this.state = AgentState.encodeAgentState(0, 0, 0, 0, 0, 0, 0, 0, 1, [], []);
    } else if (!(params instanceof Float32Array || params instanceof Array)) {
      this.state = AgentState.encodeAgentState(params.modelIdx, params.flags, params.x, params.y, params.z, params.qx, params.qy, params.qz, params.qw, params.jointAngles, params.data);
    }
  }

  /**
   * Retrieve the index of the currently used robot model.
   * @returns the currently model index
   */
  get modelIndex (): number
  {
    return Math.round(this.state[ASIndices.MODEL_IDX] || 0);
  }

  /**
   * Retrieve the agent flags bitfield.
   * @returns the flags bitfield
   */
  get flags (): number
  {
    return this.state[ASIndices.FLAGS] || 0;
  }

  /**
   * Retreive the joint angles of the robot model.
   * @returns the joint angles
   */
  get jointAngles (): number[] | Float32Array
  {
    return this.state.slice(ASIndices.JOINT_ANGLES, this.state[ASIndices.DATA_IDX]);
  }

  /**
   * Retreive the generic data associated with the agent (stamina, fouls, etc.).
   * @return the generic agent data
   */
  get data (): number[] | Float32Array
  {
    return this.state.slice(this.state[ASIndices.DATA_IDX]);
  }

  /**
   * @override
   * @returns true, if the state information is valid, false otherwise
   */
  isValid (): boolean
  {
    return super.isValid() && this.state.length > ASIndices.DATA_IDX;
  }

  /**
   * Encode the given agent state information into a more memory friendly array representation.
   *
   * @param modelIdx the index of the currently used robot model
   * @param flags the flags bitfield
   * @param x the x position of the object
   * @param y the y position of the object
   * @param z the z position of the object
   * @param qx the x-term of the quaternion vector
   * @param qy the y-term of the quaternion vector
   * @param qz the z-term of the quaternion vector
   * @param qw the scalar term of the quaternion
   * @param jointAngles array holding the joint angles
   * @param data dynamic data associated with the agent (stamina, fouls, etc.)
   * @param target the target array
   * @returns the array encoded state information
   */
  static encodeAgentState (modelIdx: number, flags: number, x: number, y: number, z: number, qx: number, qy: number, qz: number, qw: number, jointAngles: number[], data: number[], target: number[] | Float32Array | undefined = undefined): number[] | Float32Array
  {
    if (target === undefined) {
      target = new Float32Array(7 + 3 + jointAngles.length + data.length);
    }

    ObjectState.encodeObjectState(x, y, z, qx, qy, qz, qw, target);

    const dataIdx = ASIndices.JOINT_ANGLES + jointAngles.length;
    target[ASIndices.MODEL_IDX] = modelIdx;
    target[ASIndices.FLAGS] = flags;
    target[ASIndices.DATA_IDX] = dataIdx;

    for (let i = 0; i < jointAngles.length; i++) {
      target[ASIndices.JOINT_ANGLES + i] = jointAngles[i];
    }

    for (let i = 0; i < data.length; i++) {
      target[dataIdx + i] = data[i];
    }

    return target;
  }
}

export { ASIndices, AgentStateParams, AgentState };
