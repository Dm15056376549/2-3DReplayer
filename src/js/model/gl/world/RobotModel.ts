import { Color, Material, Object3D, Vector3 } from 'three';

/**
 * The RobotModel class definition.
 *
 * @author Stefan Glaser
 */
class RobotModel
{
  /** The name of the robot model */
  name: string;

  /** The robot object group */
  objGroup: Object3D;

  /**
   * A list of Object3D objects representing the joints
   * // TODO: Kind of a ugly to append a "jointAxis" attribute to an THREE.Object3D. Think about a more elegant way to do or describe it.
   */
  jointGroups: Array<Object3D & {jointAxis?: Vector3}>;

  /** The list of team materials of this robot model */
  teamMatList: Material[];

  /**
   * RobotModel Constructor
   *
   * @param name the name of the agent model
   */
  constructor (name: string)
  {
    this.name = name;

    this.objGroup = new Object3D();
    this.objGroup.name = name;
    this.objGroup.visible = false;

    this.jointGroups = [];
    this.teamMatList = [];
  }

  /**
   * Check if this robot model is valid
   * @returns true if the robot model is valid, false otherwise
   */
  isValid (): boolean
  {
    return this.objGroup.children.length > 0;
  }

  /**
   * Set visibility of this robot models' objects.
   * @param active true for visible, false for invisible
   */
  setActive (active: boolean): void
  {
    if (this.objGroup.visible !== active) {
      this.objGroup.visible = active;
    }
  }

  /**
   * Check visibility of this robot models' objects.
   * @returns true for visible, false otherwise
   */
  isActive (): boolean
  {
    return this.objGroup.visible;
  }

  /**
   * Update the joint objects and object settings according to the given angles and agent data.
   *
   * @param angles the angles of the current state
   * @param data the agent data of the current state
   * @param nextAngles the angles of the next state
   * @param nextData the agent data of the next state
   * @param t the interpolation time
   */
  update (angles: number[] | Float32Array, data: number[] | Float32Array, nextAngles: number[] | Float32Array | undefined = undefined, nextData: number[] | Float32Array | undefined = undefined, t: number = 0): void
  {
    let jointData = angles;
    let i: number;

    // Check if we need to interpolate
    if (nextAngles !== undefined && t > 0) {
      if (t >= 1) {
        jointData = nextAngles;
      } else {
        // Interpolate state variables
        jointData = [];
        i = Math.min(angles.length, nextAngles.length);

        while (i--) {
          jointData[i] = t * (nextAngles[i] - angles[i]) + angles[i];
        }
      }
    }

    // Apply joint angles to model
    i = Math.min(jointData.length, this.jointGroups.length);

    while (i--) {
      const axis = this.jointGroups[i].jointAxis;
      if (axis) {
        // Calculate quaternion from axis and angle
        this.jointGroups[i].setRotationFromAxisAngle(axis, jointData[i]);
        this.jointGroups[i].updateMatrix();
      }
    }

    // Call model data update
    this.updateData(data, nextData, t);
  }

  /**
   * Update agent specific settings based on agent data.
   *
   * @param data the agent data of the current state
   * @param nextData the agent data of the next state
   * @param t the interpolation time
   */
  updateData (data: number[] | Float32Array, nextData: number[] | Float32Array | undefined = undefined, t: number = 0): void
  {
    // Does intentionally nothing...
  }

  /**
   * Set the team color of this robot model
   *
   * @param color the new team color
   */
  setTeamColor (color: Color): void
  {
    let i = this.teamMatList.length;

    while (i--) {
      // ANYFIX: Should be a THREE.Material and I think it is, but then the "color" attribute is not specified.
      const mat = this.teamMatList[i] as any;
      mat.color.copy(color);
      mat.needsUpdate = true;
    }
  }
}

export { RobotModel };
