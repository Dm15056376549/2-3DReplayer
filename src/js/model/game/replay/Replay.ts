import { SimulationLog } from '../SimulationLog';
import { SimulationType } from '../utils/GameUtil';

/**
 * The Replay class definition.
 *
 * The Replay is the central class holding a replay file
 *
 * @author Stefan Glaser
 */
class Replay extends SimulationLog
{

  /** The replay version. */
  version: number;

  /**
   * Replay Constructor
   * Create a new replay.
   * 
   * @param ressource the simulation log ressource
   * @param type the simulation-log type
   * @param version the replay version
   */
  constructor (ressource: URL | File, type: SimulationType, version: number)
  {
    super(ressource, type);

    this.version = version;
  }
}

export { Replay };
