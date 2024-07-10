import { ISimulationLogParser, copyString } from '../parser/SimulationLogParser';
import { AgentDescription } from '../AgentDescription';
import { AgentState } from '../AgentState';
import { DataIterator } from '../utils/DataIterator';
import { LogParserStorage } from '../parser/LogParserStorage';
import { ObjectState } from '../ObjectState';
import { SimulationLog } from '../SimulationLog';
import { ParserError } from '../utils/Exceptions';
import { SServerLog } from './SServerLog';
import { SymbolNode } from '../utils/symboltree/SymbolNode';
import { SymbolTreeParser } from '../utils/symboltree/SymbolTreeParser';
import { TeamDescription } from '../TeamDescription';
import { WorldState } from '../WorldState';
import { ParameterObject, ParameterMap } from '../utils/ParameterMap';
import { JsMath } from '../../../utils/JsMath';
import { PartialWorldState } from '../parser/PartialWorldState';
import { Agent2DData, PlayerType2DParams } from '../utils/SServerUtil';
import { Vector3, Quaternion} from 'three';

/**
 * The ULGParser class definition.
 *
 * The ULGParser provides
 *
 * @author Stefan Glaser
 */
class ULGParser implements ISimulationLogParser
{
  /** The ulg log data iterator. */
  iterator?: DataIterator = undefined;

  /** The sserver log. */
  sserverLog?: SServerLog = undefined;

  /** The storage instance used during parsing. */
  storage?: LogParserStorage = undefined;

  /**
   * ULGParser Constructor
   * Create a new ULG parser instance.
   */
  constructor()
  {
    // console.log('New USG parser instance created!');
  }

  /**
   * Try or continue parsing a game log.
   *
   * @override
   * @param data the current data
   * @param partial flag for partial / not yet fully loaded data (default: false)
   * @param incremental flag for incremental data chunks (default: false)
   * @returns
   */
  parse (data: string, ressource: URL | File, partial: boolean = false, incremental: boolean = false): boolean
  {
    if (!this.iterator || !this.sserverLog || !this.storage) {
      // Start parsing
      this.iterator = new DataIterator(data, partial);

      // ==================== Check ULG Header ====================
      const line = this.iterator.next();
      if (!line || (line.charAt(0) !== 'U' && line.charAt(1) !== 'L' && line.charAt(2) !== 'G')) {
        throw new ParserError('Failed parsing ULG log file - no ULG header found!');
      }
      const ulgVersion = parseInt(line.slice(3), 10);
      this.sserverLog = new SServerLog(ressource, ulgVersion);
      this.storage = new LogParserStorage();
      this.storage.partialState = new PartialWorldState(0, 0.1, 0);
      this.storage.maxStates = 100;

      // Start parsing the ulg log body
      this.iterator.next();
      ULGParser.parseULGBody(this.iterator, this.sserverLog, this.storage);

      if (!partial && this.sserverLog.states.length === 0) {
        throw new ParserError('Empty SServer log file!');
      }

      return this.sserverLog.states.length > 0;
    } else if (this.sserverLog) {
      const wasEmpty = this.sserverLog.states.length === 0;

      // Progress parsing
      if (this.iterator.update(data, partial, incremental)) {
        // console.log('Restarting ULG parser...');
        ULGParser.parseULGBody(this.iterator, this.sserverLog, this.storage);
      }

      if (!partial && this.sserverLog.states.length === 0) {
        throw new ParserError('Empty SServer log file!');
      }

      return wasEmpty && this.sserverLog.states.length > 0;
    }

    return false;
  }

  /**
   * Retrieve the currently parsed game log.
   *
   * @override
   * @returns the (maybe partially) parsed game log
   */
  getSimulationLog (): SimulationLog | undefined
  {
    return this.sserverLog;
  }

  /**
   * Dispose all resources referenced in this parser instance.
   *
   * @override
   * @param keepIteratorAlive indicator if iterator should not be disposed
   */
  dispose (keepIteratorAlive: boolean = false): void
  {
    // console.log('Dispose USG parser instance (keep iterator: ' + keepIteratorAlive + ')');

    if (!!this.iterator && !keepIteratorAlive) {
      this.iterator.dispose();
    }

    this.iterator = undefined;
    this.sserverLog = undefined;
    this.storage = undefined;
  }








  // ============================================================================
  // ============================== STATIC MEMBERS ==============================
  // ============================================================================

  /**
   * [parseULGBody description]
   *
   * @param iterator the ulg log data iterator
   * @param sserverLog the sserver log to store the parsed states
   * @param storage the parser storage instance
   */
  static parseULGBody (iterator: DataIterator, sserverLog: SServerLog, storage: LogParserStorage): void
  {
    // console.log('Parsing ulg log body...');

    let line = iterator.line;
    if (!line) {
      // Try to restart the iterator
      line = iterator.next();
    }

    let newStatesCnt = 0;

    // Parse
    while (!!line && newStatesCnt < storage.maxStates) {
      try {
        if (line.slice(0, 14) === '(server_param ') {
          ULGParser.parseServerParamLine(line, sserverLog, storage);
        } else if (line.slice(0, 14) === '(player_param ') {
          ULGParser.parsePlayerParamLine(line, sserverLog);
        } else if (line.slice(0, 13) === '(player_type ') {
          ULGParser.parsePlayerTypeLine(line, sserverLog);
        } else if (line.slice(0, 6) === '(team ') {
          ULGParser.parseTeamLine(line, sserverLog, storage);
        } else if (line.slice(0, 10) === '(playmode ') {
          ULGParser.parsePlaymodeLine(line, sserverLog, storage);
        } else if (line.slice(0, 5) === '(msg ') {
          ULGParser.parseMessageLine(line, sserverLog);
        } else if (line.slice(0, 6) === '(draw ') {
          ULGParser.parseDrawLine(line, sserverLog);
        } else if (line.slice(0, 6) === '(show ') {
          ULGParser.parseShowLine(line, sserverLog, storage);
          newStatesCnt++;
        } else {
          console.log('Unknown ulg log line: ' + line);
        }
      } catch (ex) {
      }

      line = iterator.next();
    }

    // Refresh sserver log
    if (newStatesCnt > 0) {
      sserverLog.onStatesUpdated();
    }

    // Start parsing job, parsing 100 show lines per run
    if (line) {
      setTimeout(ULGParser.parseULGBody, 1, iterator, sserverLog, storage);
    } else if (!iterator.partialData) {
      iterator.dispose();

      if (storage.partialState) {
        // Push final state
        storage.partialState.appendTo(sserverLog.states);
      }

      sserverLog.finalize();
    }
  }

  /**
   * @param line the playmode line
   * @param sserverLog the ssserver log
   * @param storage the parser storage instance
   */
  static parsePlaymodeLine (line: string, sserverLog: SServerLog, storage: LogParserStorage): void
  {
    if (!storage.partialState) {
      // Need a partial state first
      return;
    }

    // (playmode <gameTime> <playmode>)
    const rootNode = SymbolTreeParser.parse(line);

    if (rootNode.values.length > 2) {
      const gameTime = parseInt(rootNode.values[1], 10) / 10;

      // Add partial state if valid
      storage.partialState.appendTo(sserverLog.states);

      // Update partial word state
      storage.partialState.setGameTime(gameTime);
      storage.partialState.setPlaymode(copyString(rootNode.values[2]));
    } else {
      console.log('Invalid playmode line: ' + line);
    }
  }

  /**
   * @param line the team line
   * @param sserverLog the ssserver log
   * @param storage the parser storage instance
   */
  static parseTeamLine (line: string, sserverLog: SServerLog, storage:LogParserStorage): void
  {
    if (!storage.partialState) {
      // Need a partial state first
      return;
    }

    // (team <time> <left-team-name> <right-team-name> <goals-left> <goals-right> [<pen-score-left> <pen-miss-left> <pen-score-right> <pen-miss-right>])
    const rootNode = SymbolTreeParser.parse(line);

    if (rootNode.values.length > 5) {
      const gameTime = parseInt(rootNode.values[1], 10) / 10;
      const goalsLeft = parseInt(rootNode.values[4], 10);
      const goalsRight = parseInt(rootNode.values[5], 10);
      let penScoreLeft = 0;
      let penMissLeft = 0;
      let penScoreRight = 0;
      let penMissRight = 0;

      if (rootNode.values.length > 9) {
        penScoreLeft = parseInt(rootNode.values[6], 10);
        penMissLeft = parseInt(rootNode.values[7], 10);
        penScoreRight = parseInt(rootNode.values[8], 10);
        penMissRight = parseInt(rootNode.values[9], 10);
      }

      // Update left team name
      sserverLog.leftTeam.name = copyString(rootNode.values[2]);
      sserverLog.rightTeam.name = copyString(rootNode.values[3]);
      sserverLog.onTeamsUpdated();

      // Add partial state if valid
      storage.partialState.appendTo(sserverLog.states);

      // Update partial word state
      storage.partialState.setGameTime(gameTime);
      storage.partialState.setScore(goalsLeft, goalsRight, penScoreLeft, penMissLeft, penScoreRight, penMissRight);
    } else {
      console.log('Invalid team line: ' + line);
    }
  }

  /**
   * @param line the show line
   * @param sserverLog the ssserver log
   * @param storage the parser storage instance
   */
  static parseShowLine (line: string, sserverLog: SServerLog, storage: LogParserStorage): void
  {
    if (!storage.partialState) {
      // Need a partial state first
      return;
    }

    // (show <time>
    //    [(pm <playmode-no>)]
    //    [(tm <left-team-name> <right-team-name> <goals-left> <goals-right> [<pen-score-left> <pen-miss-left> <pen-score-right> <pen-miss-right>])]
    //    ((b) <x> <y> <vx> <vy>)
    //    [((<side> <unum>) <player_type> <flags> <x> <y> <vx> <vy> <body> <neck> [<point-x> <point-y>]
    //        (v <view-quality> <view-width>)
    //        (s <stamina> <effort> <recovery> [<capacity>])
    //        [(f <side> <unum>)]
    //        (c <kick> <dash> <turn> <catch> <move> <tneck> <view> <say> <tackle> <pointto> <attention>)
    //    )]*
    // )
    const rootNode = SymbolTreeParser.parse(line);

    if (rootNode.values.length > 1) {

      // Add partial state if valid
      storage.partialState.appendTo(sserverLog.states);
      storage.partialState.setGameTime(parseInt(rootNode.values[1], 10) / 10);

      let childNode;

      // Parse symbol tree into partial world state of sserver log
      for (let i = 0; i < rootNode.children.length; i++) {
        childNode = rootNode.children[i];

        if (childNode.children.length > 0) {
          // Either a ball or player info
          if (childNode.children[0].values[0] === 'b') {
            // Found ball info
            ULGParser.parseBallState(childNode, storage.partialState);
          } else if (childNode.children[0].values[0] === 'l') {
            // Found left team player
            ULGParser.parseAgentState(childNode, sserverLog, sserverLog.leftTeam, storage.partialState.leftAgentStates);
          } else if (childNode.children[0].values[0] === 'r') {
            // Found right team player
            ULGParser.parseAgentState(childNode, sserverLog, sserverLog.rightTeam, storage.partialState.rightAgentStates);
          } else {
            console.log('Found unexpected node in show line: ' + line.slice(0, 20));
          }
        } else if (childNode.values.length > 0) {
          // Either a playmode or team info
          if (childNode.values[0] === 'pm') {
            // parse the playmode number
            console.log('Found pm info in show line...');
          } else if (childNode.values[0] === 'tm') {
            // parse the team and scoring information
            console.log('Found tm info in show line...');
          } else {
            console.log('Found unexpected node in show line: ' + line.slice(0, 20));
          }
        } else {
          console.log('Found empty node in show line: ' + line.slice(0, 20));
        }
      }
    } else {
      console.log('Invalid show line: ' + line.slice(0, 20));
    }
  }

  /**
   * [parseBallState description]
   *
   * @param node the ball symbol node
   * @param partialState the partial world state
   */
  static parseBallState (node: SymbolNode, partialState?: PartialWorldState): void
  {
    // ((b) <x> <y> <vx> <vy>)
    if (!partialState || node.values.length < 2) {
      // Not enough data!
      return;
    }

    partialState.ballState = new ObjectState({
        x: parseFloat(node.values[0]),
        y: 0.2,
        z: parseFloat(node.values[1]),
        qx: 0,
        qy: 0,
        qz: 0,
        qw: 1
      });
  }

  /**
   * [parseAgentState description]
   *
   * @param node the ball symbol node
   * @param sserverLog the ssserver log
   * @param teamDescription the team description
   * @param teamStates the team agent states list
   */
  static parseAgentState (node: SymbolNode, sserverLog: SServerLog, teamDescription: TeamDescription, teamStates: Array<AgentState | undefined>): void
  {
    // ((<side> <unum>) <player_type> <flags> <x> <y> <vx> <vy> <body> <neck> [<point-x> <point-y>]
    //   (v <view-quality> <view-width>)
    //   (s <stamina> <effort> <recovery> [<capacity>])
    //   [(f <side> <unum>)]
    //   (c <kick> <dash> <turn> <catch> <move> <tneck> <view> <say> <tackle> <pointto> <attention>)
    // )

    if (node.values.length < 7) {
      // Invalid agent node
      console.log('Expected more values in agent node: ' + node.values);
      return;
    }

    const playerNo = parseInt(node.children[0].values[1], 10);
    const typeIdx = parseInt(node.values[0], 10);
    const flags = parseInt(node.values[1], 16);

    teamDescription.addAgent(playerNo, sserverLog.playerTypes[typeIdx]);

    // Parse player state data
    let position: Vector3;
    let quat: Quaternion;
    const jointData:number[] = [];
    const agentData:number[] = [];

    let angle = 0;

    position = new Vector3(parseFloat(node.values[2]), 0, parseFloat(node.values[3]));
    angle = parseFloat(node.values[6]);
    quat = new Quaternion();
    quat.setFromAxisAngle(new Vector3(0, 1, 0), JsMath.toRad(-angle));

    if (node.values.length > 7) {
      angle = parseFloat(node.values[7]);
      jointData[0] = JsMath.toRad(-angle);
    }

    // TODO: Parse stamina, focus and count information
    for (let i = 1; i < node.children.length; i++) {
      const values = node.children[i].values;

      if (values.length > 0) {
        if (values[0] === 'v') {
          // Parse view info
          // (v <view-quality> <view-width>)
          continue;
        } else if (values[0] === 's') {
          // Parse stamina info
          // (s <stamina> <effort> <recovery> [<capacity>])
          if (values.length > 1) {
            agentData[Agent2DData.STAMINA] = parseFloat(values[1]);
          }
          if (values.length > 2) {
            agentData[Agent2DData.STAMINA_EFFORT] = parseFloat(values[2]);
          }
          if (values.length > 3) {
            agentData[Agent2DData.STAMINA_RECOVERY] = parseFloat(values[3]);
          }
          if (values.length > 4) {
            agentData[Agent2DData.STAMINA_CAPACITY] = parseFloat(values[4]);
          }
        } else if (values[0] === 'f') {
          // Parse focus info
          // (f <side> <unum>)
          if (values.length > 2) {
            // TODO: Ensure that everything is expecting a number instead of 'l' and 'r' strings!
            // agentData[Agent2DData.FOCUS_SIDE] = values[1] === 'l' ? 'l' : 'r';
            agentData[Agent2DData.FOCUS_SIDE] = values[1] === 'l' ? -1 : 1;
            agentData[Agent2DData.FOCUS_UNUM] = parseInt(values[2], 10);
          } else {
            console.log('Found unexpected focus node in agent node!');
          }
        } else if (values[0] === 'c') {
          // Parse count info
          // (c <kick> <dash> <turn> <catch> <move> <tneck> <view> <say> <tackle> <pointto> <attention>)
          if (values.length > 1) {
            agentData[Agent2DData.KICK_COUNT] = parseInt(values[1], 10);
          }
          if (values.length > 2) {
            agentData[Agent2DData.DASH_COUNT] = parseInt(values[2], 10);
          }
          if (values.length > 3) {
            agentData[Agent2DData.TURN_COUNT] = parseInt(values[3], 10);
          }
          if (values.length > 4) {
            agentData[Agent2DData.CATCH_COUNT] = parseInt(values[4], 10);
          }
          if (values.length > 5) {
            agentData[Agent2DData.MOVE_COUNT] = parseInt(values[5], 10);
          }
          if (values.length > 6) {
            agentData[Agent2DData.TURN_NECK_COUNT] = parseInt(values[6], 10);
          }
          if (values.length > 7) {
            agentData[Agent2DData.VIEW_COUNT] = parseInt(values[7], 10);
          }
          if (values.length > 8) {
            agentData[Agent2DData.SAY_COUNT] = parseInt(values[8], 10);
          }
          if (values.length > 9) {
            agentData[Agent2DData.TACKLE_COUNT] = parseInt(values[9], 10);
          }
          if (values.length > 10) {
            agentData[Agent2DData.POINT_TO_COUNT] = parseInt(values[10], 10);
          }
          if (values.length > 11) {
            agentData[Agent2DData.ATTENTION_COUNT] = parseInt(values[11], 10);
          }
        } else {
          // Unknown subnode
          console.log('Found unexpected child node in agent node!');
        }
      } else {
        console.log('Found unexpected child node in agent node!');
      }
    }

    teamStates[playerNo] = new AgentState({
        modelIdx: teamDescription.getRecentTypeIdx(playerNo),
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
   * @param line the server params line
   * @param sserverLog the ssserver log
   * @param storage the parser storage instance
   */
  static parseServerParamLine (line: string, sserverLog: SServerLog, storage: LogParserStorage): void
  {
    // (server_param (<name> <value>)*)
    sserverLog.environmentParams.clear();
    ULGParser.parseParameters(line, sserverLog.environmentParams.paramObj, 'server parameter');

    // Update sserver log frequency and partial state time step
    sserverLog.updateFrequency();
    if (storage.partialState) {
      storage.partialState.timeStep = 1 / sserverLog.frequency;
    }
  }

  /**
   * @param line the player params line
   * @param sserverLog the ssserver log
   */
  static parsePlayerParamLine (line: string, sserverLog: SServerLog): void
  {
    // (player_param (<name> <value>)*)
    sserverLog.playerParams.clear();
    ULGParser.parseParameters(line, sserverLog.playerParams.paramObj, 'player parameter');
  }

  /**
   * @param line the player type line
   * @param sserverLog the ssserver log
   */
  static parsePlayerTypeLine (line: string, sserverLog: SServerLog): void
  {
    // (player_type (<name> <value>)*)
    const playerType: ParameterObject = {};
    ULGParser.parseParameters(line, playerType, 'player type');

    const typeIdx = playerType[PlayerType2DParams.ID];
    if (typeof typeIdx === 'number') {
      sserverLog.playerTypes[typeIdx] = new ParameterMap(playerType);
    }
  }

  /**
   * Parse a parameter line.
   *
   * @param line the data line
   * @param params the target parameter object
   * @param context the parameter context (for logging)
   */
  static parseParameters (line: string, params: ParameterObject, context: string): void
  {
    const rootNode = SymbolTreeParser.parse(line);
    let values;

    // Iterate over all param-value child nodes
    for (let i = 0; i < rootNode.children.length; i++) {
      values = rootNode.children[i].values;

      if (values.length < 2) {
        console.log('Malformated name-value pair in ' + context + ' line: ' + rootNode.children[i]);
        continue;
      }

      if (values[1] === 'true') {
        // Parse as boolean value
        params[values[0]] = true;
      } else if (values[1] === 'false') {
        // Parse as boolean value
        params[values[0]] = false;
      } else if (values[1].charAt(0) === '"') {
        // Parse as string value
        params[values[0]] = copyString(values[1].slice(1, -1));
      } else {
        // Try parse as numerical value
        try {
          params[values[0]] = parseFloat(values[1]);
        } catch (ex) {
          // If parsing as numerical values fails, simply copy the whole string value
          params[values[0]] = copyString(values[1]);
        }
      }
    }
  }

  /**
   * @param line the message line
   * @param sserverLog the ssserver log
   */
  static parseMessageLine (line: string, sserverLog: SServerLog): void {}

  /**
   * @param line the draw line
   * @param sserverLog the ssserver log
   */
  static parseDrawLine (line: string, sserverLog: SServerLog): void {}
}

export { ULGParser };