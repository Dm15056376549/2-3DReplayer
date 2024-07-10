/**
 * The GameState class definition.
 *
 * The GameState provides information about the current state of a game.
 *
 * @author Stefan Glaser
 */
class GameState
{
  /** The global time when this state was reached. */
  time: number;

  /** The play mode string. */
  playMode: string;

  /**
   * GameState Constructor
   * Create a new GameState holding the game state information.
   *
   * @param time
   * @param playMode
   */
  constructor (time: number, playMode: string)
  {
    this.time = time;
    this.playMode = playMode;
  }

  /**
   * Fetch the play mode string.
   *
   * @returns the play mode string
   */
  getPlayModeString (): string
  {
    return this.playMode;
  }
}

export { GameState };
