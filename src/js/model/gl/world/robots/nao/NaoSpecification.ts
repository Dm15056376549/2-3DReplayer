import { IMaterialFactory } from '../../../utils/IMaterialFactory';
import { JSONGeometryFactory } from '../../../utils/JSONGeometryFactory';
import { RobotSpecification, BodyPartSpecification, MeshSpecification } from '../RobotSpecification';
import { SceneUtil } from '../../../../../utils/SceneUtil';
import { makeM4x4 } from '../../../../../utils/ThreeJsUtil';
import { TeamSide } from '../../../../game/utils/GameUtil';
import { Vector3, Material } from 'three';


const ZERO = new Vector3(0, 0, 0);
const UNIT_X = new Vector3(1, 0, 0);
const UNIT_Y = new Vector3(0, 1, 0);
const UNIT_Z = new Vector3(0, 0, 1);

/**
 * The NaoSpecification interface definition.
 *
 * The NaoSpecification describes the API of an agent bundle.
 *
 * @author Stefan Glaser
 */
class NaoSpecification extends RobotSpecification
{
  /** The nao hetero model type. */
  type: number;

  /**
   * NaoSpecification Constructor
   * 
   * @param side the team side
   * @param type the nao hetero model type
   * @param playerNo the player number
   */
  constructor(side: TeamSide, type: number, playerNo: number)
  {
    super('torso');

    this.type = type;

    const matNum = 'num' + playerNo;
    const matWhite = NaoMaterialNames.NAO_WHITE;
    const matBlack = NaoMaterialNames.NAO_BLACK;
    const matGrey = NaoMaterialNames.NAO_GREY;
    const matTeam = side === TeamSide.LEFT ? NaoMaterialNames.NAO_TEAM_LEFT : NaoMaterialNames.NAO_TEAM_RIGHT;
    this.teamMaterialNames.push(matTeam);

    const m4Torso = makeM4x4(0, 0, 0.1, 0, 0, 0.1, 0, 0, -0.1, 0, 0, 0);
    const m4lUpperArm = makeM4x4(0, 0.07, 0, 0.02, 0, 0, 0.07, 0, 0.07, 0, 0, -0.01);
    const m4rUpperArm = makeM4x4(0, 0.07, 0, 0.02, 0, 0, 0.07, 0, 0.07, 0, 0, 0.01);
    const m4LowerArm = makeM4x4(0, 0.05, 0, 0.05, 0, 0, 0.05, 0, 0.05, 0, 0, 0);
    const m4Thigh = makeM4x4(0, 0.07, 0, 0.01, 0, 0, 0.07, -0.04, 0.07, 0, 0, 0);
    const m4Shank = makeM4x4(0, 0.08, 0, -0.005, 0, 0, 0.08, -0.055, 0.08, 0, 0, 0);
    const m4Foot = makeM4x4(0, 0.08, 0, 0.03, 0, 0, 0.08, -0.04, 0.08, 0, 0, 0);

    // torso meshes
    this.meshes.push(new MeshSpecification('nao_torso_coreBody', matWhite, m4Torso));
    this.meshes.push(new MeshSpecification('nao_torso_coreInner', matBlack, m4Torso));
    this.meshes.push(new MeshSpecification('nao_torso_chestButton', matTeam, m4Torso));
    this.meshes.push(new MeshSpecification('nao_torso_chestBow', matTeam, m4Torso));
    this.meshes.push(new MeshSpecification('nao_torso_numberBatch', matNum, m4Torso));
    this.meshes.push(new MeshSpecification('nao_torso_lCollar', matWhite, makeM4x4(0, 0, -0.1, 0, 0, 0.1, 0, 0, 0.1, 0, 0, 0)));
    this.meshes.push(new MeshSpecification('nao_torso_rCollar', matWhite, m4Torso));

    // Head
    this.children.push(
        new BodyPartSpecification('neck',
          [], // neck meshes
          new Vector3(0, 0.09, 0),
          UNIT_Y,
          [ // neck children
            new BodyPartSpecification('head',
              [ // head meshes
                new MeshSpecification('nao_head_core', matWhite, m4Torso),
                new MeshSpecification('nao_head_ears', matGrey, m4Torso),
                new MeshSpecification('nao_head_teamMarker', matTeam, m4Torso),
                new MeshSpecification('nao_head_camera', matBlack, m4Torso)
              ],
              new Vector3(0, 0.06, 0),
              UNIT_Z,
              []) // No further children here
          ]));

    // Right arm
    this.children.push(
        new BodyPartSpecification('rShoulder',
          [], // rShoulder meshes
          new Vector3(0, 0.075, 0.098),
          UNIT_Z,
          [ // rShoulder children
            new BodyPartSpecification('rUpperArm',
              [ // rUpperArm meshes
                new MeshSpecification('nao_rUpperArm_cylinder', matBlack, m4rUpperArm),
                new MeshSpecification('nao_rUpperArm_protector', matWhite, m4rUpperArm),
                new MeshSpecification('nao_rUpperArm_teamMarker', matTeam, m4rUpperArm)
              ],
              ZERO,
              UNIT_Y,
              [ // rUpperArm children
                new BodyPartSpecification('rElbow',
                  [], // rElbow meshes
                  new Vector3(0.09, 0.009, 0),
                  UNIT_X,
                  [ // rElbow children
                    new BodyPartSpecification('rLowerArm',
                      [ // rLowerArm meshes
                        new MeshSpecification('nao_rLowerArm_core', matWhite, m4LowerArm),
                        new MeshSpecification('nao_rLowerArm_teamMarker', matTeam, m4LowerArm)
                      ],
                      ZERO,
                      UNIT_Y,
                      []) // No further children here
                  ])
              ])
          ]));

    // Left arm
    this.children.push(
        new BodyPartSpecification('lShoulder',
          [], // lShoulder meshes
          new Vector3(0, 0.075, -0.098),
          UNIT_Z,
          [ // lShoulder children
            new BodyPartSpecification('lUpperArm',
              [ // lUpperArm meshes
                new MeshSpecification('nao_lUpperArm_cylinder', matBlack, m4lUpperArm),
                new MeshSpecification('nao_lUpperArm_protector', matWhite, m4lUpperArm),
                new MeshSpecification('nao_lUpperArm_teamMarker', matTeam, m4lUpperArm)
              ],
              ZERO,
              UNIT_Y,
              [ // lUpperArm children
                new BodyPartSpecification('lElbow',
                  [], // lElbow meshes
                  new Vector3(0.09, 0.009, 0),
                  UNIT_X,
                  [ // lElbow children
                    new BodyPartSpecification('lLowerArm',
                      [ // lLowerArm meshes
                        new MeshSpecification('nao_lLowerArm_core', matWhite, m4LowerArm),
                        new MeshSpecification('nao_lLowerArm_teamMarker', matTeam, m4LowerArm)
                      ],
                      ZERO,
                      UNIT_Y,
                      []) // No further children here
                  ])
              ])
          ]));

    // Right leg
    this.children.push(
        new BodyPartSpecification('rHip1',
          [], // rHip1 meshes
          new Vector3(-0.01, -0.115, 0.055),
          new Vector3(0, 0.7071, -0.7071),
          [ // rHip1 children
            new BodyPartSpecification('rHip2',
              [], // rHip2 meshes
              ZERO,
              UNIT_X,
              [ // rHip2 children
                new BodyPartSpecification('rThigh',
                  [ // rThigh meshes
                    new MeshSpecification('nao_rThigh_core', matWhite, m4Thigh),
                    new MeshSpecification('nao_rThigh_teamMarker', matTeam, m4Thigh),
                    new MeshSpecification('nao_rThigh_noMarker', matNum, m4Thigh)
                  ],
                  ZERO,
                  UNIT_Z,
                  [ // rThigh children
                    new BodyPartSpecification('rShank',
                      [ // rShank meshes
                        new MeshSpecification('nao_rShank_coreInner', matBlack, m4Shank),
                        new MeshSpecification('nao_rShank_coreBody', matWhite, m4Shank),
                        new MeshSpecification('nao_rShank_teamMarker', matTeam, m4Shank)
                      ],
                      new Vector3(0.005, -0.12, 0),
                      UNIT_Z,
                      [ // rShank children
                        new BodyPartSpecification('rAnkle',
                          [], // rAnkle meshes
                          new Vector3(0, -0.1, 0),
                          UNIT_Z,
                          [ // rAnkle children
                            new BodyPartSpecification('rFoot',
                              [ // rFoot meshes
                                new MeshSpecification('nao_rFoot_core', matWhite, m4Foot),
                                new MeshSpecification('nao_rFoot_teamMarker', matTeam, m4Foot)
                              ],
                              ZERO,
                              UNIT_X,
                              []) // No further children here
                          ])
                      ])
                  ])
              ])
          ]));

    // Left leg
    this.children.push(
        new BodyPartSpecification('lHip1',
          [], // lHip1 meshes
          new Vector3(-0.01, -0.115, -0.055),
          new Vector3(0, -0.7071, -0.7071),
          [ // lHip1 children
            new BodyPartSpecification('lHip2',
              [], // lHip2 meshes
              ZERO,
              UNIT_X,
              [ // lHip2 children
                new BodyPartSpecification('lThigh',
                  [ // lThigh meshes
                    new MeshSpecification('nao_lThigh_core', matWhite, m4Thigh),
                    new MeshSpecification('nao_lThigh_teamMarker', matTeam, m4Thigh)
                  ],
                  ZERO,
                  UNIT_Z,
                  [ // lThigh children
                    new BodyPartSpecification('lShank',
                      [ // lShank meshes
                        new MeshSpecification('nao_lShank_coreInner', matBlack, m4Shank),
                        new MeshSpecification('nao_lShank_coreBody', matWhite, m4Shank),
                        new MeshSpecification('nao_lShank_teamMarker', matTeam, m4Shank)
                      ],
                      new Vector3(0.005, -0.12, 0),
                      UNIT_Z,
                      [ // lShank children
                        new BodyPartSpecification('lAnkle',
                          [], // lAnkle meshes
                          new Vector3(0, -0.1, 0),
                          UNIT_Z,
                          [ // lAnkle children
                            new BodyPartSpecification('lFoot',
                              [ // lFoot meshes
                                new MeshSpecification('nao_lFoot_core', matWhite, m4Foot),
                                new MeshSpecification('nao_lFoot_teamMarker', matTeam, m4Foot)
                              ],
                              ZERO,
                              UNIT_X,
                              []) // No further children here
                          ])
                      ])
                  ])
              ])
          ]));

    // Apply type specific modifications
    switch (this.type) {
      case 4:
        this.applyType4Modifications();
        break;
      case 3:
        this.applyType3Modifications();
        break;
      case 1:
        this.applyType1Modifications();
        break;
      default:
        break;
    }
  }

  /**
   * Change the default model to a type 1 model.
   */
  applyType1Modifications (): void
  {
    const rElbow = this.children[1].children[0].children[0];
    const lElbow = this.children[2].children[0].children[0];

    rElbow.translation.x = 0.12664;
    lElbow.translation.x = 0.12664;

    const rShank = this.children[3].children[0].children[0].children[0];
    const lShank = this.children[4].children[0].children[0].children[0];

    rShank.translation.y = -0.13832;
    lShank.translation.y = -0.13832;

    const rAnkle = rShank.children[0];
    const lAnkle = lShank.children[0];

    rAnkle.translation.y = -0.11832;
    lAnkle.translation.y = -0.11832;
  }

  /**
   * Change the default model to a type 3 model.
   */
  applyType3Modifications (): void
  {
    const rElbow = this.children[1].children[0].children[0];
    const lElbow = this.children[2].children[0].children[0];

    rElbow.translation.x = 0.145736848;
    lElbow.translation.x = 0.145736848;

    const rHip1 = this.children[3];
    const lHip1 = this.children[4];

    rHip1.translation.z = 0.072954143;
    lHip1.translation.z = -0.072954143;

    const rShank = lHip1.children[0].children[0].children[0];
    const lShank = rHip1.children[0].children[0].children[0];

    rShank.translation.y = -0.147868424;
    lShank.translation.y = -0.147868424;

    const rAnkle = rShank.children[0];
    const lAnkle = lShank.children[0];

    rAnkle.translation.y = -0.127868424;
    lAnkle.translation.y = -0.127868424;
  }

  /**
   * Change the default model to a type 4 model.
   */
  applyType4Modifications (): void
  {
    const rFoot = this.children[3].children[0].children[0].children[0].children[0].children[0];
    const lFoot = this.children[4].children[0].children[0].children[0].children[0].children[0];

    rFoot.children.push(
      new BodyPartSpecification('rToe',
        [ // lToe meshes
        ],
        new Vector3(0.06, -0.04, 0),
        UNIT_Z,
        []) // No further children here);
      );

    lFoot.children.push(
      new BodyPartSpecification('lToe',
        [ // lToe meshes
        ],
        new Vector3(0.06, -0.04, 0),
        UNIT_Z,
        []) // No further children here);
      );
  }
}

export { NaoSpecification };















/**
 * An enum providing the available materials.
 */
export const enum NaoMaterialNames {
  NAO_WHITE = 'naoWhite',
  NAO_BLACK = 'naoBlack',
  NAO_GREY = 'naoGrey',
  NAO_TEAM_LEFT = 'teamLeft',
  NAO_TEAM_RIGHT = 'teamRight'
}




/**
 * The material factory for the nao robot models.
 *
 * @author Stefan Glaser
 */
class NaoMaterialFactory implements IMaterialFactory
{
  /**
   * Create the material with the given name.
   *
   * @override
   * @param name the unique name of the material
   * @returns the requested (multi-)material or a default material if the requested material definition was not found
   */
  createMaterial (name: string): Material | Material[]
  {
    if (name.startsWith('num')) {
      let number = 0;
      try {
        number = parseInt(name.slice(3), 10);
      } catch (err) {
      }

      return SceneUtil.createStdNumberMat(name, 0xcccccc, number);
    }

    switch (name) {
      case NaoMaterialNames.NAO_BLACK:
        return SceneUtil.createStdPhongMat(name, 0x000000);
        break;
      case NaoMaterialNames.NAO_GREY:
        return SceneUtil.createStdPhongMat(name, 0x3d3d3d);
        break;
      case NaoMaterialNames.NAO_WHITE:
        return SceneUtil.createStdPhongMat(name, 0xcccccc);
        break;
      default:
        // By default create a clone of nao white materail
        return SceneUtil.createStdPhongMat(name, 0x3d3d3d);
        break;
    }
  }
}

export { NaoMaterialFactory };
