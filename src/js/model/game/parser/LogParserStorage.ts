import { PartialWorldState } from './PartialWorldState';

/**
 * The LogParserStorage class definition.
 *
 * @author Stefan Glaser
 */
class LogParserStorage
{
  /** The partial state used during parsing. */
  partialState?: PartialWorldState;

  /** The maximum states to parse per run. */
  maxStates: number;

  /** The index list for the recent player types of the individual agents of the left team. */
  leftIndexList: number[];

  /** The index list for the recent player types of the individual agents of the right team. */
  rightIndexList: number[];

  /**
   * LogParserStorage Constructor
   */
  constructor ()
  {
    this.partialState = undefined;
    this.maxStates = 500;
    this.leftIndexList = [];
    this.rightIndexList = [];
  }

  /**
   * Check if a partial state instance exists.
   *
   * @returns true, if the partial state exists, false otherwise
   */
  hasPartialState (): boolean
  {
    return !!this.partialState;
  }
}

export { LogParserStorage };
