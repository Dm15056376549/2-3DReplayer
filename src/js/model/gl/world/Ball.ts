import { MovableObject } from './MovableObject';
import { ObjectState } from '../../game/ObjectState';

/**
 * The Ball class definition.
 *
 * @author Stefan Glaser
 */
class Ball extends MovableObject
{
  /** The radius of the ball. */
  radius: number;

  /**
   * Ball Constructor
   *
   * @param radius the ball radius
   */
  constructor (radius: number = 0.2)
  {
    super('ball');

    this.radius = radius;
    this.objGroup.scale.setScalar(this.radius);
  }

  /**
   * Set the ball radius.
   *
   * @param radius the new ball radius
   */
  setRadius (radius: number): void
  {
    if (this.radius !== radius) {
      this.radius = radius;
      this.objGroup.scale.setScalar(this.radius);
    }
  }

  /**
   * Update movable object
   *
   * @param state the current object state
   * @param nextState the next object state
   * @param t the interpolated time between the current and next state
   */
  update (state: ObjectState, nextState: ObjectState | undefined, t: number | undefined): void
  {
    this.updateBodyPose(state, nextState, t);
  }
}

export { Ball };
