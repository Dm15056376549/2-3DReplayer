import { EventDispatcher, GEventObject } from '../../../utils/EventDispatcher';
import { Ball } from './Ball';
import { Field } from './Field';
import { ParameterMap } from '../../game/utils/ParameterMap';
import { Team } from './Team';
import { WorldLoader } from './loader/WorldLoader';
import { WorldState } from '../../game/WorldState';
import { TeamDescription } from '../../game/TeamDescription';
import { SimulationType, TeamSide } from '../../game/utils/GameUtil';
import { Color, Scene, Vector3 } from 'three';

/** The world event map interface. */
export interface WorldModelEventMap {
  'change': GEventObject;
}

/**
 * The World class definition.
 *
 * @author Stefan Glaser
 */
class World extends EventDispatcher<WorldModelEventMap>
{
  /** The world loader ins */
  worldLoader: WorldLoader;

  /** The simulation type. */
  type: SimulationType;

  /** The list of server/simulation parameter. */
  environmentParams: ParameterMap;

  /** The list of player parameter. */
  playerParams: ParameterMap;

  /** The list of player types. */
  playerTypes: ParameterMap[];

  /** The world scene. */
  scene: Scene;

  /** The soccer field. */
  field: Field;

  /** The soccer ball. */
  ball: Ball;

  /** The left team. */
  leftTeam: Team;

  /** The right team. */
  rightTeam: Team;

  /** The world bounds. */
  boundingBox: Vector3;

  /**
   * World Constructor
   *
   * ::implements {IPublisher}
   * ::implements {IEventDispatcher}
   */
  constructor()
  {
    super();

    this.worldLoader = new WorldLoader();
    this.type = SimulationType.TWOD;
    this.environmentParams = new ParameterMap();
    this.playerParams = new ParameterMap();
    this.playerTypes = [];
    this.scene = this.worldLoader.create();
    
    // Create field representation
    this.field = new Field();
    this.scene.add(this.field.objGroup);
    this.worldLoader.updateField(this.field);

    // Create ball representation
    this.ball = new Ball();
    this.scene.add(this.ball.objGroup);
    this.scene.add(this.ball.objTwoDGroup);
    this.worldLoader.createBall(this.ball);

    // Create left team representation
    this.leftTeam = new Team(new TeamDescription('left', new Color('#0000ff'), TeamSide.LEFT));
    this.scene.add(this.leftTeam.objGroup);

    // Create right team representation
    this.rightTeam = new Team(new TeamDescription('right', new Color('#ff0000'), TeamSide.RIGHT));
    this.scene.add(this.rightTeam.objGroup);

    this.boundingBox = new Vector3(512, 512, 512);
  }

  /**
   * Dispose this world.
   */
  dispose (): void
  {
    // TODO: Dispose threejs scene and other objects
    this.worldLoader.dispose();
  }

  /**
   * Create a (new) world representation for the given game log and update this world instance accordingsly.
   *
   * @param type the world (replay) type (2D or 3D)
   * @param environmentParams the environment paraméter
   * @param playerParams the player parameter
   * @param playerTypes the player types list
   * @param leftTeamDescription the left team description
   * @param rightTeamDescription the right team description
   */
  create (type: SimulationType, environmentParams: ParameterMap, playerParams: ParameterMap, playerTypes: ParameterMap[], leftTeamDescription: TeamDescription, rightTeamDescription: TeamDescription): void
  {
    // Update parameters
    this.type = type;
    this.environmentParams = environmentParams;
    this.playerParams = playerParams;
    this.playerTypes = playerTypes;


    // Update field representation
    this.field.set(type, this.environmentParams);
    this.worldLoader.updateField(this.field);


    // Resize ball
    // let ballRadius = environmentParams[Environment2DParams.BALL_SIZE] as number;
    // if (!ballRadius) {
    //   ballRadius = type === SimulationType.TWOD ? 0.2 : 0.042;
    // }
    this.ball.setRadius(type === SimulationType.TWOD ? 0.2 : 0.042);


    // Reset and load teams
    this.leftTeam.set(leftTeamDescription);
    this.rightTeam.set(rightTeamDescription);
    this.updateTeams(type);


    // Update light shadow cone to closely match field
    this.worldLoader.updateScene(this.scene, this.field.fieldDimensions);


    // Publish change event
    this.dispatchEvent('change', {});
  }

  /**
   * Update representations of teams.
   *
   * @param type the world (replay) type (2D or 3D)
   */
  updateTeams (type: SimulationType): void
  {
    // Reload teams
    this.worldLoader.loadTeam(type, this.leftTeam, this.environmentParams, this.playerParams);
    this.worldLoader.loadTeam(type, this.rightTeam, this.environmentParams, this.playerParams);
  }

  /**
   * Update world objects.
   *
   * @param state the current world state
   * @param nextState the next world state
   * @param t the interpolation time
   */
  update (state: WorldState, nextState: WorldState, t: number): void
  {
    this.ball.update(state.ballState, nextState.ballState, t);

    this.leftTeam.update(state.leftAgentStates, nextState.leftAgentStates, t);
    this.rightTeam.update(state.rightAgentStates, nextState.rightAgentStates, t);
  }

  /**
   * Enable or disable shaddows.
   *
   * @param enabled true to enable shadows, false to disable
   */
  setShadowsEnabled (enabled: boolean): void
  {
    let i = this.scene.children.length;

    while (i--) {
      const child = this.scene.children[i];

      if (child.type == 'DirectionalLight' ||
          child.type == 'PointLight' ||
          child.type == 'SpotLight') {
        child.castShadow = enabled;
      }
    }
  }
}

export { World };
