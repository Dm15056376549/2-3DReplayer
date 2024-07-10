import { ObjectState } from '../../game/ObjectState';
import { SceneUtil } from '../../../utils/SceneUtil';
import { Mesh, Object3D, Quaternion} from 'three';

/**
 * The MovableObject class definition.
 *
 * The MovableObject provides
 *
 * @author Stefan Glaser / http://chaosscripting.net
 */
class MovableObject
{
  /** The movable object group. */
  objGroup: Object3D;

  /** The movable ground 2D object group. */
  objTwoDGroup: Object3D;

  /** The object representing that this object is selected. */
  selectionObj: Mesh;


  /**
   * MovableObject Constructor
   *
   * @param name the name of the movable object
   */
  constructor (name: string)
  {
    this.objGroup = new Object3D();
    this.objGroup.name = name;
    
    this.objTwoDGroup = new Object3D();
    this.objTwoDGroup.name = name + '_2D';
    
    this.selectionObj = SceneUtil.createSelectionMesh(0.15, 0.02);
    this.objTwoDGroup.add(this.selectionObj);
  }

  /**
   * Highlight or normalize object representation.
   *
   * @param selected true for selected, false for deseleced
   */
  setSelected (selected: boolean): void
  {
    this.selectionObj.visible = selected;
  }

  /**
   * [updateBodyPose description]
   *
   * @param state the current object state
   * @param nextState the next object state
   * @param t the interpolated time between the current and next state
   */
  updateBodyPose (state: ObjectState, nextState: ObjectState | undefined = undefined, t: number = 0): void
  {
    // Update position and orientation of this root object group
    if (nextState !== undefined && nextState.isValid() && t > 0) {
      if (t >= 1) {
        this.objGroup.position.set(nextState.x, nextState.y, nextState.z);
        this.objGroup.quaternion.set(nextState.qx, nextState.qy, nextState.qz, nextState.qw);
      } else {
        this.objGroup.position.lerpVectors(state.position, nextState.position, t);
        Quaternion.slerp(state.orientation, nextState.orientation, this.objGroup.quaternion, t);
      }
    } else {
      this.objGroup.position.set(state.x, state.y, state.z);
      this.objGroup.quaternion.set(state.qx, state.qy, state.qz, state.qw);
    }

    // Copy 2D position and orientation to 2D object group
    this.objTwoDGroup.position.x = this.objGroup.position.x;
    this.objTwoDGroup.position.z = this.objGroup.position.z;
    // DOTO: extract heading angle

    // Trigger update of object matrices
    this.objGroup.updateMatrix();
    this.objTwoDGroup.updateMatrix();
  }
}

export { MovableObject };
