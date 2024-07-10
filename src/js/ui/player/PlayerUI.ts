import { Panel } from '../components/Panel';
import { UIUtil } from '../../utils/UIUtil';
import { FullscreenManager } from '../utils/FullscreenManager';
import { HelpOverlay } from './overlay/HelpOverlay';
import { InfoOverlay } from './overlay/InfoOverlay';
import { PanelGroup } from '../components/PanelGroup';
import { PlaylistOverlay } from './overlay/PlaylistOverlay';
import { SettingsOverlay } from './overlay/SettingsOverlay';
import { GameInfoBoard } from './GameInfoBoard';
import { MonitorModel, MonitorStates } from '../../model/MonitorModel';
import { LogPlayer, LogPlayerStates } from '../../model/logplayer/LogPlayer';
import { GChangeEvent, GEventObject } from '../../utils/EventDispatcher';
import { SimulationLog } from '../../model/game/SimulationLog';
import { Playlist } from '../../model/logplayer/Playlist';


/**
 * The PlayerUI class definition.
 *
 * @author Stefan Glaser
 */
class PlayerUI extends Panel
{
  /** The monitor model instance. */
  model: MonitorModel;

  /** The fullscreen manager. */
  fullscreenManager: FullscreenManager;

  /** The info overlay. */
  infoOverlay: InfoOverlay;

  /** The settings overlay. */
  settingsOverlay: SettingsOverlay;

  /** The playlist overlay. */
  playlistOverlay: PlaylistOverlay;

  /** The overlay group. */
  overlayGroup: PanelGroup;

  /** The game info board. */
  gameInfoBoard: GameInfoBoard;

  /** The waiting indicator. */
  waitingIndicator: HTMLDivElement;

  /** The bottom player bar pane. */
  barPane: HTMLDivElement;


  /** The player time slider. */
  timeSlider: HTMLInputElement;

  /** The player controls pane. */
  leftPane: HTMLDivElement;

  /** The player settings pane. */
  rightPane: HTMLDivElement;


  /** The Play / Pause / Replay button */
  playBtn: HTMLButtonElement;

  /** The jump previous goal button */
  jumpPreviousGoalBtn: HTMLButtonElement;

  /** The step backwards button */
  stepBackwardsBtn: HTMLButtonElement;

  /** The step forwards button */
  stepForwardBtn: HTMLButtonElement;

  /** The jump next goal button */
  jumpNextGoalBtn: HTMLButtonElement;

  /** The current time label */
  currentTimeLbl: HTMLSpanElement;

  /** The time divider label */
  timeDividerLbl: HTMLSpanElement;

  /** The total time label */
  totalTimeLbl: HTMLSpanElement;


  /** The toggle playlist button */
  playlistBtn: HTMLButtonElement;

  /** The toggle info button */
  infoBtn: HTMLButtonElement;

  /** The toggle settings button */
  settingsBtn: HTMLButtonElement;

  /** The fullscreen button */
  fullscreenBtn: HTMLButtonElement;

  /**
   * PlayerUI Constructor
   *
   * @param model the monitor model
   * @param fullscreenManager
   */
  constructor(model: MonitorModel, fullscreenManager: FullscreenManager) {
    super({cls: 'jsm-player-pane full-size'});

    this.model = model;
    this.fullscreenManager = fullscreenManager;
    
    this.infoOverlay = new InfoOverlay();
    this.appendChild(this.infoOverlay.domElement);
    
    this.settingsOverlay = new SettingsOverlay(model.settings.monitorConfig);
    this.appendChild(this.settingsOverlay.domElement);
    
    this.playlistOverlay = new PlaylistOverlay(model.logPlayer);
    this.appendChild(this.playlistOverlay.domElement);
    
    this.overlayGroup = new PanelGroup();
    this.overlayGroup.add(this.infoOverlay);
    this.overlayGroup.add(this.settingsOverlay);
    this.overlayGroup.add(this.playlistOverlay);
    
    UIUtil.el('div', { parent: this.domElement, cls: 'jsm-shadow-pane' });
    
    this.gameInfoBoard = new GameInfoBoard();
    this.gameInfoBoard.setVisible(false);
    this.domElement.appendChild(this.gameInfoBoard.domElement);
    
    this.waitingIndicator = UIUtil.el('div', { parent: this.domElement, cls: 'jsm-waiting-indicator no-text-select', title: 'Waiting for new data...' });
    UIUtil.setVisibility(this.waitingIndicator, false);
    
    this.barPane = UIUtil.el('div', { parent: this.domElement, cls: 'jsm-player-bar' });

    const scope = this;


    this.timeSlider = document.createElement('input');
    this.timeSlider.className = 'time-slider';
    this.timeSlider.type = 'range';
    this.timeSlider.min = '0';
    this.timeSlider.max = '6000';
    this.timeSlider.step = '1';
    this.timeSlider.value = '0';
    this.timeSlider.addEventListener('change', function(evt) {
      scope.model.logPlayer.jump(parseInt(this.value));
    });
    this.timeSlider.addEventListener('input', function(evt) {
      scope.model.logPlayer.jump(parseInt(this.value));
    });
    UIUtil.setVisibility(this.timeSlider, false);
    this.barPane.appendChild(this.timeSlider);

    this.leftPane = UIUtil.el('div', { parent: this.barPane, cls: 'left' });
    UIUtil.setVisibility(this.leftPane, false);

    this.rightPane = UIUtil.el('div', { parent: this.barPane, cls: 'right' });


    this.playBtn = UIUtil.createPlayerButton('',
      'player-btn icon-play',
      'Play',
      function() {
        scope.overlayGroup.hideAll();
        scope.model.logPlayer.playPause();
      },
      true);
    this.leftPane.appendChild(this.playBtn);

    this.jumpPreviousGoalBtn = UIUtil.createPlayerButton('',
      'player-btn icon-jump-prev',
      'Jump Previous Goal',
      function() {
        scope.overlayGroup.hideAll();
        scope.model.logPlayer.jumpGoal(true);
      },
      true);
    this.leftPane.appendChild(this.jumpPreviousGoalBtn);

    this.stepBackwardsBtn = UIUtil.createPlayerButton('',
      'player-btn icon-step-back',
      'Step Backwards',
      function() {
        scope.overlayGroup.hideAll();
        scope.model.logPlayer.step(true);
      },
      true);
    this.leftPane.appendChild(this.stepBackwardsBtn);

    this.stepForwardBtn = UIUtil.createPlayerButton('',
      'player-btn icon-step-fwd',
      'Step Forwards',
      function() {
        scope.overlayGroup.hideAll();
        scope.model.logPlayer.step();
      },
      true);
    this.leftPane.appendChild(this.stepForwardBtn);

    this.jumpNextGoalBtn = UIUtil.createPlayerButton('',
      'player-btn icon-jump-next',
      'Jump Next Goal',
      function() {
        scope.overlayGroup.hideAll();
        scope.model.logPlayer.jumpGoal();
      },
      true);
    this.leftPane.appendChild(this.jumpNextGoalBtn);

    this.currentTimeLbl = UIUtil.el('span', { parent: this.leftPane, content: '0:00.<small>00</small>', cls: 'current-time' });
    this.timeDividerLbl = UIUtil.el('span', { parent: this.leftPane, content: '/', cls: 'time-divider' });
    this.totalTimeLbl = UIUtil.el('span', { parent: this.leftPane, content: '0:00', cls: 'total-time' });


    this.playlistBtn = UIUtil.createPlayerButton('',
      'player-btn icon-playlist',
      'Playlist',
      function() { scope.playlistOverlay.toggleVisibility() },
      true);
    this.rightPane.appendChild(this.playlistBtn);

    // UIUtil.setVisibility(this.playlistBtn, this.model.state === MonitorStates.REPLAY);
    // this.playlistBtn.disabled = !this.model.logPlayer.playlist;
    UIUtil.setVisibility(this.playlistBtn, !!this.model.logPlayer.playlist);

    this.infoBtn = UIUtil.createPlayerButton('',
      'player-btn icon-info',
      'Info',
      function() { scope.infoOverlay.toggleVisibility() },
      true);
    this.rightPane.appendChild(this.infoBtn);

    this.settingsBtn = UIUtil.createPlayerButton('',
      'player-btn icon-settings',
      'Settings',
      function() { scope.settingsOverlay.toggleVisibility() },
      true);
    this.rightPane.appendChild(this.settingsBtn);

    this.fullscreenBtn = UIUtil.createPlayerButton('',
      'player-btn icon-fullscreen',
      'Fullscreen',
      function() {
        scope.overlayGroup.hideAll();
        scope.fullscreenManager.toggleFullscreen();
      },
      true);
    this.rightPane.appendChild(this.fullscreenBtn);

    if (!UIUtil.isFullscreenEnabled()) {
      this.fullscreenBtn.disabled = true;
      this.fullscreenBtn.title = 'Fullscreen not supported!';
    }


    // Add monitor model event listener
    this.model.addEventListener('change', this.handleMonitorStateChange, this);

    // Add fullscreen manager event listener
    this.fullscreenManager.addEventListener('change', this.handleFullscreenChange, this);
  }

  /**
   * Refresh the controls of the player bar (adapt to current model state).
   */
  refreshControls (): void
  {
    // Reset waiting indicator
    UIUtil.setVisibility(this.waitingIndicator, false);


    // Refresh player-buttons and time slider
    if (this.model.state === MonitorStates.REPLAY) {
      UIUtil.setVisibility(this.timeSlider, true);
      UIUtil.setVisibility(this.leftPane, true);

      // Refresh playlist button
      // UIUtil.setVisibility(this.playlistBtn, true);
      // this.playlistBtn.disabled = !this.model.logPlayer.playlist;
      UIUtil.setVisibility(this.playlistBtn, !!this.model.logPlayer.playlist);

      if (this.model.logPlayer.state === LogPlayerStates.EMPTY) {
        // Disable player controls
        this.timeSlider.disabled = true;
        this.playBtn.disabled = true;
        this.jumpPreviousGoalBtn.disabled = true;
        this.stepBackwardsBtn.disabled = true;
        this.stepForwardBtn.disabled = true;
        this.jumpNextGoalBtn.disabled = true;

        // Hide game info board
        this.gameInfoBoard.setVisible(false);

        // Reset time labels
        this.currentTimeLbl.innerHTML = '0:00.<small>00</small>';
        this.totalTimeLbl.innerHTML = '0:00';
      } else {
        // Enable player controls
        this.timeSlider.disabled = false;
        this.playBtn.disabled = false;
        this.jumpPreviousGoalBtn.disabled = false;
        this.stepBackwardsBtn.disabled = false;
        this.stepForwardBtn.disabled = false;
        this.jumpNextGoalBtn.disabled = false;

        // Show & update game info board
        this.gameInfoBoard.setVisible(true);
        this.gameInfoBoard.updateTeamNames(this.model.logPlayer.gameLog.leftTeam.name, this.model.logPlayer.gameLog.rightTeam.name);
        this.gameInfoBoard.update(this.model.logPlayer.getCurrentWorldState());
        this.updateTeamColors();

        // Reset time slider
        this.timeSlider.value = this.model.logPlayer.playIndex.toString();
        this.timeSlider.max = (this.model.logPlayer.gameLog.states.length - 1).toString();
        this.updateSliderBackground();


        this.currentTimeLbl.innerHTML = UIUtil.toMMSScs(this.model.logPlayer.playTime);
        this.totalTimeLbl.innerHTML = UIUtil.toMMSS(this.model.logPlayer.gameLog.duration);
      }

      UIUtil.setVisibility(this.waitingIndicator, this.model.logPlayer.state === LogPlayerStates.WAITING);

      this.refreshPlayBtn();
    } else {
      // Hide player controls
      UIUtil.setVisibility(this.timeSlider, false);
      UIUtil.setVisibility(this.leftPane, false);
      UIUtil.setVisibility(this.playlistBtn, false);
      this.gameInfoBoard.setVisible(false);
    }
  }

  /**
   * Set the background of the slider to show progress in chrome.
   */
  updateSliderBackground (): void
  {
    // Hack for webkit-browsers which don't support input range progress indication
    const percent = (parseFloat(this.timeSlider.value) / parseFloat(this.timeSlider.max)) * 100;
    this.timeSlider.style.background = '-webkit-linear-gradient(left, #e00 0%, #e00 ' + percent + '%, rgba(204,204,204, 0.7) ' + percent + '%)';
  }

  /**
   * Enable/Disable the jump goal buttons based on passed/upcoming goal counts.
   */
  updateJumpGoalButtons (): void
  {
    this.jumpPreviousGoalBtn.disabled = this.model.logPlayer.passedGoals === 0;
    this.jumpNextGoalBtn.disabled = this.model.logPlayer.upcomingGoals === 0;
  }

  /**
   * Update the team colors.
   */
  updateTeamColors (): void
  {
    const world = this.model.world;
    const config = this.model.settings.monitorConfig;

    if (config.teamColorsEnabled) {
      world.leftTeam.setColor(config.leftTeamColor);
      world.rightTeam.setColor(config.rightTeamColor);
      this.gameInfoBoard.updateTeamColors(config.leftTeamColor, config.rightTeamColor);
    } else {
      world.leftTeam.setColor();
      world.rightTeam.setColor();
      this.gameInfoBoard.updateTeamColors(world.leftTeam.description.color, world.rightTeam.description.color);
    }
  }

  /**
   * Refresh the player button.
   */
  refreshPlayBtn (): void
  {
    switch (this.model.logPlayer.state) {
      case LogPlayerStates.PLAY:
      case LogPlayerStates.WAITING:
        UIUtil.setIcon(this.playBtn, 'icon-pause');
        this.playBtn.title = 'Pause';
        break;
      case LogPlayerStates.END:
        UIUtil.setIcon(this.playBtn, 'icon-replay');
        this.playBtn.title = 'Replay';
        break;
      case LogPlayerStates.EMPTY:
      case LogPlayerStates.PAUSE:
      default:
        UIUtil.setIcon(this.playBtn, 'icon-play');
        this.playBtn.title = 'Play';
        break;
    }
  }

  /**
   * FullscreenManager->"change" event listener.
   * This event listener is triggered when the monitor component entered or left fullscreen mode.
   *
   * @param evt the change event
   */
  handleFullscreenChange (evt: GEventObject): void
  {
    if (this.fullscreenManager.isFullscreen()) {
      UIUtil.setIcon(this.fullscreenBtn, 'icon-partscreen');
      this.fullscreenBtn.title = 'Leave Fullscreen';
    } else {
      UIUtil.setIcon(this.fullscreenBtn, 'icon-fullscreen');
      this.fullscreenBtn.title = 'Fullscreen';
    }
  }

  /**
   * LogPlayer->"game-log-change" event listener.
   * This event listener is triggered when the game log instance within the player changed.
   *
   * @param evt the event
   */
  handleGameLogChange (evt: GChangeEvent<SimulationLog | undefined>): void
  {
    this.timeSlider.value = this.model.logPlayer.playIndex.toString();

    const newGameLog = this.model.logPlayer.gameLog;
    if (newGameLog) {
      this.timeSlider.max = (newGameLog.states.length - 1).toString();
      this.totalTimeLbl.innerHTML = UIUtil.toMMSS(newGameLog.duration);
      this.gameInfoBoard.updateTeamNames(newGameLog.leftTeam.name, newGameLog.rightTeam.name);
      this.gameInfoBoard.update(this.model.logPlayer.getCurrentWorldState());
      this.updateTeamColors();
    }

    this.updateSliderBackground();
    this.updateJumpGoalButtons();
    this.currentTimeLbl.innerHTML = UIUtil.toMMSScs(this.model.logPlayer.playTime);
  }

  /**
   * LogPlayer->"playlist-change" event listener.
   * This event listener is triggered when the playlist instance within the player changed.
   *
   * @param evt the event
   */
  handlePlaylistChange (evt: GChangeEvent<Playlist | undefined>): void
  {
    // this.playlistBtn.disabled = !this.model.logPlayer.playlist;
    UIUtil.setVisibility(this.playlistBtn, !!this.model.logPlayer.playlist);
  }

  /**
   * LogPlayer->"time-change" event listener.
   * This event listener is triggered when the play time of the log player changed.
   *
   * @param evt the event
   */
  handlePlayerTimeChange (evt: GChangeEvent<number>): void
  {
    this.timeSlider.value = this.model.logPlayer.playIndex.toString();

    this.updateSliderBackground();
    this.updateJumpGoalButtons();
    this.currentTimeLbl.innerHTML = UIUtil.toMMSScs(this.model.logPlayer.playTime);
    this.gameInfoBoard.update(this.model.logPlayer.getCurrentWorldState());
  }

  /**
   * LogPlayer->"game-log-updated" event listener.
   * This event listener is triggered when the current game log was updated/extended.
   *
   * @param evt the event
   */
  handleGameLogUpdated (evt: GEventObject): void
  {
    const gameLog = this.model.logPlayer.gameLog;

    this.timeSlider.max = (gameLog.states.length - 1).toString();

    this.updateSliderBackground();
    this.updateJumpGoalButtons();
    this.totalTimeLbl.innerHTML = UIUtil.toMMSS(gameLog.duration);
    this.gameInfoBoard.updateTeamNames(gameLog.leftTeam.name, gameLog.rightTeam.name);
    this.updateTeamColors();
  }

  /**
   * MonitorModel->"state-change" event listener.
   * This event listener is triggered when the monitor model state has changed.
   *
   * @param evt the change event
   */
  handleMonitorStateChange (evt: GChangeEvent<MonitorStates>): void
  {
    // Refresh controls for new state
    this.refreshControls();

    // Remove obsolete event handler
    switch (evt.oldValue) {
      case MonitorStates.REPLAY:
        // Remove log player state change listener
        this.model.logPlayer.removeEventListener('state-change', this.handlePlayerStateChange, this);
        this.model.logPlayer.removeEventListener('game-log-updated', this.handleGameLogUpdated, this);
        this.model.logPlayer.removeEventListener('time-change', this.handlePlayerTimeChange, this);
        this.model.logPlayer.removeEventListener('game-log-change', this.handleGameLogChange, this);
        this.model.logPlayer.removeEventListener('playlist-change', this.handlePlaylistChange, this);
        break;
      case MonitorStates.STREAM:
        break;
      case MonitorStates.LIVE:
        break;
      case MonitorStates.INIT:
      default:
        // Do nothing...
        break;
    }

    // Add relevant event handler
    switch (evt.newValue) {
      case MonitorStates.REPLAY:
        // Add log player state change listener
        this.model.logPlayer.addEventListener('state-change', this.handlePlayerStateChange, this);
        this.model.logPlayer.addEventListener('game-log-updated', this.handleGameLogUpdated, this);
        this.model.logPlayer.addEventListener('time-change', this.handlePlayerTimeChange, this);
        this.model.logPlayer.addEventListener('game-log-change', this.handleGameLogChange, this);
        this.model.logPlayer.addEventListener('playlist-change', this.handlePlaylistChange, this);
        break;
      case MonitorStates.STREAM:
        break;
      case MonitorStates.LIVE:
        break;
      case MonitorStates.INIT:
      default:
        // Do nothing...
        break;
    }
  }

  /**
   * LogPlayer->"state-change" event listener.
   * This event listener is triggered when the log player state has changed.
   *
   * @param evt the change event
   */
  handlePlayerStateChange (evt: GChangeEvent<LogPlayerStates>): void
  {
    if (evt.oldValue === LogPlayerStates.EMPTY) {
      this.refreshControls();
    } else {
      this.refreshPlayBtn();
    }

    if (this.model.logPlayer.state === LogPlayerStates.WAITING) {
      UIUtil.setVisibility(this.waitingIndicator, true);
    } else {
      UIUtil.setVisibility(this.waitingIndicator, false);
    }
  }
}

export { PlayerUI };
