import { IRobotModelFactory } from '../IRobotModelFactory';
import { DynamicRobotModel } from '../DynamicRobotModel';
import { JSONGeometryFactory } from '../../../utils/JSONGeometryFactory';
import { MeshFactory } from '../../../utils/MeshFactory';
import { NaoSpecification, NaoMaterialFactory } from './NaoSpecification';
import { PlayerType3DParams } from '../../../../game/utils/SparkUtil';
import { ParameterMap } from '../../../../game/utils/ParameterMap';
import { TeamSide } from '../../../../game/utils/GameUtil';
import { RobotModel } from '../../RobotModel';

/**
 *
 * @author Stefan Glaser
 */
class NaoModelFactory implements IRobotModelFactory
{
  /** The mesh factory. */
  meshFactory: MeshFactory;

  /**
   * NaoModelFactory Constructor
   */
  constructor()
  {
    this.meshFactory = new MeshFactory(new JSONGeometryFactory('models/nao_bundle.json'), new NaoMaterialFactory());
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
   * @return a new robot model
   */
  createModel (playerType: ParameterMap, side: TeamSide, playerNo: number, environmentParams: ParameterMap, playerParams: ParameterMap): RobotModel | undefined
  {
    const modelName = playerType.getString(PlayerType3DParams.MODEL_NAME);

    if (!!modelName && modelName.slice(0, 3) === 'nao') {
      let modelType = playerType.getNumber(PlayerType3DParams.MODEL_TYPE);

      if (!modelType) {
        modelType = 0;
      }

      const specification = new NaoSpecification(side, modelType, playerNo);
      return new DynamicRobotModel('nao_hetero', specification, this.meshFactory);
    }

    return undefined;
  }

  /**
   * @override
   */
  dispose (): void {}
}

export { NaoModelFactory };
