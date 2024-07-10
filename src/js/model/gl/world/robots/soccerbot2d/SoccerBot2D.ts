import { DynamicRobotModel } from '../DynamicRobotModel';
import { SoccerBot2DSpecification } from './SoccerBot2DSpecification';
import { Environment2DParams, Agent2DData } from '../../../../game/utils/SServerUtil';
import { ParameterMap } from '../../../../game/utils/ParameterMap';
import { MeshFactory } from '../../../utils/MeshFactory';
import { Material, Math as TMath } from 'three';

/**
 * The SoccerBot2D class definition.
 *
 * @author Stefan Glaser
 */
class SoccerBot2D extends DynamicRobotModel
{
  /** The list of stamina materials. */
  staminaMatList: Material[];

  /** The maximum stamina value. */
  maxStamina: number;

  /**
   * SoccerBot2D Constructor
   * 
   * @param name the name of the agent model
   * @param specification the soccer bot 2d specification
   * @param meshFactory the mesh factory
   * @param environmentParams the environment paraméter
   */
  constructor(name: string, specification: SoccerBot2DSpecification, meshFactory: MeshFactory, environmentParams: ParameterMap)
  {
    super(name, specification, meshFactory);

    this.staminaMatList = [];
    this.maxStamina = 8000;

    const maxStaminaParam = environmentParams.getNumber(Environment2DParams.STAMINA_MAX);
    if (maxStaminaParam !== undefined) {
      this.maxStamina = maxStaminaParam;
    }

    // Extract stamina materials
    let i = specification.staminaMaterialNames.length;
    while (i--) {
      const mat = meshFactory.materialCache[specification.staminaMaterialNames[i]];
      if (mat !== undefined) {
        if (Array.isArray(mat)) {
          this.staminaMatList.push(...mat);
        } else {
          this.staminaMatList.push(mat);
        }
      }
    }
  }

  /**
   * Update the joint objects according to the given angles.
   *
   * @override
   * @param data the agent data of the current state
   * @param nextData the agent data of the next state
   * @param t the interpolation time
   */
  updateData (data: number[] | Float32Array, nextData: number[] | Float32Array | undefined = undefined, t = 0): void
  {
    if (data[Agent2DData.STAMINA] === undefined) {
      return;
    }

    let stamina = nextData === undefined ?
          data[Agent2DData.STAMINA] :
          data[Agent2DData.STAMINA] + (nextData[Agent2DData.STAMINA] - data[Agent2DData.STAMINA]) * t;
    stamina = TMath.clamp(stamina, 0, this.maxStamina);
    stamina = (this.maxStamina - stamina) / this.maxStamina;

    // Apply stamina color
    let i = this.staminaMatList.length;
    while (i--) {
      // ANYFIX: THREE.Material.color not defined!
      const mat = this.staminaMatList[i] as any;
      if (mat.color.r === stamina) {
        // Prevent material updates if stamina value hasn't changed (e.g. on pausing)
        break;
      }
      mat.color.setScalar(stamina);
      mat.needsUpdate = true;
    }
  }
}

export { SoccerBot2D };
