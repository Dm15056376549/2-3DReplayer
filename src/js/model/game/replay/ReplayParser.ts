import { ISimulationLogParser, copyString } from '../parser/SimulationLogParser';
import { AgentDescription } from '../AgentDescription';
import { AgentState } from '../AgentState';
import { DataIterator } from '../utils/DataIterator';
import { LogParserStorage } from '../parser/LogParserStorage';
import { ObjectState } from '../ObjectState';
import { SimulationLog } from '../SimulationLog';
import { ParserError } from '../utils/Exceptions';
import { PartialWorldState } from '../parser/PartialWorldState';
import { Replay } from './Replay';
import { TeamDescription } from '../TeamDescription';
import { WorldState } from '../WorldState';
import { SimulationType } from '../utils/GameUtil';
import { SparkUtil } from '../utils/SparkUtil';
import { ParameterMap, ParameterObject } from '../utils/ParameterMap';
import { JsMath, PIby180, NegPIby180 } from '../../../utils/JsMath';
import { SymbolNode } from '../utils/symboltree/SymbolNode';
import { SymbolTreeParser } from '../utils/symboltree/SymbolTreeParser';
import { Agent2DFlags, Agent2DData } from '../utils/SServerUtil';
import { Color, Vector3, Quaternion } from 'three';

/**
 * The ReplayParser class definition.
 *
 * The ReplayParser provides
 *
 * @author Stefan Glaser
 */
class ReplayParser implements ISimulationLogParser
{
  /** The replay data iterator. */
  iterator?: DataIterator = undefined;

  /** The replay. */
  replay?: Replay = undefined;

  /** The storage instance used during parsing. */
  storage?: LogParserStorage = undefined;

  /**
   * ReplayParser Constructor
   * Create a new replay parser instance.
   */
  constructor ()
  {
    // console.log('New Replay parser instance created!');
  }

  /**
   * Try or continue parsing a game log.
   *
   * @override
   * @param data the current data
   * @param ressource the data ressource
   * @param partial flag for partial / not yet fully loaded data (default: false)
   * @param incremental flag for incremental data chunks (default: false)
   * @returns
   */
  parse (data: string, ressource: URL | File, partial: boolean = false, incremental: boolean = false): boolean
  {
    if (!this.iterator || !this.replay || !this.storage) {
      // Start parsing
      this.iterator = new DataIterator(data, partial);

      // ==================== Parse Replay Header ====================
      let line = this.iterator.next();
      if (!line) {
        throw new ParserError('Replay corrupt!');
      }
      let splitLine = line.split(' ');

      if (line.charAt(0) === 'R' &&
          line.charAt(1) === 'P' &&
          line.charAt(2) === 'L') {
        // Found replay header
        if (splitLine.length < 3) {
          throw new ParserError('Malformated Replay Header!');
        }

        const type = splitLine[1] === '2D' ? SimulationType.TWOD : SimulationType.THREED;
        this.replay = new Replay(ressource, type, parseInt(splitLine[2], 10));

        this.iterator.next();
      } else {
        // No replay header found, try fallback...
        if (line.charAt(0) === 'T') {
          // Initial 2D replay format, use fallback parser
          console.log('ReplayParser: Detected old 2D replay file format!');

          // Parse teams line
          if (splitLine.length < 3) {
            throw new ParserError('Invalid team line!');
          }

          this.replay = new Replay(ressource, SimulationType.TWOD, 0);
          this.replay.leftTeam.name = copyString(splitLine[1].slice(1, -1));
          this.replay.rightTeam.name = copyString(splitLine[2].slice(1, -1));

          // Progress to next line
          this.iterator.next();

          // Create default agents with numbers 1 to 11 for both sides
          for (let i = 1; i < 12; i++) {
            this.replay.leftTeam.addAgent(i, this.replay.playerTypes[0]);
            this.replay.rightTeam.addAgent(i, this.replay.playerTypes[0]);
          }
        } else if (line.charAt(0) === 'V') {
          // Initial 3D replay format, use fallback parser
          console.log('ReplayParser: Detected old 3D replay file format!');

          if (splitLine.length < 4) {
            throw new ParserError('Malformated Replay Header!');
          }

          this.replay = new Replay(ressource, SimulationType.THREED, 0);
          this.replay.frequency = parseInt(splitLine[3], 10);

          // Parse teams line
          line = this.iterator.next();
          if (!line) {
            throw new ParserError('Replay corrupt!');
          }
          splitLine = line.split(' ');
          if (splitLine.length < 5 || splitLine[0] != 'T') {
            throw new ParserError('Invalid teams line!');
          }

          this.replay.leftTeam.name = copyString(splitLine[1].slice(1, -1));
          this.replay.rightTeam.name = copyString(splitLine[3].slice(1, -1));
          try {
            this.replay.leftTeam.color = new Color(splitLine[2]);
            this.replay.rightTeam.color = new Color(splitLine[4]);
          } catch (ex) {
            console.log(ex);
          }

          // Parse world line
          line = this.iterator.next();
          if (!line) {
            throw new ParserError('Replay corrupt!');
          }
          splitLine = line.split(' ');
          if (splitLine.length < 2 || splitLine[0] != 'F') {
            throw new ParserError('Invalid world line!');
          }

          // Extract field parameters based on server version
          switch (parseInt(splitLine[1], 10)) {
            case 62:
              this.replay.environmentParams = SparkUtil.createEnvironmentParamsV62();
              break;
            case 63:
              this.replay.environmentParams = SparkUtil.createEnvironmentParamsV63();
              break;
            case 64:
              this.replay.environmentParams = SparkUtil.createEnvironmentParamsV64();
              break;
            case 66:
              this.replay.environmentParams = SparkUtil.createEnvironmentParamsV66();
              break;
            default:
              break;
          }

          // Progress to next line
          this.iterator.next();
        } else {
          throw new ParserError('Failed parsing replay file - no Replay header found (and none of the fallback options applies)!');
        }
      }

      this.storage = new LogParserStorage();
      this.storage.maxStates = this.replay.type === SimulationType.TWOD ? 300 : 50;

      parseReplayBody(this.iterator, this.replay, this.storage);

      if (!partial && this.replay.states.length === 0) {
        throw new ParserError('Empty replay file!');
      }

      return this.replay.states.length > 0;
    } else {
      // Progress parsing
      const wasEmpty = this.replay.states.length === 0;

      if (this.iterator.update(data, partial, incremental)) {
        // console.log('Restarting replay parser...');
        parseReplayBody(this.iterator, this.replay, this.storage);
      }

      if (!partial && this.replay.states.length === 0) {
        throw new ParserError('Empty replay file!');
      }

      return wasEmpty && this.replay.states.length > 0;
    }
  }

  /**
   * Retrieve the currently parsed simulation log.
   *
   * @override
   * @returns the (maybe partially) parsed simulation log
   */
  getSimulationLog (): SimulationLog | undefined
  {
    return this.replay;
  }

  /**
   * Dispose all resources referenced in this parser instance.
   *
   * @override
   * @param keepIteratorAlive indicator if iterator should not be disposed
   */
  dispose (keepIteratorAlive: boolean = false): void
  {
    // console.log('Dispose Replay parser instance (keep iterator: ' + keepIteratorAlive + ')');

    if (!!this.iterator && !keepIteratorAlive) {
      this.iterator.dispose();
    }

    this.iterator = undefined;
    this.replay = undefined;
    this.storage = undefined;
  }
}

export { ReplayParser };






// ============================================================================
// ======================== PRIVATE PARSING FUNCTIONS =========================
// ============================================================================

/**
 * [parseReplayBody description]
 *
 * @param iterator the replay data iterator
 * @param replay the replay to store the parsed states
 * @param storage the parser storage instance
 */
function parseReplayBody (iterator: DataIterator, replay: Replay, storage: LogParserStorage): void
{
  let dataLine = iterator.line;
  if (!dataLine) {
    // Try to restart the iterator
    dataLine = iterator.next();
  }

  let newStatesCnt = 0;

  // Parsing functions
  let parseBallFcn = parseBallState_2D;
  let parseAgentFcn = parseAgentState_V0_2D;
  if (replay.type === SimulationType.THREED) {
    if (replay.version === 0) {
      parseBallFcn = parseBallState_V0_3D;
      parseAgentFcn = parseAgentState_V0_3D;
    } else {
      parseBallFcn = parseBallState_V1_3D;
      parseAgentFcn = parseAgentState_V1;
    }
  } else if (replay.version > 0) {
    parseAgentFcn = parseAgentState_V1;
  }

  while (!!dataLine && newStatesCnt < storage.maxStates) {
    try {
      switch (dataLine.charAt(0)) {
        case 'E': // Environment parameter line
          if (dataLine.charAt(1) === 'P') {
            parseEnvironmentParams(dataLine, replay, storage);
          }
          break;
        case 'P':
          if (dataLine.charAt(1) === 'P') {
            // Player parameter line
            parsePlayerParams(dataLine, replay);
          } else if (dataLine.charAt(1) === 'T') {
            // Player type line
            parsePlayerTypeParams(dataLine, replay);
          }
          break;
        case 'T': // Team info line
          parseTeamLine(dataLine, replay);
          break;
        case 'S': // State dataL line
          if (parseStateLine(dataLine, replay, storage)) {
            newStatesCnt++;
          }
          break;

        case 'b': // Ball data line
          parseBallFcn(dataLine, storage.partialState);
          break;

        case 'l': // Left agent data line
        case 'L':
          parseAgentFcn(dataLine, replay, storage, true);
          break;

        case 'r': // Right agent data line
        case 'R':
          parseAgentFcn(dataLine, replay, storage, false);
          break;
      }
    } catch (ex) {
    }

    dataLine = iterator.next();
  }

  // Refresh replay
  if (newStatesCnt > 0) {
    replay.onStatesUpdated();
  }

  // Start parsing job, parsing $maxStates world states per run
  if (dataLine) {
    setTimeout(parseReplayBody, 1, iterator, replay, storage);
  } else if (!iterator.partialData) {
    iterator.dispose();

    if (storage.partialState) {
      // Push final state
      storage.partialState.appendTo(replay.states);
    }

    replay.finalize();
  }
}











// ----------------------------------------------------------------------------
// --------------------------------- GENERAL ----------------------------------
// ----------------------------------------------------------------------------

/**
 * Parse a environment parameter line.
 *
 * @param dataLine the environment params line
 * @param replay the replay instance
 * @param storage the parser storage instance
 */
function parseEnvironmentParams (dataLine: string, replay: Replay, storage: LogParserStorage): void
{
  // Environment-Parameter Line-Format:
  // EP <single-line-json>
  try {
    const newParams = JSON.parse(dataLine.slice(3)) as ParameterObject;
    replay.environmentParams.clear();
    replay.environmentParams.paramObj = newParams;
  } catch (ex) {
    console.log('Exception while parsing environment parameters:');
    console.log(ex);
  }

  // Update replay frequency and partial state time step
  replay.updateFrequency();
  if (storage.partialState) {
    storage.partialState.timeStep = 1 / replay.frequency;
  }
}

/**
 * Parse a player parameter line.
 *
 * @param dataLine the player params line
 * @param replay the replay instance
 */
function parsePlayerParams (dataLine: string, replay: Replay): void
{
  // Player-Parameter Line-Format:
  // PP <single-line-json>
  try {
    const newParams = JSON.parse(dataLine.slice(3)) as ParameterObject;
    replay.playerParams.clear();
    replay.playerParams.paramObj = newParams;
  } catch (ex) {
    console.log('Exception while parsing player parameters:');
    console.log(ex);
  }
}

/**
 * Parse a player type parameter line.
 *
 * @param dataLine the player params line
 * @param replay the replay instance
 */
function parsePlayerTypeParams (dataLine: string, replay: Replay): void
{
  // Player-Type-Parameter Line-Format:
  // PT <id> <single-line-json>
  const idx = dataLine.indexOf(' ', 4);

  if (idx > 3 && idx < 10) {
    const typeIdx = parseInt(dataLine.slice(3, idx), 10);

    try {
      replay.playerTypes[typeIdx] = new ParameterMap(JSON.parse(dataLine.slice(idx + 1)));
    } catch (ex) {
      console.log('Exception while parsing player type parameters:');
      console.log(ex);
    }
  }
}

/**
 * Parse a team info line.
 *
 * @param dataLine the team info line
 * @param replay the replay to store the parsed states
 */
function parseTeamLine (dataLine: string, replay: Replay): void
{
  // Teams-Line-Format:
  // T <left-team> <right-team>[ <left-color <right-color>]
  const line = dataLine.split(' ');
  if (line.length < 3) {
    // Not enough data!
    return;
  }

  replay.leftTeam.name = copyString(line[1]);
  replay.rightTeam.name = copyString(line[2]);

  if (line.length > 4) {
    try {
      replay.leftTeam.color = new Color(line[3]);
      replay.rightTeam.color = new Color(line[4]);
    } catch (ex) {
      console.log(ex);
    }
  }

  // Publish update of team information
  replay.onTeamsUpdated();
}

/**
 * Parse a state info line.
 *
 * @param dataLine the team info line
 * @param replay the replay to store the parsed states
 * @param storage the parser storage instance
 * @returns true, if a new world state was created, false otherwise
 */
function parseStateLine (dataLine: string, replay: Replay, storage: LogParserStorage): boolean
{
  // State-Line-Format:
  // S <game-time> <playmode> <score-left> <score-right>[ <penalty-score-left> <penalty-miss-left> <penalty-miss-right> <penalty-miss-right>]
  const line = dataLine.split(' ');
  if (line.length < 5) {
    // Not enough data!
    return false;
  }

  let newStateCreated = false;
  if (storage.partialState) {
    newStateCreated = storage.partialState.appendTo(replay.states);
  } else {
    storage.partialState = new PartialWorldState(0, 1 / replay.frequency, 0);
  }

  let gameTime = parseFloat(line[1]);
  if (replay.version === 0) {
    gameTime /= 10;
  }

  storage.partialState.setGameTime(gameTime);
  storage.partialState.setPlaymode(copyString(line[2]));

  if (line.length > 8) {
    storage.partialState.setScore(
        parseInt(line[3], 10),
        parseInt(line[4], 10),
        parseInt(line[5], 10),
        parseInt(line[6], 10),
        parseInt(line[7], 10),
        parseInt(line[8], 10)
      );
  } else {
    storage.partialState.setScore(parseInt(line[3], 10), parseInt(line[4], 10));
  }

  return newStateCreated;
}

/**
 * [parseBallState description]
 *
 * @param dataLine
 * @param partialState
 */
function parseBallState_2D (dataLine: string, partialState?: PartialWorldState): void
{
  // Ball-Line-Format:
  // b <x> <y>
  const line = dataLine.split(' ');
  if (!partialState || line.length < 3) {
    // Not enough data!
    return;
  }

  partialState.ballState = new ObjectState({
      x: parseFloat(line[1]),
      y: 0.2,
      z: parseFloat(line[2]),
      qx: 0,
      qy: 0,
      qz: 0,
      qw: 1
    });
}











// ----------------------------------------------------------------------------
// --------------------------------- VERSION 0 --------------------------------
// ----------------------------------------------------------------------------



/**
 * [parseBallState description]
 *
 * @param dataLine
 * @param partialState
 */
function parseBallState_V0_3D (dataLine: string, partialState?: PartialWorldState): void
{
  // Ball-Line-Format:
  // b <x> <y> <z> <qx> <qy> <qz> <qw>
  const line = dataLine.split(' ');
  if (!partialState || line.length < 8) {
    // Not enough data!
    return;
  }

  partialState.ballState = new ObjectState({
      x: parseInt(line[1], 10) / 1000,
      y: parseInt(line[3], 10) / 1000,
      z: -parseInt(line[2], 10) / 1000,
      qx: parseInt(line[5], 10) / 1000,
      qy: parseInt(line[7], 10) / 1000,
      qz: -parseInt(line[6], 10) / 1000,
      qw: parseInt(line[4], 10) / 1000
    });
}

/**
 * [parseAgentState description]
 *
 * @param dataLine the agent line
 * @param replay the replay to store the parsed states
 * @param storage the parser storage instance
 * @param leftSide side indicator
 */
function parseAgentState_V0_2D (dataLine: string, replay: Replay, storage: LogParserStorage, leftSide: boolean): void
{
  // Agent-Line-Format:
  // {l|L|r|R} <unum> <x> <y> <heading-angle>[ <neck-angle> <stamina>]
  const line = dataLine.split(' ');
  if (!storage.partialState || line.length < 5) {
    // Not enough data!
    return;
  }

  const playerNo = parseInt(line[1], 10);
  let flags = Agent2DFlags.STAND;

  // Check for goalie
  if (line[0] === 'L' || line[0] === 'R') {
    flags |= Agent2DFlags.GOALIE;
  }

  // Parse player state data
  const position = new Vector3(parseFloat(line[2]), 0, parseFloat(line[3]));
  let angle = parseFloat(line[4]);
  const quat = new Quaternion();
  quat.setFromAxisAngle(new Vector3(0, 1, 0), JsMath.toRad(-angle));
  const jointData:number[] = [];
  const agentData:number[] = [];

  if (line.length > 6) {
    angle = parseFloat(line[5]) - angle;
    if (angle > 180) {
      angle -= 360;
    } else if (angle < -180) {
      angle += 360;
    }

    jointData[0] = JsMath.toRad(-angle);
    agentData[Agent2DData.STAMINA] = parseFloat(line[6].slice(1));
  }

  const newState = new AgentState({
      modelIdx: 0,
      flags: flags,
      x: position.x,
      y: position.y,
      z: position.z,
      qx: quat.x,
      qy: quat.y,
      qz: quat.z,
      qw: quat.w,
      jointAngles: jointData,
      data: agentData
    });

  if (leftSide) {
    storage.partialState.leftAgentStates[playerNo] = newState;
  } else {
    storage.partialState.rightAgentStates[playerNo] = newState;
  }
}

/**
 * [parseAgentState description]
 *
 * @param dataLine the agent line
 * @param replay the replay to store the parsed states
 * @param storage the parser storage instance
 * @param leftSide side indicator
 */
function parseAgentState_V0_3D (dataLine: string, replay: Replay, storage: LogParserStorage, leftSide: boolean): void
{
  // Agent-Line-Format:
  // {l|L|r|R} <unum>[ model] <x> <y> <z> <qx> <qy> <qz> <qr> [ <joint-angle>]*
  const line = dataLine.split(' ');
  if (!storage.partialState || line.length < 9) {
    // Not enough data!
    return;
  }

  const playerNo = parseInt(line[1], 10);
  let dataIdx = 2;
  let modelIdx = 0;
  let team;
  let indexList;
  let agentStates;

  if (leftSide) {
    team = replay.leftTeam;
    indexList = storage.leftIndexList;
    agentStates = storage.partialState.leftAgentStates;
  } else {
    team = replay.rightTeam;
    indexList = storage.rightIndexList;
    agentStates = storage.partialState.rightAgentStates;
  }

  // Check for model definition
  if (line[0] === 'L' || line[0] === 'R') {
    if (line.length < 10) {
      // Not enough data!
      return;
    }

    dataIdx++;

    let modelType = 0;
    try {
      modelType = parseInt(line[2].slice(-1), 10);
    } catch (err) {
    }

    team.addAgent(playerNo, replay.playerTypes[modelType]);
    indexList[playerNo] = team.getRecentTypeIdx(playerNo);
  }

  if (indexList[playerNo] !== undefined) {
    modelIdx = indexList[playerNo];
  }

  // Parse player state data
  const position = new Vector3(
        parseInt(line[dataIdx], 10) / 1000,
        parseInt(line[dataIdx + 2], 10) / 1000,
        -parseInt(line[dataIdx + 1], 10) / 1000);
  const quat = new Quaternion(
        parseInt(line[dataIdx + 4], 10) / 1000,
        parseInt(line[dataIdx + 6], 10) / 1000,
        -parseInt(line[dataIdx + 5], 10) / 1000,
        parseInt(line[dataIdx + 3], 10) / 1000);
  const jointData:number[] = [];
  dataIdx += 7;

  // Shuffle joint data
  // Old joint order: <head> <l-arm> <l-leg> <r-arm> <r-leg>
  // New joint order: <head> <r-arm> <l-arm> <r-leg> <l-leg>
  let i;
  const numLegJoints = line.length - dataIdx > 22 ? 7 : 6;
  const lArmData = [];
  const lLegData = [];

  for (i = 0; i < 2 && dataIdx < line.length; i++, dataIdx++) {
    jointData.push(JsMath.toRad(parseFloat(line[dataIdx]) / 100));
  }
  for (i = 0; i < 4 && dataIdx < line.length; i++, dataIdx++) {
    lArmData.push(JsMath.toRad(parseFloat(line[dataIdx]) / 100));
  }
  for (i = 0; i < numLegJoints && dataIdx < line.length; i++, dataIdx++) {
    lLegData.push(JsMath.toRad(parseFloat(line[dataIdx]) / 100));
  }
  for (i = 0; i < 4 && dataIdx < line.length; i++, dataIdx++) {
    jointData.push(JsMath.toRad(parseFloat(line[dataIdx]) / 100));
  }
  for (i = 0; i < lArmData.length; i++) {
    jointData.push(lArmData[i]);
  }
  for (i = 0; i < numLegJoints && dataIdx < line.length; i++, dataIdx++) {
    jointData.push(JsMath.toRad(parseFloat(line[dataIdx]) / 100));
  }
  for (i = 0; i < lLegData.length; i++) {
    jointData.push(lLegData[i]);
  }


  agentStates[playerNo] = new AgentState({
      modelIdx: modelIdx,
      flags: 0x00,
      x: position.x,
      y: position.y,
      z: position.z,
      qx: quat.x,
      qy: quat.y,
      qz: quat.z,
      qw: quat.w,
      jointAngles: jointData,
      data: []
    });
}











// ----------------------------------------------------------------------------
// --------------------------------- VERSION 1 --------------------------------
// ----------------------------------------------------------------------------

/**
 * [parseBallState description]
 *
 * @param dataLine
 * @param partialState
 */
function parseBallState_V1_3D (dataLine: string, partialState?: PartialWorldState): void
{
  // Ball-Line-Format:
  // b <x> <y> <z> <qx> <qy> <qz> <qw>
  const line = dataLine.split(' ');
  if (!partialState || line.length < 8) {
    // Not enough data!
    return;
  }

  partialState.ballState = new ObjectState({
      x: parseFloat(line[1]),
      y: parseFloat(line[3]),
      z: -parseFloat(line[2]),
      qx: parseFloat(line[5]),
      qy: parseFloat(line[7]),
      qz: -parseFloat(line[6]),
      qw: parseFloat(line[4])
    });
}

/**
 * [parseAgentState description]
 *
 * @param dataLine the agent line
 * @param replay the replay to store the parsed states
 * @param storage the parser storage instance
 * @param leftSide side indicator
 */
function parseAgentState_V1 (dataLine: string, replay: Replay, storage: LogParserStorage, leftSide: boolean): void
{
  // Agent-Line-Format:
  // 2D:
  // {l|L|r|R} <unum>[ typeIdx] <flags> <x> <y> <heading-angle>[(j[ <joint-angle>]+)][(s <stamina>)]
  // 3D:
  // {l|L|r|R} <unum>[ typeIdx] <flags> <x> <y> <z> <qx> <qy> <qz> <qr>[(j[ <joint-angle>]+)][(s <stamina>)]
  const rootNode = SymbolTreeParser.parse('(' + dataLine + ')');
  if (!storage.partialState || rootNode.values.length < 6) {
    // Not enough data!
    return;
  }

  const playerNo = parseInt(rootNode.values[1], 10);
  let dataIdx = 2;
  let modelIdx = 0;
  let team;
  let indexList;
  let agentStates;

  if (leftSide) {
    team = replay.leftTeam;
    indexList = storage.leftIndexList;
    agentStates = storage.partialState.leftAgentStates;
  } else {
    team = replay.rightTeam;
    indexList = storage.rightIndexList;
    agentStates = storage.partialState.rightAgentStates;
  }

  // Check for model definition
  if (rootNode.values[0] === 'L' || rootNode.values[0] === 'R') {
    team.addAgent(playerNo, replay.playerTypes[parseInt(rootNode.values[dataIdx], 10)]);
    indexList[playerNo] = team.getRecentTypeIdx(playerNo);
    dataIdx++;
  }

  if (indexList[playerNo] !== undefined) {
    modelIdx = indexList[playerNo];
  }

  const flags = parseInt(rootNode.values[dataIdx], 16);
  dataIdx++;

  // Parse player state data
  const position = new Vector3();
  const quat = new Quaternion();
  const jointData:number[] = [];
  const agentData:number[] = [];
  const is2D = replay.type === SimulationType.TWOD;

  if (is2D) {
    position.set(parseFloat(rootNode.values[dataIdx]), 0, parseFloat(rootNode.values[dataIdx + 1]));
    quat.setFromAxisAngle(new Vector3(0, 1, 0), JsMath.toRad(-1 * parseFloat(rootNode.values[dataIdx + 2])));
  } else {
    position.set(parseFloat(rootNode.values[dataIdx]),
                 parseFloat(rootNode.values[dataIdx + 2]),
                 -parseFloat(rootNode.values[dataIdx + 1]));
    quat.set(parseFloat(rootNode.values[dataIdx + 4]),
             parseFloat(rootNode.values[dataIdx + 6]),
             -parseFloat(rootNode.values[dataIdx + 5]),
             parseFloat(rootNode.values[dataIdx + 3]));
  }

  for (let i = 0; i < rootNode.children.length; i++) {
    switch (rootNode.children[i].values[0]) {
      case 'j':
        parseJointNode(rootNode.children[i], jointData, is2D);
        break;
      case 's':
        agentData[Agent2DData.STAMINA] = parseFloat(rootNode.children[i].values[1]);
        break;
      default:
        break;
    }
  }

  agentStates[playerNo] = new AgentState({
      modelIdx: modelIdx,
      flags: flags,
      x: position.x,
      y: position.y,
      z: position.z,
      qx: quat.x,
      qy: quat.y,
      qz: quat.z,
      qw: quat.w,
      jointAngles: jointData,
      data: agentData
    });
}

/**
 * Parse a joint-angles symbol node into a joint-data array.
 *
 * @param node the joint-angles symbol node
 * @param jointData the joint data list
 * @param convert indicator if joint angles sign should be negated
 */
function parseJointNode (node: SymbolNode, jointData: number[], convert: boolean = false): void
{
  const factor = convert ? NegPIby180 : PIby180;

  for (let i = 1; i < node.values.length; i++) {
    jointData.push(parseFloat(node.values[i]) * factor);
  }
}
