import { FileUtil } from './FileUtil';

/**
 * The SimulationLogInfo class definition.
 *
 * @author Stefan Glaser
 */
class SimulationLogInfo
{
  /** The year in which the simulation was recorded. */
  year: number;

  /** The month in which the simulation was recorded. */
  month: number;

  /** The day in which the simulation was recorded. */
  day: number;

  /** The hour of the day in which the simulation was recorded. */
  hour: number;

  /** The minute within the hour of the day in which the simulation was recorded. */
  minute: number;

  /** The name of the left team. */
  leftTeamName: string;

  /** The score of the left team. */
  leftScore: number;

  /** The name of the right team. */
  rightTeamName: string;

  /** The score of the right team. */
  rightScore: number;

  /**
   * SimulationLogInfo Constructor
   *
   * @param year the year of recording
   * @param month the month of recording
   * @param day the day of recording
   * @param hour the of recording
   * @param minute the minutor of recording
   * @param leftTeamName the name of the left team
   * @param leftScore the score of the left team
   * @param rightTeamName the name of the right team
   * @param rightScore the score of the right team
   */
  constructor (year: number, month: number, day: number, hour: number, minute: number, leftTeamName: string, leftScore: number, rightTeamName: string, rightScore: number)
  {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.leftTeamName = leftTeamName;
    this.leftScore = leftScore;
    this.rightTeamName = rightTeamName;
    this.rightScore = rightScore;
  }

  /**
   * Parse a new simulation log info instance from the given file url.
   *
   * @param url the url to extract the simulation log from
   * @returns the new simulation log info instance, or undefined if parsing failed
   */
  static fromURL (url: string): SimulationLogInfo | undefined
  {
    return SimulationLogInfo.fromFileName(FileUtil.getFileName(url));
  }

  /**
   * Parse a new simulation log info instance from the given file name.
   *
   * @param name the simulation log file name to extract the simulation log info from
   * @returns the new simulation log info instance, or undefined if parsing failed
   */
  static fromFileName (name: string): SimulationLogInfo | undefined
  {
    // Typical log format (which we are looking for):
    // YYYYMMDDhhmm{_|-}<left-team>_<left-score>{_|-}vs{_|-}<right-team>_<right-score>.<suffix>
    const regex = /^([\d]{4})([\d]{2})([\d]{2})([\d]{2})([\d]{2})[-_](.+)_([\d]+)[-_]vs[-_](.+)_([\d]+)\..*/g;
    const tokens = regex.exec(name);

    if (tokens) {
      // Found matching pattern
      return new SimulationLogInfo(
          parseInt(tokens[1], 10), // Year
          parseInt(tokens[2], 10), // Month
          parseInt(tokens[3], 10), // Day
          parseInt(tokens[4], 10), // Hour
          parseInt(tokens[5], 10), // Minute
          tokens[6],               // Left team
          parseInt(tokens[7], 10), // Left score
          tokens[8],               // Right team
          parseInt(tokens[9], 10)  // Right score
        );
    }

    return undefined;
  }
}

export { SimulationLogInfo };
