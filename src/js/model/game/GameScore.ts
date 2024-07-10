/**
 * The GameScore class definition.
 *
 * The GameScore provides information about the current score of a game.
 *
 * @author Stefan Glaser
 */
class GameScore
{
  /** The global time when this score was reached the first time. */
  time: number;

  /** The left team score. */
  goalsLeft: number;

  /** The left team penalty score. */
  penaltyScoreLeft: number;

  /** The left team penalty misses. */
  penaltyMissLeft: number;

  /** The right team score. */
  goalsRight: number;

  /** The right team penalty score. */
  penaltyScoreRight: number;

  /** The right team penalty misses. */
  penaltyMissRight: number;


  /**
   * GameScore Constructor
   * Create a new GameScore holding the scoring information.
   *
   * @param time
   * @param goalsLeft
   * @param goalsRight
   * @param penScoreLeft
   * @param penMissLeft
   * @param penScoreRight
   * @param penMissRight
   */
  constructor (time: number, goalsLeft: number, goalsRight: number, penScoreLeft: number = 0, penMissLeft: number = 0, penScoreRight: number = 0, penMissRight: number = 0)
  {
    this.time = time;
    this.goalsLeft = goalsLeft;
    this.penaltyScoreLeft = penScoreLeft;
    this.penaltyMissLeft = penMissLeft;
    this.goalsRight = goalsRight;
    this.penaltyScoreRight = penScoreRight;
    this.penaltyMissRight = penMissRight;
  }
}

export { GameScore };
