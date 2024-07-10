import { IRobotModelFactory } from '../IRobotModelFactory';
import { MeshFactory } from '../../../utils/MeshFactory';
import { SoccerBot2D } from './SoccerBot2D';
import { SoccerBot2DSpecification, SoccerBot2DMaterialFactory, SoccerBot2DGeometryFactory } from './SoccerBot2DSpecification';
import { ParameterMap } from '../../../../game/utils/ParameterMap';
import { TeamSide } from '../../../../game/utils/GameUtil';
import { RobotModel } from '../../RobotModel';

/**
 *
 * @author Stefan Glaser
 */
class SoccerBot2DModelFactory implements IRobotModelFactory
{
  /** The mesh factory. */
  meshFactory: MeshFactory;

  /**
   * SoccerBot2DModelFactory Constructor
   */
  constructor ()
  {
    this.meshFactory = new MeshFactory(new SoccerBot2DGeometryFactory(), new SoccerBot2DMaterialFactory());
  }

  /**
   * Create a robot model to the given player type.
   *
   * @override
   * @param playerType the player type
   * @param side the team side
   * @param playerNo the player number
   * @param environmentParams the environment paraméter
   * @param playerParams the player paraméter
   * @returns a new robot model
   */
  createModel (playerType: ParameterMap, side: TeamSide, playerNo: number, environmentParams: ParameterMap, playerParams: ParameterMap): RobotModel | undefined
  {
    const robotSpec = new SoccerBot2DSpecification(side, playerNo);
    return new SoccerBot2D('SoccerBot2D', robotSpec, this.meshFactory, environmentParams);
  }

  /**
   * @override
   */
  dispose (): void {}
}

export { SoccerBot2DModelFactory };
