import { SimulationLog } from '../SimulationLog';
import { SimulationType } from '../utils/GameUtil';

/**
 * The SServerLog class definition.
 *
 * The SServerLog is the central class holding a soccer-server 2D game log file.
 *
 * @author Stefan Glaser
 */
class SServerLog extends SimulationLog
{

  /** The ulg log version. */
  version: number;

  /**
   * SServerLog Constructor
   * Create a new sserver game log file.
   *
   * @param ressource the simulation log ressource
   * @param version the ulg log version
   */
  constructor (ressource: URL | File, version: number)
  {
    super(ressource, SimulationType.TWOD);

    this.version = version;
  }
}

export { SServerLog };
