import { Quaternion, Vector3 } from 'three';

/**
 * Indices in the object state array.
 */
enum OSIndices {
  X_POS = 0,
  Y_POS = 1,
  Z_POS = 2,
  X_QUAT = 3,
  Y_QUAT = 4,
  Z_QUAT = 5,
  W_QUAT = 6
}


interface ObjectStateParams
{
  x: number,
  y: number,
  z: number,
  qx: number,
  qy: number,
  qz: number,
  qw: number
}



/**
 * The ObjectState class definition.
 *
 * This basic ObjectState provides information about the object's position and orientation at a specific point in time.
 *
 * @author Stefan Glaser
 */
class ObjectState
{
  /** The generic state array of the object. */
  state: number[] | Float32Array;

  /**
   * ObjectState Constructor
   * Create a new ObjectState with the given state information.
   *
   * @param params the object state information vector
   */
  constructor (params: number[] | Float32Array | ObjectStateParams | undefined = undefined)
  {
    this.state = [];

    // Initialize unit quaternion if no state information was passed
    if (params === undefined) {
      this.state = ObjectState.encodeObjectState(0, 0, 0, 0, 0, 0, 1);
    } else if (params instanceof Float32Array || params instanceof Array) {
      this.state = params;
    } else {
      this.state = ObjectState.encodeObjectState(params.x, params.y, params.z, params.qx, params.qy, params.qz, params.qw);
    }
  }

  /**
   * Retrieve the x position of the object.
   * @returns the x-position
   */
  get x (): number
  {
    return this.state[OSIndices.X_POS] || 0;
  }

  /**
   * Set the x position of the object.
   * @param x the new x position value
   */
  set x (x: number)
  {
    this.state[OSIndices.X_POS] = x;
  }

  /**
   * Retrieve the y position of the object.
   * @returns the y-position
   */
  get y (): number
  {
    return this.state[OSIndices.Y_POS] || 0;
  }

  /**
   * Set the y position of the object.
   * @param y the new y position value
   */
  set y (y: number)
  {
    this.state[OSIndices.Y_POS] = y;
  }

  /**
   * Retrieve the z position of the object.
   * @returns the z-position
   */
  get z (): number
  {
    return this.state[OSIndices.Z_POS] || 0;
  }

  /**
   * Set the z position of the object.
   * @param z the new z position value
   */
  set z (z: number)
  {
    this.state[OSIndices.Z_POS] = z;
  }

  /**
   * Retrieve the the x-term of the orientation quaternion vector of the object.
   * @returns the x-term of the quaternion vector
   */
  get qx (): number
  {
    return this.state[OSIndices.X_QUAT] || 0;
  }

  /**
   * Set the the x-term of the orientation quaternion vector of the object.
   * @param qx the x-term of the quaternion vector
   */
  set qx (qx: number)
  {
    this.state[OSIndices.X_QUAT] = qx;
  }

  /**
   * Retrieve the the y-term of the orientation quaternion vector of the object.
   * @returns the y-term of the quaternion vector
   */
  get qy (): number
  {
    return this.state[OSIndices.Y_QUAT] || 0;
  }

  /**
   * Set the the y-term of the orientation quaternion vector of the object.
   * @param qy the y-term of the quaternion vector
   */
  set qy (qy: number)
  {
    this.state[OSIndices.Y_QUAT] = qy;
  }

  /**
   * Retrieve the the z-term of the orientation quaternion vector of the object.
   * @returns the z-term of the quaternion vector
   */
  get qz (): number
  {
    return this.state[OSIndices.Z_QUAT] || 0;
  }

  /**
   * Set the the z-term of the orientation quaternion vector of the object.
   * @param qz the z-term of the quaternion vector
   */
  set qz (qz: number)
  {
    this.state[OSIndices.Z_QUAT] = qz;
  }

  /**
   * Retrieve the the scalar term of the orientation quaternion of the object.
   * @returns the scalar term of the quaternion
   */
  get qw (): number
  {
    return this.state[OSIndices.W_QUAT] !== undefined ? this.state[OSIndices.W_QUAT] : 1;
  }

  /**
   * Set the the scalar term of the orientation quaternion of the object.
   * @param qw the scalar term of the quaternion
   */
  set qw (qw: number)
  {
    this.state[OSIndices.W_QUAT] = qw;
  }

  /**
   * Retrieve the position of the object.
   * @returns the position vector
   */
  get position (): Vector3
  {
    const stateInfo = this.state;
    return new Vector3(stateInfo[OSIndices.X_POS] || 0, stateInfo[OSIndices.Y_POS] || 0, stateInfo[OSIndices.Z_POS] || 0);
  }

  /**
   * Set the position of the object.
   * @param pos the position vector
   */
  set position (pos: Vector3)
  {
    this.state[OSIndices.X_POS] = pos.x;
    this.state[OSIndices.Y_POS] = pos.y;
    this.state[OSIndices.Z_POS] = pos.z;
  }

  /**
   * Retrieve the orientation of the object.
   * @returns the orientation quaternion
   */
  get orientation (): Quaternion
  {
    const stateInfo = this.state;
    return new Quaternion(stateInfo[OSIndices.X_QUAT] || 0, stateInfo[OSIndices.Y_QUAT] || 0, stateInfo[OSIndices.Z_QUAT] || 0, stateInfo[OSIndices.W_QUAT] !== undefined ? stateInfo[OSIndices.W_QUAT] : 1);
  }

  /**
   * Set the orientation of the object.
   * @param rot the orientation quaternion
   */
  set orientation (rot: Quaternion)
  {
    this.state[OSIndices.X_QUAT] = rot.x;
    this.state[OSIndices.Y_QUAT] = rot.y;
    this.state[OSIndices.Z_QUAT] = rot.z;
    this.state[OSIndices.W_QUAT] = rot.w;
  }

  /**
   * Checks ObjectState for validity.
   * @returns true if the orientation quaternion is well defined, false otherwise
   */
  isValid (): boolean
  {
    const stateInfo = this.state;
    return stateInfo[OSIndices.X_QUAT] !== 0 || stateInfo[OSIndices.Y_QUAT] !== 0 || stateInfo[OSIndices.Z_QUAT] !== 0 || stateInfo[OSIndices.W_QUAT] !== 0;
  }

  /**
   * Encode the given object state information into a more memory friendly array representation.
   * 
   * @param x the x position of the object
   * @param y the y position of the object
   * @param z the z position of the object
   * @param qx the x-term of the quaternion vector
   * @param qy the y-term of the quaternion vector
   * @param qz the z-term of the quaternion vector
   * @param qw the scalar term of the quaternion
   * @param target the target array
   * @returns the array encoded state information
   */
  static encodeObjectState (x: number, y: number, z: number, qx: number, qy: number, qz: number, qw: number, target: number[] | Float32Array | undefined = undefined): number[] | Float32Array
  {
    if (target === undefined) {
      target = new Float32Array(7);
    }

    target[OSIndices.X_POS] = x;
    target[OSIndices.Y_POS] = y;
    target[OSIndices.Z_POS] = z;

    target[OSIndices.X_QUAT] = qx;
    target[OSIndices.Y_QUAT] = qy;
    target[OSIndices.Z_QUAT] = qz;
    target[OSIndices.W_QUAT] = qw;

    return target;
  }
}

export { OSIndices, ObjectStateParams, ObjectState };
