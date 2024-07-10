import { ParameterObject, ParameterMap } from './ParameterMap';

/**
 * Simple helper for SimSpark simulator.
 *
 * @author Stefan Glaser
 */
class SparkUtil
{
  /**
   * Create a new environment parameters object with default values set for 3D games.
   *
   * @returns a parameter map object initialized with the default environment parameters
   */
  static createDefaultEnvironmentParams (): ParameterMap
  {
    return SparkUtil.createEnvironmentParamsV66();
  }

  /**
   * Create a new set of environment parameters for SimSpark version 62.
   *
   * @returns a parameter map object initialized with version 6.2 environment parameters
   */
  static createEnvironmentParamsV62 (): ParameterMap
  {
    const params:ParameterObject = {};

    params[Environment3DParams.LOG_STEP] = 200;

    // Default parameters for version 66
    params[Environment3DParams.FIELD_LENGTH] = 12;
    params[Environment3DParams.FIELD_WIDTH] = 8;
    params[Environment3DParams.FIELD_HEIGHT] = 40;
    params[Environment3DParams.GOAL_WIDTH] = 1.4;
    params[Environment3DParams.GOAL_DEPTH] = 0.4;
    params[Environment3DParams.GOAL_HEIGHT] = 0.8;
    params[Environment3DParams.FREE_KICK_DISTANCE] = 1;
    params[Environment3DParams.AGENT_RADIUS] = 0.4;
    params[Environment3DParams.BALL_RADIUS] = 0.042;
    params[Environment3DParams.RULE_HALF_TIME] = 300;

    return new ParameterMap(params);
  }

  /**
   * Create a new set of environment parameters for SimSpark version 63.
   *
   * @returns a parameter map object initialized with version 6.3 environment parameters
   */
  static createEnvironmentParamsV63 (): ParameterMap
  {
    const paramMap = SparkUtil.createEnvironmentParamsV62();

    // Default parameters for version 66
    paramMap.paramObj[Environment3DParams.FIELD_LENGTH] = 18;
    paramMap.paramObj[Environment3DParams.FIELD_WIDTH] = 12;

    paramMap.paramObj[Environment3DParams.GOAL_WIDTH] = 2.1;
    paramMap.paramObj[Environment3DParams.GOAL_DEPTH] = 0.6;

    paramMap.paramObj[Environment3DParams.FREE_KICK_DISTANCE] = 1.8;

    return paramMap;
  }

  /**
   * Create a new set of environment parameters for SimSpark version 64.
   *
   * @returns a parameter map object initialized with version 6.4 environment parameters
   */
  static createEnvironmentParamsV64 (): ParameterMap
  {
    const paramMap = SparkUtil.createEnvironmentParamsV63();

    // Default parameters for version 66
    paramMap.paramObj[Environment3DParams.FIELD_LENGTH] = 21;
    paramMap.paramObj[Environment3DParams.FIELD_WIDTH] = 14;

    return paramMap;
  }

  /**
   * Create a new set of environment parameters for SimSpark version 66.
   *
   * @returns a parameter map object initialized with version 6.6 environment parameters
   */
  static createEnvironmentParamsV66 (): ParameterMap
  {
    const paramMap = SparkUtil.createEnvironmentParamsV63();

    // Default parameters for version 66
    paramMap.paramObj[Environment3DParams.FIELD_LENGTH] = 30;
    paramMap.paramObj[Environment3DParams.FIELD_WIDTH] = 20;

    paramMap.paramObj[Environment3DParams.FREE_KICK_DISTANCE] = 2;

    return paramMap;
  }

  /**
   * Create a new player parameters object with default values set for 3D games.
   *
   * @returns a parameter map object initialized with the default player parameters
   */
  static createDefaultPlayerParams (): ParameterMap
  {
    const params:ParameterObject = {};

    return new ParameterMap(params);
  }

  /**
   * Create a new list of default player type parameter objects for 3D games.
   *
   * @returns an array of parameter map objects initialized with the default player type parameters
   */
  static createDefaultPlayerTypeParams (): ParameterMap[]
  {
    const types:ParameterMap[] = [];

    // Create nao_hetero0 to nao_hetero4 player types
    for (let i = 0; i < 5; i++) {
      types[i] = new ParameterMap();
      types[i].paramObj[PlayerType3DParams.MODEL_NAME] = 'nao_hetero';
      types[i].paramObj[PlayerType3DParams.MODEL_TYPE] = i;
    }

    return types;
  }
}

export { SparkUtil };

/**
 * An enum providing meaning the indices for the different elements in the agent flags bitfield for 3D games.
 */
export const enum Agent3DFlags {
    CROWDING =        0x00000001,
    TOUCHING =        0x00000002,
    ILLEGAL_DEFENCE = 0x00000004,
    ILLEGAL_ATTACK =  0x00000008,
    INCAPABLE =       0x00000010,
    ILLEGAL_KICKOFF = 0x00000020,
    CHARGING =        0x00000040,
}

/**
 * An enum providing known environment parameter names for 3D games.
 */
export const enum Environment3DParams {
  LOG_STEP = 'log_step',

  FIELD_LENGTH = 'FieldLength',
  FIELD_WIDTH = 'FieldWidth',
  FIELD_HEIGHT = 'FieldHeight',
  GOAL_WIDTH = 'GoalWidth',
  GOAL_DEPTH = 'GoalDepth',
  GOAL_HEIGHT = 'GoalHeight',
  BORDER_SIZE = 'BorderSize',
  FREE_KICK_DISTANCE = 'FreeKickDistance',
  WAIT_BEFORE_KICK_OFF = 'WaitBeforeKickOff',
  AGENT_MASS = 'AgentMass',
  AGENT_RADIUS = 'AgentRadius',
  AGENT_MAX_SPEED = 'AgentMaxSpeed',
  BALL_RADIUS = 'BallRadius',
  BALL_MASS = 'BallMass',
  RULE_GOAL_PAUSE_TIME = 'RuleGoalPauseTime',
  RULE_KICK_IN_PAUSE_TIME = 'RuleKickInPauseTime',
  RULE_HALF_TIME = 'RuleHalfTime',
  PLAY_MODES = 'play_modes'
};

/**
 * An enum providing known player parameter names for 3D games.
 */
export const enum Player3DParams {
  NONE = 'none'
}

/**
 * An enum providing known player type parameter names for 3D games.
 */
export const enum PlayerType3DParams {
  MODEL_NAME = 'model',
  MODEL_TYPE = 'model_type'
}
