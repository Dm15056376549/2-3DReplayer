import { Vector2, Vector3 } from 'three';

/**
 * The ICameraController interface definition.
 *
 * @author Stefan Glaser
 */
class ICameraController
{
  /**
   * Enable/Disable the camera controller.
   *
   * @param enabled true to enable the camera controller, false for disabling
   */
  setEnabled (enabled: boolean) {}

  /**
   * Set the bounds of the camera controller.
   *
   * @param bounds the new world bounds
   */
  setBounds (bounds: Vector3): void {}

  /**
   * Set the area of interest (+/- dimensions around the origin).
   *
   * @param areaOfInterest the area of interest
   */
  setAreaOfInterest (areaOfInterest: Vector2): void {}

  /**
   * Update the camera controller.
   * The update is needed for keyboard movements, as well for tracking objects.
   *
   * @param deltaT the time since the last render call
   */
  update (deltaT: number): void {}
}

export { ICameraController };
