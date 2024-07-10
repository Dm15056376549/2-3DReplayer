import { SimulationLog } from '../SimulationLog';



/**
 * The ISimulationLogParser interface definition.
 *
 * @author Stefan Glaser
 */
interface ISimulationLogParser
{
  /**
   * Parse the given data into a simulation log data structure.
   *
   * @param data the simulation log data
   * @param ressource the simulation log data ressource
   * @param partial flag for partial / not yet fully loaded data
   * @param incremental flag for incremental data chunks
   * @return true, if a new simulation log file instance was created, false otherwise
   */
  parse (data: string, ressource: URL | File, partial: boolean, incremental: boolean): boolean;

  /**
   * Retrieve the currently parsed simulation log.
   *
   * @returns the (maybe partially) parsed simulation log
   */
  getSimulationLog (): SimulationLog | undefined;

  /**
   * Dispose all resources referenced in this parser instance.
   *
   * @param keepIteratorAlive indicator if iterator should not be disposed
   */
  dispose (keepIteratorAlive: boolean): void;
}


/**
 * The copyString funcion presents a workaround for deep copying partial strings.
 *
 * Modern browsers only provide partial strings when using string.substring() / .slice() / etc.
 * while keeping a reference to the original string. While this usually improves the overall
 * performance and memory consumption, it also prevents the garbage collector from collecting
 * the original string. This function provides a workaround for really copying a string value
 * (obtained via .substring() / .slice() / etc.).
 * Use this function when storing partial strings in your result objects.
 *
 * @param partialString
 * @return a "deep" copy of the above partial string
 */
function copyString (partialString: string): string
{
  if (partialString) {
    return JSON.parse(JSON.stringify(partialString)) as string;
  }

  return partialString;
};

export { ISimulationLogParser, copyString };
