import { RobotSpecification, BodyPartSpecification, MeshSpecification } from '../RobotSpecification';
import { IGeometryFactory } from '../../../utils/IGeometryFactory';
import { IMaterialFactory } from '../../../utils/IMaterialFactory';
import { SceneUtil } from '../../../../../utils/SceneUtil';
import { makeM4x4 } from '../../../../../utils/ThreeJsUtil';
import { TeamSide, GameUtil } from '../../../../game/utils/GameUtil';
import { BoxBufferGeometry, BufferGeometry, CylinderBufferGeometry, Material, SphereBufferGeometry, Vector3 } from 'three';

/**
 * The SoccerBot2DSpecification definition.
 *
 * @author Stefan Glaser
 */
class SoccerBot2DSpecification extends RobotSpecification
{
  /** The list of stamina material names. */
  staminaMaterialNames: string[];

  /**
   * SoccerBot2DSpecification Constructor
   *
   * @param side the team side
   * @param playerNo the player number
   */
  constructor (side: TeamSide, playerNo: number)
  {
    super('torso');

    const sideLetter = GameUtil.getSideLetter(side);
    const matStamina = 'stamina_' + sideLetter + playerNo;
    const matBlack = 'sbBlack';
    const matBlue = 'sbBlue';
    const matTeam = side === TeamSide.LEFT ? 'teamLeft' : 'teamRight';
    this.teamMaterialNames.push(matTeam);

    const m4Body = makeM4x4(1, 0, 0, 0, 0, 1, 0, 0.3, 0, 0, 1, 0);
    const m4Team = makeM4x4(1, 0, 0, 0, 0, 0.2, 0, 0.6, 0, 0, 1, 0);
    const m4Stamina = makeM4x4(-1, 0, 0, 0, 0, 0.2, 0, 0.6, 0, 0, -1, 0);
    const m4Nose = makeM4x4(1, 0, 0, 0.25, 0, 1, 0, 0, 0, 0, 1, 0);

    this.staminaMaterialNames = [matStamina];

    // torso meshes
    this.meshes.push(new MeshSpecification('bodyCylinder', matBlack, m4Body));
    this.meshes.push(new MeshSpecification('bodyTeamSphere', matTeam, m4Team));
    this.meshes.push(new MeshSpecification('bodyStaminaSphere', matStamina, m4Stamina));

    // Head
    this.children.push(
        new BodyPartSpecification('head',
          [ // head meshes
            new MeshSpecification('headCylinder', matBlue),
            new MeshSpecification('headNoseBox', matBlue, m4Nose)
          ],
          new Vector3(0, 0.651, 0),
          new Vector3(0, 1, 0),
          [])); // No further children here
  }
}

export { SoccerBot2DSpecification };



/**
 * The material factory for the soccer bot 2D robot models.
 *
 * @author Stefan Glaser
 */
class SoccerBot2DMaterialFactory implements IMaterialFactory
{
  /**
   * Create the material with the given name.
   *
   * @override
   * @param name the unique name of the material
   * @return the requested (multi-)material or a default material if the requested material definition was not found
   */
  createMaterial (name: string): Material | Material[]
  {
    switch (name) {
      case 'sbBlue':
        return SceneUtil.createStdPhongMat(name, 0x001166);
        break;
      case 'sbBlack':
        return SceneUtil.createStdPhongMat(name, 0x000000);
        break;
      default:
        // By default create a very dark grey material
        return SceneUtil.createStdPhongMat(name, 0x111111);
        break;
    }
  }
}

export { SoccerBot2DMaterialFactory };



/**
 * The geometry factory for the soccer bot 2D robot models.
 *
 * @author Stefan Glaser
 */
class SoccerBot2DGeometryFactory implements IGeometryFactory
{
  /**
   * Create the geometry with the given name.
   *
   * @override
   * @param name the unique name of the geometry
   * @param onLoad the callback function to call on successfull creation
   * @param onError the callback function to call when creating the geometry failed
   */
  createGeometry (name: string,
                  onLoad: (geometry: BufferGeometry) => any,
                  onError: ((errorMsg: string) => any) | undefined = undefined): void
  {
      switch (name) {
      case 'bodyCylinderGeo':
        onLoad(new CylinderBufferGeometry(0.5, 0.5, 0.6, 32));
        break;
      case 'bodyTeamSphereGeo':
        onLoad(new SphereBufferGeometry(0.44, 16, 4, Math.PI / 2, Math.PI, 0, Math.PI / 2));
        break;
      case 'bodyStaminaSphereGeo':
        onLoad(new SphereBufferGeometry(0.44, 16, 4, Math.PI / 2, Math.PI, 0, Math.PI / 2));
        break;
      case 'headCylinderGeo':
        onLoad(new CylinderBufferGeometry(0.1, 0.1, 0.1, 16));
        break;
      case 'headNoseBoxGeo':
        onLoad(new BoxBufferGeometry(0.5, 0.1, 0.1));
        break;
      default:
        // Log error
        console.log('Geometry "' + name + '" not found!');

        if (onError) {
          onError('Geometry "' + name + '" not found!');
        }
        break;
      }
  }
}

export { SoccerBot2DGeometryFactory };
