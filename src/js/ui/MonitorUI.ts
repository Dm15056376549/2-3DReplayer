import { LogPlayer } from '../model/logplayer/LogPlayer';
import { MonitorModel, MonitorStates } from '../model/MonitorModel';
import { UIUtil } from '../utils/UIUtil';
import { DnDHandler } from './utils/DnDHandler';
import { FullscreenManager } from './utils/FullscreenManager';
import { GLPanel } from './gl/GLPanel';
import { InputController } from './player/InputController';
import { LoadingBar } from './player/LoadingBar';
import { PlayerUI } from './player/PlayerUI';
import { ResourceExplorer } from './explorer/ResourceExplorer';
import { WelcomeOverlay } from './player/WelcomeOverlay';
import { WorldLoader } from '../model/gl/world/loader/WorldLoader';
import { MonitorConfigurationProperties } from '../model/settings/MonitorConfiguration';
import { GChangeEvent, GEventObject, GPropertyChangeEvent } from '../utils/EventDispatcher';

/**
 * The MonitorUI class definition.
 *
 * The MonitorUI abstracts the handling of the player related ui elements.
 *
 * @author Stefan Glaser
 */
class MonitorUI
{
  /** The monitor model. */
  model: MonitorModel;

  /** The player root element. */
  domElement: HTMLDivElement;

  /** The drag and drop handler. */
  dndHandler: DnDHandler;

  /** The fullscreen manager. */
  fullscreenManager: FullscreenManager;

  /** The explorer root element. */
  explorerRoot: HTMLDivElement;

  /** The root divider element. */
  rootDivider: HTMLDivElement;

  /** The monitor root element. */
  monitorRoot: HTMLDivElement;

  /** The resource explorer. */
  resourceExplorer: ResourceExplorer;

  /** The webgl panel instance, handling the webgl rendering. */
  glPanel: GLPanel;

  /** The mouse and keyboard input controller. */
  inputController: InputController;

  /** The top loading bar. */
  loadingBar: LoadingBar;

  /** The welcome overlay (providing local file selection). */
  welcomeOverlay: WelcomeOverlay;

  /** The player bar. */
  playerUI: PlayerUI;


  /**  */
  handleRevealExplorerListener: (ev: MouseEvent | KeyboardEvent) => any;
  /**  */
  handleHideExplorerListener: (ev: MouseEvent | KeyboardEvent) => any;
  /**  */
  handleAutoSizeExplorerListener: (ev: Event) => any;

  /** The reveal explorer button. */
  revealExplorerBtn: HTMLButtonElement;

  /** The hide explorer button. */
  hideExplorerBtn: HTMLButtonElement;


  /**  */
  handleEWResizeStartListener: (ev: MouseEvent) => any;
  /**  */
  handleEWResizeEndListener: (ev: MouseEvent) => any;
  /**  */
  handleEWResizeListener: (ev: MouseEvent) => any;

  /**  */
  handleResizeListener: (ev: UIEvent) => any;

  /**
   * MonitorUI Constructor
   *
   * @param model the monitor model
   * @param container the monitor root dom element
   */
  constructor (model: MonitorModel, container: HTMLElement)
  {
    this.model = model;
    this.domElement = UIUtil.el('div', { parent: container, cls: 'jsm-root' });

    this.dndHandler = new DnDHandler();
    this.dndHandler.onNewFilesDropped = function () {
      const mm = model;

      return function (files) {
        mm.loadFiles(files);
      };
    }();

    this.fullscreenManager = new FullscreenManager(this.domElement);
    
    this.explorerRoot = UIUtil.el('div', { parent: this.domElement, cls: 'explorer-root' });
    this.rootDivider = UIUtil.el('div', { parent: this.domElement, cls: 'root-divider' });
    this.monitorRoot = UIUtil.el('div', { parent: this.domElement, cls: 'monitor-root' });
    
    this.resourceExplorer = new ResourceExplorer(this.model);
    this.explorerRoot.appendChild(this.resourceExplorer.domElement);

    this.glPanel = new GLPanel(this.monitorRoot);
    this.glPanel.onNewRenderCycle = this.handleNewRenderCycle.bind(this);
    this.glPanel.scene = this.model.world.scene;
    this.glPanel.glInfoBoard.setVisible(this.model.settings.monitorConfig.glInfoEnabled);
    this.glPanel.renderer.shadowMap.enabled = this.model.settings.monitorConfig.shadowsEnabled;
    this.glPanel.renderInterval = 30;

    this.inputController = new InputController(this.model, this.glPanel, this.fullscreenManager, this.dndHandler);
    this.monitorRoot.appendChild(this.inputController.domElement);

    this.loadingBar = new LoadingBar(this.model.logPlayer.gameLogLoader);
    this.monitorRoot.appendChild(this.loadingBar.domElement);

    this.welcomeOverlay = new WelcomeOverlay(this.dndHandler);
    this.monitorRoot.appendChild(this.welcomeOverlay.domElement);

    this.playerUI = new PlayerUI(this.model, this.fullscreenManager);
    this.monitorRoot.appendChild(this.playerUI.domElement);


    this.handleRevealExplorerListener = this.showExplorer.bind(this);
    this.handleHideExplorerListener = this.hideExplorer.bind(this);
    this.handleAutoSizeExplorerListener = this.autoSizeExplorer.bind(this);

    this.revealExplorerBtn = UIUtil.createPlayerButton('&nbsp;&nbsp;&gt;', 'reveal-explorer-btn', 'Show Resource Explorer', this.handleRevealExplorerListener, true);
    this.domElement.appendChild(this.revealExplorerBtn);
    UIUtil.setVisibility(this.revealExplorerBtn, false);

    this.hideExplorerBtn = UIUtil.createPlayerButton('&lt;&nbsp;&nbsp;', 'hide-explorer-btn', 'Hide Resource Explorer', this.handleHideExplorerListener, true);
    this.rootDivider.appendChild(this.hideExplorerBtn);


    this.handleEWResizeStartListener = this.handleEWResizeStart.bind(this);
    this.handleEWResizeEndListener = this.handleEWResizeEnd.bind(this);
    this.handleEWResizeListener = this.handleEWResize.bind(this);


    // Add monitor model event listener
    this.model.addEventListener('change', this.handleMonitorStateChange, this);

    // Add root divider event listeners
    this.rootDivider.addEventListener('mousedown', this.handleEWResizeStartListener, false);
    this.rootDivider.addEventListener('dblclick', this.handleAutoSizeExplorerListener, false);

    // Add monitor config change lister
    this.model.settings.monitorConfig.addEventListener('change', this.handleMonitorConfigChange, this);

    // Add world change lister
    this.model.world.addEventListener('change', this.handleWorldChange, this);


    this.handleResizeListener = this.handleResize.bind(this);

    // Add window resize & beforeunload listener
    window.addEventListener('resize', this.handleResizeListener);
    window.addEventListener('beforeunload', function() {
      const mm = model;

      return function (evt) {
        mm.settings.save();
      };
    }());


    // Check for embedded mode
    if (this.model.embedded) {
      this.hideExplorer();

      // Hide welcome overlay
      this.welcomeOverlay.setVisible(false);
    }
  }

  /**
   * World->"change" event listener.
   * This event listener is triggered when the world representation has changed.
   *
   * @param evt the change event
   */
  handleWorldChange (evt: GEventObject): void
  {
    this.inputController.camCon.setAreaOfInterest(this.model.world.field.fieldDimensions);
    this.inputController.camCon.setPredefinedPose();
    this.inputController.domElement.focus();
  }

  /**
   * @param deltaT the time passed since the last render cycle in milliseconds
   */
  handleNewRenderCycle (deltaT: number): void
  {
    // Do stuff...

    // Forward call to player
    if (this.model.state === MonitorStates.REPLAY) {
      this.model.logPlayer.update(deltaT);
    }
  }

  /**
   * @param evt the mouse event
   */
  handleEWResizeStart (evt: MouseEvent): void
  {
    // Prevent scrolling, text-selection, etc.
    evt.preventDefault();
    evt.stopPropagation();

    this.domElement.style.cursor = 'ew-resize';
    this.domElement.addEventListener('mousemove', this.handleEWResizeListener);
    this.domElement.addEventListener('mouseup', this.handleEWResizeEndListener);
  }

  /**
   * @param evt the mouse event
   */
  handleEWResizeEnd (evt: MouseEvent): void
  {
    this.domElement.style.cursor = '';
    this.domElement.removeEventListener('mousemove', this.handleEWResizeListener);
    this.domElement.removeEventListener('mouseup', this.handleEWResizeEndListener);

    const percent = 100 * (evt.clientX + 2) / this.domElement.offsetWidth;

    if (percent < 5) {
      this.hideExplorer();
    }
  }

  /**
   * @param evt the mouse event
   */
  handleEWResize (evt: MouseEvent): void
  {
    // Prevent scrolling, text-selection, etc.
    evt.preventDefault();
    evt.stopPropagation();

    let percent = 100 * (evt.clientX + 2) / this.domElement.offsetWidth;

    // Limit explorer width to a maximum of 50%
    if (percent > 50) {
      percent = 50;
    }

    // Hide explorer if now width is sell than 5%
    if (percent < 5) {
      this.explorerRoot.style.width = '0px';
      this.monitorRoot.style.width = 'calc(100% - 3px)';
    } else {
      this.explorerRoot.style.width = 'calc(' + percent + '% - 3px)';
      this.monitorRoot.style.width = '' + (100 - percent) + '%';
    }

    this.glPanel.autoResize();
  }

  /**
   * Handle resizing of window.
   *
   * @param evt the resize event
   */
  handleResize (evt: UIEvent): void
  {
    this.glPanel.autoResize();
  }

  /**
   * Automatically resize the resource explorer to its reuired width or the maximum width of 50%.
   */
  autoSizeExplorer (): void
  {
    if (this.explorerRoot.scrollWidth === this.explorerRoot.offsetWidth) {
      // Nothing to scroll, thus nothing to resize
      return;
    }

    // Show explorer and divider
    UIUtil.setVisibility(this.explorerRoot, true);
    UIUtil.setVisibility(this.rootDivider, true);

    let percent = 100 * (this.explorerRoot.scrollWidth + 3) / this.domElement.offsetWidth;

    if (percent > 50) {
      percent = 50;
    }

    // Resize containers
    this.explorerRoot.style.width = 'calc(' + percent + '% - 3px)';
    this.monitorRoot.style.width = '' + (100 - percent) + '%';
    this.glPanel.autoResize();

    // Hide reveal explorer button
    UIUtil.setVisibility(this.revealExplorerBtn, false);
  }

  /**
   * Show the resource explorer.
   */
  showExplorer (): void
  {
    if (this.model.embedded) {
      return;
    }

    // Show explorer and divider
    UIUtil.setVisibility(this.explorerRoot, true);
    UIUtil.setVisibility(this.rootDivider, true);

    // Resize containers
    this.explorerRoot.style.width = 'calc(25% - 3px)';
    this.explorerRoot.scrollLeft = 0;
    this.monitorRoot.style.width = '75%';
    this.glPanel.autoResize();

    // Hide reveal explorer button
    UIUtil.setVisibility(this.revealExplorerBtn, false);
  }

  /**
   * Hide the resource explorer.
   */
  hideExplorer (): void
  {
      // Hide explorer and divider
      UIUtil.setVisibility(this.explorerRoot, false);
      UIUtil.setVisibility(this.rootDivider, false);

      // Maximize monitor container
      this.monitorRoot.style.width = '100%';
      this.glPanel.autoResize();

      // Show reveal explorer button if not in embedded mode
      UIUtil.setVisibility(this.revealExplorerBtn, !this.model.embedded);
  }

  /**
   * MonitorConfiguration->"change" event handler.
   * This event handler is triggered when a property of the monitor configuration has changed.
   *
   * @param evt the event
   */
  handleMonitorConfigChange (evt: GPropertyChangeEvent): void
  {
    const config = this.model.settings.monitorConfig;

    switch (evt.property) {
      case MonitorConfigurationProperties.SHADOWS_ENABLED:
        this.model.world.setShadowsEnabled(config.shadowsEnabled);
        this.glPanel.renderer.shadowMap.enabled = config.shadowsEnabled;
        break;
      case MonitorConfigurationProperties.TEAM_COLORS_ENABLED:
      case MonitorConfigurationProperties.TEAM_COLOR_LEFT:
      case MonitorConfigurationProperties.TEAM_COLOR_RIGHT:
        this.playerUI.updateTeamColors();
        break;
      case MonitorConfigurationProperties.GL_INFO_ENABLED:
        this.glPanel.glInfoBoard.setVisible(config.glInfoEnabled);
        break;
    }
  }

  /**
   * MonitorModel->"state-change" event listener.
   * This event listener is triggered when the monitor model state has changed.
   *
   * @param evt the change event
   */
  handleMonitorStateChange (evt: GChangeEvent<MonitorStates>): void
  {
    if (evt.newValue !== MonitorStates.INIT) {
      this.welcomeOverlay.setVisible(false);
      this.glPanel.renderInterval = 1;
      this.glPanel.renderTTL = 1;
    } else {
      this.glPanel.renderInterval = 30;
    }
  }
}

export { MonitorUI };
