import { ParameterMap } from '../../../game/utils/ParameterMap';
import { RobotModel } from '../RobotModel';
import { TeamSide } from '../../../game/utils/GameUtil';



/**
 * RobotModelFactory Interface.
 */
interface IRobotModelFactory
{
  /**
   * Create a robot model to the given player type.
   *
   * @param playerType the player type
   * @param side the team side
   * @param playerNo the player number
   * @param environmentParams the environment paraméter
   * @param playerParams the player paraméter
   * @return a new robot model
   */
  createModel (playerType: ParameterMap, side: TeamSide, playerNo: number, environmentParams: ParameterMap, playerParams: ParameterMap): RobotModel | undefined;


  /**
   * Dispose all resources allocated within this factory.
   */
  dispose (): void;
}

export { IRobotModelFactory };
