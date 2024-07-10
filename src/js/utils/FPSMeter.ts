/**
 * The FPSMeter class definition.
 *
 * @author Stefan Glaser
 */
class FPSMeter
{
  /** The list of previous fps. */
  fpsHistory: number[];

  /** The current second. */
  currentSecond: number;

  /** The fps counter to the current second. */
  currentFPS: number;

  /** Callback function to call when a new second began. */
  onNewSecond: (() => any) | undefined;

  /**
   * FPSMeter Constructor
   *
   * @param size the history buffer size
   */
  constructor (size: number = 1)
  {
    this.fpsHistory = [];
    this.currentSecond = -1;
    this.currentFPS = 0;
    this.onNewSecond = undefined;

    let i = Math.max(1, size);
    while (i--) {
      this.fpsHistory.push(0);
    }
  }

  /**
   * Proceed fps counter.
   *
   * @param time the current time
   */
  update (time: number): void
  {
    if (this.currentSecond < 0) {
      this.currentSecond = Math.floor(time);
    } else {
      const newSecond = Math.floor(time);

      if (newSecond > this.currentSecond) {
        // New second started
        // console.log("FPS: " + this.currentFPS);

        // Shift history entries by one
        let i = this.fpsHistory.length - 1;
        while (i--) {
          this.fpsHistory[i + 1] = this.fpsHistory[i];
        }

        this.fpsHistory[0] = this.currentFPS;
        this.currentFPS = 0;

        this.currentSecond = newSecond;

        if (this.onNewSecond !== undefined) {
          this.onNewSecond();
        }
      }
    }

    this.currentFPS++;
  }

  /**
   * Retrieve the fps to the previous second.
   *
   * @returns the fps in the previous second
   */
  getMostRecentFPS (): number
  {
    return this.fpsHistory[0];
  }
}

export { FPSMeter };
