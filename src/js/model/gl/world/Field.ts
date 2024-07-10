import { ParameterMap } from '../../game/utils/ParameterMap';
import { Environment3DParams } from '../../game/utils/SparkUtil';
import { SimulationType } from '../../game/utils/GameUtil';
import { Object3D, Vector2, Vector3 } from 'three';

/**
 * The Field class definition.
 *
 * @author Stefan Glaser
 */
class Field
{
  /** The field object group */
  objGroup: Object3D;

  /** The dimensions of the field */
  fieldDimensions: Vector2;

  /** The radius of the center circle */
  centerRadius: number;

  /** The dimensions of the goals */
  goalDimensions: Vector3;

  /** The dimensions of the goal area */
  goalAreaDimensions: Vector2;

  /** The dimensions of the penalty area + penalty kick spot */
  penaltyAreaDimensions?: Vector3;

  /** The field texture repeat. */
  textureRepeat?: number;

  /** The width of the field lines. */
  lineWidth: number;

  /**
   * Field Constructor
   *
   * @param fieldDimensions the dimensions of the soccer pitch
   * @param centerRadius the center circle raduis
   * @param goalDimensions the dimensions of the goals
   * @param goalAreaDimensions the dimensions of the goal areas
   * @param penaltyAreaDimensions the dimensions of the penalty area + penalty kick spot
   */
  constructor (fieldDimensions: Vector2 = new Vector2(105, 68),
               centerRadius: number = 9.15,
               goalDimensions: Vector3 = new Vector3(1.2, 14.64, 1.5),
               goalAreaDimensions: Vector2 = new Vector2(5.5, 18.32),
               penaltyAreaDimensions: Vector3 = new Vector3(16.5, 40.3, 11))
  {
    this.objGroup = new Object3D();
    this.objGroup.name = 'field';

    this.fieldDimensions = fieldDimensions;
    this.centerRadius = centerRadius;
    this.goalDimensions = goalDimensions;
    this.goalAreaDimensions = goalAreaDimensions;
    this.penaltyAreaDimensions = penaltyAreaDimensions;
    this.textureRepeat = 10;
    this.lineWidth = 0.15;
  }

  /**
   * Set the field properties based on the given environement parameter map.
   *
   * @param type the simulation type (2D or 3D)
   * @param environmentParams the environment parameter map
   */
  set (type: SimulationType, environmentParams: ParameterMap): void
  {
    if (type === SimulationType.TWOD) {
      this.fieldDimensions = new Vector2(105, 68);
      this.centerRadius = 9.15;
      this.goalDimensions = new Vector3(1.2, 14.64, 1.5);
      this.goalAreaDimensions = new Vector2(5.5, 18.32);
      this.penaltyAreaDimensions = new Vector3(16.5, 40.3, 11);
      this.lineWidth = 0.15;
    } else {
      // Read field dimensions
      const fieldLength = environmentParams.getNumber(Environment3DParams.FIELD_LENGTH);
      const fieldWidth = environmentParams.getNumber(Environment3DParams.FIELD_WIDTH);
      // const fieldHeight = environmentParams.getNumber(Environment3DParams.FIELD_HEIGHT);
      if (!!fieldLength && !!fieldWidth) {
        this.fieldDimensions.set(fieldLength, fieldWidth);
      } else {
        this.fieldDimensions.set(30, 20);
      }

      // Read free kick distance (used for center circle radius)
      const freeKickDistance = environmentParams.getNumber(Environment3DParams.FREE_KICK_DISTANCE);
      if (!!freeKickDistance) {
        this.centerRadius = freeKickDistance;
      } else {
        this.centerRadius = 2;
      }

      // Read goal dimensions
      const goalWidth = environmentParams.getNumber(Environment3DParams.GOAL_WIDTH);
      const goalDepth = environmentParams.getNumber(Environment3DParams.GOAL_DEPTH);
      const goalHeight = environmentParams.getNumber(Environment3DParams.GOAL_HEIGHT);
      if (!!goalDepth && !!goalWidth && !!goalHeight) {
        this.goalDimensions.set(goalDepth, goalWidth, goalHeight);
      } else {
        this.goalDimensions.set(0.6, 2.1, 0.8);
      }

      // Clear penalty area and set goal area and line width based on field size
      this.penaltyAreaDimensions = undefined;

      if (this.fieldDimensions.x < 15) {
        this.goalAreaDimensions.set(1.2, 4);
        this.lineWidth = 0.03;
      } else {
        this.goalAreaDimensions.set(1.8, 6);
        this.lineWidth = 0.04;
      }
    }

    this.textureRepeat = this.fieldDimensions.x > 50 ? 10 : undefined;
  }

  /**
   * Check if this world parameters define a penalty area.
   *
   * @returns true, if there exists a definition for the penalty area, false otherwise
   */
  hasPenaltyArea (): boolean
  {
    return !!this.penaltyAreaDimensions;
  }
}

export { Field };
