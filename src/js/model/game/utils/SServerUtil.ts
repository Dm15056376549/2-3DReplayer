import { ParameterObject, ParameterMap } from './ParameterMap';

/**
 * Simple helper for 2D league.
 *
 * @author Stefan Glaser
 */
class SServerUtil
{
  /**
   * Create a set of default environment parameters.
   *
   * @returns a list of default environment parameters
   */
  static createDefaultEnvironmentParams (): ParameterMap
  {
    const params:ParameterObject = {};

    params[Environment2DParams.SIMULATOR_STEP] = 100;

    return new ParameterMap(params);
  }

  /**
   * Create a set of default player parameters.
   *
   * @returns a list of default player parameters
   */
  static createDefaultPlayerParams (): ParameterMap
  {
    const params:ParameterObject = {};

    params[Player2DParams.PLAYER_TYPES] = 1;

    return new ParameterMap(params);
  }

  /**
   * Create a set of default player types.
   *
   * @returns a list of default player types
   */
  static createDefaultPlayerTypeParams (): ParameterMap[]
  {
    const types:ParameterMap[] = [];

    types[0] = new ParameterMap();
    types[0].paramObj[PlayerType2DParams.PLAYER_SIZE] = 0.3;

    return types;
  }
}

export { SServerUtil };

/**
 * An enum providing meaning the indices for the different elements in the agent flags bitfield for 2D games.
 */
export const enum Agent2DFlags {
    DISABLE =         0x00000000,
    STAND =           0x00000001,
    KICK =            0x00000002,
    KICK_FAULT =      0x00000004,
    GOALIE =          0x00000008,
    CATCH =           0x00000010,
    CATCH_FAULT =     0x00000020,
    BALL_TO_PLAYER =  0x00000040,
    PLAYER_TO_BALL =  0x00000080,
    DISCARD =         0x00000100,
    LOST =            0x00000200,
    BALL_COLLIDE =    0x00000400,
    PLAYER_COLLIDE =  0x00000800,
    TACKLE =          0x00001000,
    TACKLE_FAULT =    0x00002000,
    BACK_PASS =       0x00004000,
    FREE_KICK_FAULT = 0x00008000,
    POST_COLLIDE =    0x00010000,
    FOUL_CHARGED =    0x00020000,
    YELLOW_CARD =     0x00040000,
    RED_CARD =        0x00080000,
}

/**
 * An enum providing meaning the indices for the different elements in the agent data array for 2D games.
 */
export const enum Agent2DData {
  STAMINA = 0,
  STAMINA_EFFORT = 1,
  STAMINA_RECOVERY = 2,
  STAMINA_CAPACITY = 3,

  VIEW_QUALITY = 4,
  VIEW_WIDTH = 5,

  FOCUS_SIDE = 6,
  FOCUS_UNUM = 7,

  KICK_COUNT = 8,
  DASH_COUNT = 9,
  TURN_COUNT = 10,
  CATCH_COUNT = 11,
  MOVE_COUNT = 12,
  TURN_NECK_COUNT = 13,
  VIEW_COUNT = 14,
  SAY_COUNT = 15,
  TACKLE_COUNT = 16,
  POINT_TO_COUNT = 17,
  ATTENTION_COUNT = 18
}

/**
 * An enum providing meaning the indices for the different elements in the environement parameter array for 2D games.
 */
export const enum Environment2DParams {
  GOAL_WIDTH = 'goal_width',
  INERTIA_MOMENT = 'inertia_moment',
  PLAYER_SIZE = 'player_size',
  PLAYER_DECAY = 'player_decay',
  PLAYER_RAND = 'player_rand',
  PLAYER_WEIGHT = 'player_weight',
  PLAYER_SPEED_MAX = 'player_speed_max',
  PLAYER_ACCEL_MAX = 'player_accel_max',
  STAMINA_MAX = 'stamina_max',
  STAMINA_INC_MAX = 'stamina_inc_max',
  RECOVER_INIT = 'recover_init',
  RECOVER_DEC_THR = 'recover_dec_thr',
  RECOVER_MIN = 'recover_min',
  RECOVER_DEC = 'recover_dec',
  EFFORT_INIT = 'effort_init',
  EFFORT_DEC_THR = 'effort_dec_thr',
  EFFORT_MIN = 'effort_min',
  EFFORT_DEC = 'effort_dec',
  EFFORT_INC_THR = 'effort_inc_thr',
  EFFORT_INC = 'effort_inc',
  KICK_RAND = 'kick_rand',
  TEAM_ACTUATOR_NOISE = 'team_actuator_noise',
  PLAYER_RAND_FACTOR_L = 'prand_factor_l',
  PLAYER_RAND_FACTOR_R = 'prand_factor_r',
  KICK_RAND_FACTOR_L = 'kick_rand_factor_l',
  KICK_RAND_FACTOR_R = 'kick_rand_factor_r',
  BALL_SIZE = 'ball_size',
  BALL_DECAY = 'ball_decay',
  BALL_RAND = 'ball_rand',
  BALL_WEIGHT = 'ball_weight',
  BALL_SPEED_MAX = 'ball_speed_max',
  BALL_ACCEL_MAX = 'ball_accel_max',
  DASH_POWER_RATE = 'dash_power_rate',
  KICK_POWER_RATE = 'kick_power_rate',
  KICKABLE_MARGIN = 'kickable_margin',
  CONTROL_RADIUS = 'control_radius',
  CONTROL_RADIUS_WIDTH = 'control_radius_width',
  CATCH_PROBABILITY = 'catch_probability',
  CATCHABLE_AREA_L = 'catchable_area_l',
  CATCHABLE_AREA_W = 'catchable_area_w',
  GOALIE_MAX_MOVES = 'goalie_max_moves',
  MAX_POWER = 'maxpower',
  MIN_POWER = 'minpower',
  MAX_MOMENT = 'maxmoment',
  MIN_MOMENT = 'minmoment',
  MAX_NECK_MOMENT = 'maxneckmoment',
  MIN_NECK_MOMENT = 'minneckmoment',
  MAX_NECK_ANGLE = 'maxneckang',
  MIN_NECK_ANGLE = 'minneckang',
  VISIBLE_ANGLE = 'visible_angle',
  VISIBLE_DISTANCE = 'visible_distance',
  AUDIO_CUT_DIST = 'audio_cut_dist',
  QUANTIZE_STEP = 'quantize_step',
  LANDMARK_QUANTIZE_STEP = 'quantize_step_l',
  CORNER_KICK_MARGIN = 'ckick_margin',
  WIND_DIR = 'wind_dir',
  WIND_FORCE = 'wind_force',
  WIND_ANGLE = 'wind_ang',
  WIND_RAND = 'wind_rand',
  WIND_NONE = 'wind_none',
  WIND_RANDOM = 'wind_random',
  HALF_TIME = 'half_time',
  DROP_BALL_TIME = 'drop_ball_time',
  PORT = 'port',
  COACH_PORT = 'coach_port',
  ONLINE_COACH_PORT = 'olcoach_port',
  SAY_COACH_COUNT_MAX = 'say_coach_cnt_max',
  SAY_COACH_MSG_SIZE = 'say_coach_msg_size',
  SIMULATOR_STEP = 'simulator_step',
  SEND_STEP = 'send_step',
  RECV_STEP = 'recv_step',
  SENSE_BODY_STEP = 'sense_body_step',
  SAY_MSG_SIZE = 'say_msg_size',
  CLANG_WIN_SIZE = 'clang_win_size',
  CLANG_DEFINE_WIN = 'clang_define_win',
  CLANG_META_WIN = 'clang_meta_win',
  CLANG_ADVICE_WIN = 'clang_advice_win',
  CLANG_INFO_WIN = 'clang_info_win',
  CLANG_DEL_WIN = 'clang_del_win',
  CLANG_RULE_WIN = 'clang_rule_win',
  CLANG_MESS_DELAY = 'clang_mess_delay',
  CLANG_MESS_PER_CYCLE = 'clang_mess_per_cycle',
  HEAR_MAX = 'hear_max',
  HEAR_INC = 'hear_inc',
  HEAR_DECAY = 'hear_decay',
  CATCH_BAN_CYCLE = 'catch_ban_cycle',
  COACH_MODE = 'coach',
  COACH_WITH_REFEREE_MODE = 'coach_w_referee',
  OLD_COACH_HEAR = 'old_coach_hear',
  SEND_VI_STEP = 'send_vi_step',
  USE_OFFSIDE = 'use_offside',
  OFFSIDE_ACTIVE_AREA_SIZE = 'offside_active_area_size',
  FORBID_KICK_OFF_OFFSIDE = 'forbid_kick_off_offside',
  VERBOSE = 'verbose',
  OFFSIDE_KICK_MARGIN = 'offside_kick_margin',
  SLOW_DOWN_FACTOR = 'slow_down_factor',
  SYNCH_MODE = 'synch_mode',
  SYNCH_OFFSET = 'synch_offset',
  SYNCH_MICRO_SLEEP = 'synch_micro_sleep',
  START_GOAL_L = 'start_goal_l',
  START_GOAL_R = 'start_goal_r',
  FULLSTATE_L = 'fullstate_l',
  FULLSTATE_R = 'fullstate_r',
  SLOWNESS_ON_TOP_FOR_LEFT_TEAM = 'slowness_on_top_for_left_team',
  SLOWNESS_ON_TOP_FOR_RIGHT_TEAM = 'slowness_on_top_for_right_team',
  LANDMARK_FILE = 'landmark_file',
  SEND_COMMS = 'send_comms',
  TEXT_LOGGING = 'text_logging',
  GAME_LOGGING = 'game_logging',
  GAME_LOG_VERSION = 'game_log_version',
  TEXT_LOG_DIR = 'text_log_dir',
  GAME_LOG_DIR = 'game_log_dir',
  TEXT_LOG_FIXED_NAME = 'text_log_fixed_name',
  GAME_LOG_FIXED_NAME = 'game_log_fixed_name',
  TEXT_LOG_FIXED = 'text_log_fixed',
  GAME_LOG_FIXED = 'game_log_fixed',
  TEXT_LOG_DATED = 'text_log_dated',
  GAME_LOG_DATED = 'game_log_dated',
  LOG_DATE_FORMAT = 'log_date_format',
  LOG_TIMES = 'log_times',
  RECORD_MESSAGES = 'record_messages',
  TEXT_LOG_COMPRESSION = 'text_log_compression',
  GAME_LOG_COMPRESSION = 'game_log_compression',
  PROFILE = 'profile',
  POINT_TO_BAN = 'point_to_ban',
  POINT_TO_DURATION = 'point_to_duration',
  TACKLE_DIST = 'tackle_dist',
  TACKLE_BACK_DIST = 'tackle_back_dist',
  TACKLE_WIDTH = 'tackle_width',
  TACKLE_EXPONENT = 'tackle_exponent',
  TACKLE_CYCLES = 'tackle_cycles',
  TACKLE_POWER_RATE = 'tackle_power_rate',
  FREEFORM_WAIT_PERIOD = 'freeform_wait_period',
  FREEFORM_SEND_PERIOD = 'freeform_send_period',
  FREE_KICK_FAULTS = 'free_kick_faults',
  BACK_PASSES = 'back_passes',
  PROPER_GOAL_KICKS = 'proper_goal_kicks',
  STOPPED_BALL_VEL = 'stopped_ball_vel',
  MAX_GOAL_KICKS = 'max_goal_kicks',
  AUTO_MODE = 'auto_mode',
  KICK_OFF_WAIT = 'kick_off_wait',
  CONNECT_WAIT = 'connect_wait',
  GAME_OVER_WAIT = 'game_over_wait',
  TEAM_L_START = 'team_l_start',
  TEAM_R_START = 'team_r_start',
  KEEPAWAY_MODE = 'keepaway',
  KEEPAWAY_LENGTH = 'keepaway_length',
  KEEPAWAY_WIDTH = 'keepaway_width',
  KEEPAWAY_LOGGING = 'keepaway_logging',
  KEEPAWAY_LOG_DIR = 'keepaway_log_dir',
  KEEPAWAY_LOG_FIXED_NAME = 'keepaway_log_fixed_name',
  KEEPAWAY_LOG_FIXED = 'keepaway_log_fixed',
  KEEPAWAY_LOG_DATED = 'keepaway_log_dated',
  KEEPAWAY_START = 'keepaway_start',
  NR_NORMAL_HALFS = 'nr_normal_halfs',
  NR_EXTRA_HALFS = 'nr_extra_halfs',
  PENALTY_SHOOT_OUTS = 'penalty_shoot_outs',
  PEN_BEFORE_SETUP_WAIT = 'pen_before_setup_wait',
  PEN_SETUP_WAIT = 'pen_setup_wait',
  PEN_READY_WAIT = 'pen_ready_wait',
  PEN_TAKEN_WAIT = 'pen_taken_wait',
  PEN_NR_KICKS = 'pen_nr_kicks',
  PEN_MAX_EXTRA_KICKS = 'pen_max_extra_kicks',
  PEN_DIST_X = 'pen_dist_x',
  PEN_RANDOM_WINNER = 'pen_random_winner',
  PEN_MAX_GOALIE_DIST_X = 'pen_max_goalie_dist_x',
  PEN_ALLOW_MULT_KICKS = 'pen_allow_mult_kicks',
  PEN_COACH_MOVES_PLAYERS = 'pen_coach_moves_players',
  BALL_STUCK_AREA = 'ball_stuck_area',
  COACH_MSG_FILE = 'coach_msg_file',
  MAX_TACKLE_POWER = 'max_tackle_power',
  MAX_BACK_TACKLE_POWER = 'max_back_tackle_power',
  PLAYER_SPEED_MAX_MIN = 'player_speed_max_min',
  EXTRA_STAMINA = 'extra_stamina',
  SYNCH_SEE_OFFSET = 'synch_see_offset',
  MAX_MONITORS = 'max_monitors',
  EXTRA_HALF_TIME = 'extra_half_time',
  STAMINA_CAPACITY = 'stamina_capacity',
  MAX_DASH_ANGLE = 'max_dash_angle',
  MIN_DASH_ANGLE = 'min_dash_angle',
  DASH_ANGLE_STEP = 'dash_angle_step',
  SIDE_DASH_RATE = 'side_dash_rate',
  BACK_DASH_RATE = 'back_dash_rate',
  MAX_DASH_POWER = 'max_dash_power',
  MIN_DASH_POWER = 'min_dash_power',
  TACKLE_RAND_FACTOR = 'tackle_rand_factor',
  FOUL_DETECT_PROBABILITY = 'foul_detect_probability',
  FOUL_EXPONENT = 'foul_exponent',
  FOUL_CYCLES = 'foul_cycles',
  GOLDEN_GOAL = 'golden_goal',
  RED_CARD_PROBABILITY = 'red_card_probability'
}

/**
 * An enum providing meaning the indices for the different elements in the player parameter array for 2D games.
 */
export const enum Player2DParams {
  PLAYER_TYPES = 'player_types',
  SUBS_MAX = 'subs_max',
  PT_MAX = 'pt_max',
  ALLOW_MULT_DEFAULT_TYPE = 'allow_mult_default_type',
  PLAYER_SPEED_MAX_DELTA_MIN = 'player_speed_max_delta_min',
  PLAYER_SPEED_MAX_DELTA_MAX = 'player_speed_max_delta_max',
  STAMINA_INC_MAX_DELTA_FACTOR = 'stamina_inc_max_delta_factor',
  PLAYER_DECAY_DELTA_MIN = 'player_decay_delta_min',
  PLAYER_DECAY_DELTA_MAX = 'player_decay_delta_max',
  INERTIA_MOMENT_DELTA_FACTOR = 'inertia_moment_delta_factor',
  DASH_POWER_RATE_DELTA_MIN = 'dash_power_rate_delta_min',
  DASH_POWER_RATE_DELTA_MAX = 'dash_power_rate_delta_max',
  PLAYER_SIZE_DELTA_FACTOR = 'player_size_delta_factor',
  KICKABLE_MARGIN_DELTA_MIN = 'kickable_margin_delta_min',
  KICKABLE_MARGIN_DELTA_MAX = 'kickable_margin_delta_max',
  KICK_RAND_DELTA_FACTOR = 'kick_rand_delta_factor',
  EXTRA_STAMINA_DELTA_MIN = 'extra_stamina_delta_min',
  EXTRA_STAMINA_DELTA_MAX = 'extra_stamina_delta_max',
  EFFORT_MAX_DELTA_FACTOR = 'effort_max_delta_factor',
  EFFORT_MIN_DELTA_FACTOR = 'effort_min_delta_factor',
  NEW_DASH_POWER_RATE_DELTA_MIN = 'new_dash_power_rate_delta_min',
  NEW_DASH_POWER_RATE_DELTA_MAX = 'new_dash_power_rate_delta_max',
  NEW_STAMINA_INC_MAX_DELTA_FACTOR = 'new_stamina_inc_max_delta_factor',
  RANDOM_SEED = 'random_seed',
  KICK_POWER_RATE_DELTA_MIN = 'kick_power_rate_delta_min',
  KICK_POWER_RATE_DELTA_MAX = 'kick_power_rate_delta_max',
  FOUL_DETECT_PROBABILITY_DELTA_FACTOR = 'foul_detect_probability_delta_factor',
  CATCHABLE_AREA_L_STRETCH_MIN = 'catchable_area_l_stretch_min',
  CATCHABLE_AREA_L_STRETCH_MAX = 'catchable_area_l_stretch_max'
}

/**
 * An enum providing meaning the indices for the different elements in the player type arrays for 2D games.
 */
export const enum PlayerType2DParams {
  ID = 'id',
  PLAYER_SPEED_MAX = 'player_speed_max',
  STAMINA_INC_MAX = 'stamina_inc_max',
  PLAYER_DECAY = 'player_decay',
  INERTIA_MOMENT = 'inertia_moment',
  DASH_POWER_RATE = 'dash_power_rate',
  PLAYER_SIZE = 'player_size',
  KICKABLE_MARGIN = 'kickable_margin',
  KICK_RAND = 'kick_rand',
  EXTRA_STAMINA = 'extra_stamina',
  EFFORT_MAX = 'effort_max',
  EFFORT_MIN = 'effort_min',
  KICK_POWER_RATE = 'kick_power_rate',
  FOUL_DETECT_PROBABILITY = 'foul_detect_probability',
  CATCHABLE_AREA_L_STRETCH = 'catchable_area_l_stretch'
}
