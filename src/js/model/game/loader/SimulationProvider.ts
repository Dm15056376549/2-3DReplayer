import { GEventObject, GErrorEvent, GProgressEvent, IEventDispatcher } from '../../../utils/EventDispatcher';
import { SimulationLog } from '../SimulationLog';



export interface NewSimulationLogEvent extends GEventObject
{
  /** The newly available simulation log instance. */
  simulationLog: SimulationLog;
};

/** The simulation provider event map interface. */
export interface SimulationProviderEventMap {
  /** Fired when a new "connection" has been established. */
  'start': GProgressEvent;
  /** A new simulation could successfully be parsed. */
  'new-sim-log': NewSimulationLogEvent;
  /** New data arrived. */
  'progress': GProgressEvent;
  /** Current Progress aborted by user interaction. */
  'aborted': GEventObject;
  /** The "connection" was closed. */
  'finished': GEventObject;
  /** An error occured. */
  'error': GErrorEvent;
};


/**
 * The ISimulationProvider interface definition.
 *
 * @author Stefan Glaser
 */
interface ISimulationProvider extends IEventDispatcher<SimulationProviderEventMap>
{
  /**
   * Retrieve the current simulation log if existing.
   *
   * @return the current simulation log if existing, undefined otherwise
   */
  getSimulationLog (): SimulationLog | undefined;
};

 export { ISimulationProvider };
