/**
 * Multiplication factor to transform an angle in degrees to radians.
 */
 const PIby180 = Math.PI / 180.0;

 /**
  * Multiplication factor to transform an angle in degrees to radians and negating it.
  */
 const NegPIby180 = -Math.PI / 180.0;
 
 /**
 * Simple math helpers.
 * 
 * @author Stefan Glaser
 */
class JsMath
{
  /**
   * Transform degrees to radians.
   * @param deg the angle in degrees
   * @returns the angle in rad
   */
  static toRad (deg: number): number
  {
    return deg * PIby180;
  }

  /**
   * Transform radians to degrees.
   * @param rad the angle in rad
   * @returns the angle in degrees
   */
  static toDeg (rad: number): number
  {
    return rad * 180 / Math.PI;
  }
}

export { PIby180, NegPIby180, JsMath };
