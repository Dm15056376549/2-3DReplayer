/**
 * Enum holding the known simulation types.
 */
const enum SimulationType {
  TWOD = 1,
  THREED = 2
}

/**
 * An enum for the side of a team.
 */
const enum TeamSide {
  LEFT = -1,
  NEUTRAL = 0,
  RIGHT = 1
}

/**
 *
 * @author Stefan Glaser
 */
class GameUtil
{
  /**
   * Retrieve a letter representing the side.
   *
   * @param side the side value
   * @param uppercase true for upper case letter, false for lower case
   * @returns 'l'/'L' for left side, 'r'/'R' for right side, 'n'/'N' for neutral
   */
  static getSideLetter (side: TeamSide, uppercase: boolean = false): string
  {
    if (uppercase) {
      return side === TeamSide.LEFT ? 'L' : side === TeamSide.RIGHT ? 'R' : 'N';
    } else {
      return side === TeamSide.LEFT ? 'l' : side === TeamSide.RIGHT ? 'r' : 'n';
    }
  }
}

export { SimulationType, TeamSide, GameUtil };
