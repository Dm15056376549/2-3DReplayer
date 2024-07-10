import { Panel } from '../components/Panel';
import { UIUtil } from '../../utils/UIUtil';
import { WorldState } from '../../model/game/WorldState';
import { Color } from 'three';

class GameInfoBoard extends Panel
{
  /** The game time label. */
  gameTimeLbl: HTMLSpanElement;

  /** The left team label */
  leftTeamLbl: HTMLSpanElement;

  /** The left team score label */
  leftScoreLbl: HTMLSpanElement;

  /** The score divider label */
  scoreDividerLbl: HTMLSpanElement;

  /** The right team score label */
  rightScoreLbl: HTMLSpanElement;

  /** The right team label */
  rightTeamLbl: HTMLSpanElement;

  /** The game state label */
  gameStateLbl: HTMLSpanElement;

  /** The world state used during the last update. */
  previousWorldState?: WorldState;

  /**
   * GameInfoBoard Contructor
   */
  constructor ()
  {
    super({cls: 'jsm-game-info no-text-select'});

    const infoLine = UIUtil.el('div', { parent: this.domElement, cls: 'info-line' });
    const stateLine = UIUtil.el('div', { parent: this.domElement, cls: 'state-line' });

    this.gameTimeLbl = UIUtil.el('span', { parent: infoLine, content: '00:00.<small>00</small>', cls: 'game_time_lbl' });
    this.leftTeamLbl = UIUtil.el('span', { parent: infoLine, content: 'Left', cls: 'left-team' });
    this.leftScoreLbl = UIUtil.el('span', { parent: infoLine, content: '0', cls: 'left-score' });
    this.scoreDividerLbl = UIUtil.el('span', { parent: infoLine, content: ':', cls: 'score-divider' });
    this.rightScoreLbl = UIUtil.el('span', { parent: infoLine, content: '0', cls: 'right-score' });
    this.rightTeamLbl = UIUtil.el('span', { parent: infoLine, content: 'Right', cls: 'right-team' });
    this.gameStateLbl = UIUtil.el('span', { parent: stateLine, content: 'Unknown', cls:  'game_state_lbl' });

    this.previousWorldState = undefined;
  }

  /**
   * Update the time, score and game state labels.
   *
   * @param state the current world state
   */
  update (state: WorldState | undefined = undefined): void
  {
    if (!state) {
      this.gameTimeLbl.innerHTML = '00:00.<small>00</small>';
      this.gameStateLbl.innerHTML = 'Unknown';
      this.leftScoreLbl.innerHTML = '0';
      this.rightScoreLbl.innerHTML = '0';
      this.previousWorldState = undefined;
      return;
    }

    // Do a full update for the first incomming state
    if (!this.previousWorldState) {
      this.gameTimeLbl.innerHTML = UIUtil.toMMSScs(state.gameTime, true);
      this.gameStateLbl.innerHTML = state.gameState.playMode;
      this.leftScoreLbl.innerHTML = state.score.goalsLeft.toString();
      this.rightScoreLbl.innerHTML = state.score.goalsRight.toString();
      this.previousWorldState = state;
      return;
    }

    // Update game time label if changed
    if (this.previousWorldState.gameTime !== state.gameTime) {
      this.gameTimeLbl.innerHTML = UIUtil.toMMSScs(state.gameTime, true);
    }

    // Update game state label if changed
    if (this.previousWorldState.gameState !== state.gameState) {
      this.gameStateLbl.innerHTML = state.gameState.playMode;
    }

    // Update score labels if changed
    if (this.previousWorldState.score !== state.score) {
      this.leftScoreLbl.innerHTML = state.score.goalsLeft.toString();
      this.rightScoreLbl.innerHTML = state.score.goalsRight.toString();
    }

    // Remember current state
    this.previousWorldState = state;
  }

  /**
   * Update the team labels.
   *
   * @param leftTeamName the name of the left team
   * @param rightTeamName the name of the right team
   */
  updateTeamNames (leftTeamName: string, rightTeamName: string): void
  {
    this.leftTeamLbl.innerHTML = leftTeamName;
    this.rightTeamLbl.innerHTML = rightTeamName;
  }

  /**
   * Update the team labels.
   *
   * @param leftTeamColor the color of the left team
   * @param rightTeamColor the color of the right team
   */
  updateTeamColors (leftTeamColor: Color, rightTeamColor: Color): void
  {
    // Left Team
    const leftColor = UIUtil.getForegroundColor(leftTeamColor);

    this.leftTeamLbl.style.backgroundColor = this.leftScoreLbl.style.backgroundColor = leftTeamColor.getStyle();
    this.leftTeamLbl.style.color = this.leftScoreLbl.style.color = leftColor.getStyle();

    // Right Team
    const rightColor = UIUtil.getForegroundColor(rightTeamColor);

    this.rightTeamLbl.style.backgroundColor = this.rightScoreLbl.style.backgroundColor = rightTeamColor.getStyle();
    this.rightTeamLbl.style.color = this.rightScoreLbl.style.color = rightColor.getStyle();
  }
}

export { GameInfoBoard };
