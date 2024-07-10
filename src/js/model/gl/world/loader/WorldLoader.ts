import { Agent } from '../Agent';
import { Ball } from '../Ball';
import { Field } from '../Field';
import { NaoModelFactory } from '../robots/nao/NaoModelFactory';
import { ParameterMap } from '../../../game/utils/ParameterMap';
import { IRobotModelFactory } from '../robots/IRobotModelFactory';
import { SoccerBot2DModelFactory } from '../robots/soccerbot2d/SoccerBot2DModelFactory';
import { Team } from '../Team';
import { RobotModel } from '../RobotModel';
import { TeamDescription } from '../../../game/TeamDescription';
import { WorldModelFactory } from './WorldModelFactory';
import { SimulationType, TeamSide } from '../../../game/utils/GameUtil';
import { Scene, Vector2, Vector3 } from 'three';

/**
 * The WorldLoader class definition.
 *
 * @author Stefan Glaser
 */
class WorldLoader
{
  /** The world model factory for 2D and 3D simulation environments. */
  worldModelFactory: WorldModelFactory;

  /** The list of robot model factories for 2D simulation models. */
  modelFactories2D: IRobotModelFactory[];

  /** The list of robot model factories for 3D simulation models. */
  modelFactories3D: IRobotModelFactory[];

  /**
   * WorldLoader Constructor
   */
  constructor ()
  {
    this.worldModelFactory = new WorldModelFactory();
    this.modelFactories2D = [new SoccerBot2DModelFactory()];
    this.modelFactories3D = [new NaoModelFactory()];
  }

  /**
   * Register a new robot model factory.
   * 
   * @param type the world type (2D or 3D)
   * @param factory the robot model factory to add
   */
  registerModelFactory (type: SimulationType, factory: IRobotModelFactory): void
  {
    switch (type) {
      case SimulationType.TWOD: this.modelFactories2D.push(factory); break;
      case SimulationType.THREED: this.modelFactories3D.push(factory); break;
      default: console.log('Unknown game type: ' + type); break;
    }
  }

  /**
   * Dispose all resources allocated within this instance.
   */
  dispose (): void {}

  /**
   * Create a new default world scene representation, containing a sky-box and standard lighting.
   *
   * @return the new world scene object
   */
  create (): Scene
  {
    const scene = new Scene();
    scene.name = 'soccerScene';

    this.worldModelFactory.createScene(scene);

    return scene;
  }

  /**
   * Create a ball representation.
   *
   * @param ball the ball representation
   */
  createBall (ball: Ball): void
  {
    this.worldModelFactory.createBall(ball);
  }

  /**
   * Update the scene representation.
   *
   * @param scene the scene instance
   * @param fieldDimensions the field dimensions
   */
  updateScene (scene: Scene, fieldDimensions: Vector2): void
  {
    this.worldModelFactory.updateScene(scene, fieldDimensions);
  }

  /**
   * Update the field representation for the given field instance.
   * This function places and rescales the field and border objects according to the field dimensions.
   * Furthermore, a new set of field lines is created.
   *
   * @param field the field instance
   */
  updateField (field: Field): void
  {
    this.worldModelFactory.updateField(field);
  }

  /**
   * Load a team representation.
   * This method can be called repeatedly to load additional agents to a team,
   * as well as additional robot models to all agents of the team (this comes handy for streaming).
   *
   * @param type the world type (2D or 3D)
   * @param team the team representation
   * @param environmentParams the environment parameter
   * @param playerParams the player paraméter
   * @returns the given team
   */
  loadTeam (type: SimulationType, team: Team, environmentParams: ParameterMap, playerParams: ParameterMap): Team
  {
    const teamDescription = team.description;

    for (let i = 0; i < teamDescription.agents.length; ++i) {
      let agent = team.agents[i];

      // Create agent representation if not yet present
      if (agent === undefined) {
        agent = new Agent(teamDescription.agents[i]);
        team.agents[i] = agent;
        team.objGroup.add(agent.objGroup);
      }

      // Create robot models for agent if not yet present
      for (let j = 0; j < agent.description.playerTypes.length; ++j) {
        if (agent.models[j] === undefined) {
          const model = this.createModel(type,
                                         agent.description.playerTypes[j],
                                         teamDescription.side,
                                         agent.description.playerNo,
                                         environmentParams,
                                         playerParams);

          if (model) {
            agent.models[j] = model;
            agent.models[j].setTeamColor(team.color);
            agent.objGroup.add(agent.models[j].objGroup);
          }
        }
      }
    }

    return team;
  }

  /**
   * Load a team representation.
   * This method can be called repeatedly to load additional agents to a team,
   * as well as additional robot models to all agents of the team (this comes handy for streaming).
   *
   * @param simType the world type (2D or 3D)
   * @param playerType the player type
   * @param side the team side
   * @param playerNo the player number
   * @param environmentParams the environment paraméter
   * @param playerParams the player parameter
   * @returns the new robot model, or undefined in case of an unknown model
   */
  createModel (simType: SimulationType, playerType: ParameterMap, side: TeamSide, playerNo: number, environmentParams: ParameterMap, playerParams: ParameterMap): RobotModel | undefined
  {
    const modelFactories = simType === SimulationType.TWOD ? this.modelFactories2D : this.modelFactories3D;
    let i = modelFactories.length;
    let model: RobotModel | undefined;

    while (i--) {
      model = modelFactories[i].createModel(playerType, side, playerNo, environmentParams, playerParams);

      if (model) {
        break;
      }
    }

    return model;
  }
}

export { WorldLoader };
