import { MonitorModel } from '../../model/MonitorModel';
import { LogPlayer } from '../../model/logplayer/LogPlayer';
import { UIUtil } from '../../utils/UIUtil';
import { DnDHandler } from '../utils/DnDHandler';
import { FullscreenManager } from '../utils/FullscreenManager';
import { GLPanel } from '../gl/GLPanel';
import { UniversalCameraController } from '../gl/UniversalCameraController';
import { KeyCodes, CharCodes } from '../../Constants';
import { MovableObject } from '../../model/gl/world/MovableObject.js';
import { MOUSE, Vector2 } from 'three';

/**
 * The InputController class definition.
 *
 * @author Stefan Glaser
 */
class InputController
{
  /** The input controller element. */
  domElement: HTMLDivElement;

  /** The monitor model instance. */
  model: MonitorModel;

  /** The fullscreen manager. */
  fullscreenManager: FullscreenManager;

  /** The dnd-handler instance. */
  dndHandler: DnDHandler;

  /** The camera controller. */
  camCon: UniversalCameraController;


  /** Enable/Disable camera controller. */
  enabled: boolean;

  /** The selected object. */
  selectedObject?: MovableObject;

  /** Indicator if the current mouse event series indicates a select action. */
  selectAction: boolean;

  /** Indicator if the current mouse event series indicates a play/pause action. */
  playPauseAction: boolean;

  /** Indicator if document mouse listeners are active. */
  docMouseEnabled: boolean;


  onContextMenuListener: (evt: MouseEvent) => any;
  onMouseDownListener: (evt: MouseEvent) => any;
  onMouseUpListener: (evt: MouseEvent) => any;
  onMouseMoveListener: (evt: MouseEvent) => any;
  onMouseWheelListener: (evt: WheelEvent) => any;
  onMouseInListener: (evt: MouseEvent) => any;

  onTouchStartListener: (evt: TouchEvent) => any;
  onTouchEndListener: (evt: TouchEvent) => any;
  onTouchMoveListener: (evt: TouchEvent) => any;

  onKeyDownListener: (evt: KeyboardEvent) => any;
  onKeyPressedListener: (evt: KeyboardEvent) => any;
  onKeyUpListener: (evt: KeyboardEvent) => any;

  /**
   * The monitor input controller.
   *
   * @param model the monitor model instance
   * @param glPanel the GL panel
   * @param fullscreenManager the fullscreen manager
   * @param dndHandler the dnd-handler
   */
  constructor (model: MonitorModel, glPanel: GLPanel, fullscreenManager: FullscreenManager, dndHandler: DnDHandler)
  {
    this.domElement = document.createElement('div');
    this.domElement.tabIndex = 0;
    this.domElement.className = 'jsm-input-pane full-size';

    // Create a drop indicator box
    UIUtil.el('div', { parent: this.domElement, content: '<span>Drop Replays or SServer Logs to Play</span>', cls: 'dnd-box' });

    this.model = model;
    this.fullscreenManager = fullscreenManager;
    this.dndHandler = dndHandler;
    this.camCon = new UniversalCameraController(glPanel.camera, glPanel.renderer.domElement);
    this.enabled = true;
    this.selectedObject = undefined;
    this.selectAction = false;
    this.playPauseAction = false;
    this.docMouseEnabled = false;


    this.onContextMenuListener = this.onContextMenu.bind(this);
    this.onMouseDownListener = this.onMouseDown.bind(this);
    this.onMouseUpListener = this.onMouseUp.bind(this);
    this.onMouseMoveListener = this.onMouseMove.bind(this);
    this.onMouseWheelListener = this.onMouseWheel.bind(this);
    this.onMouseInListener = this.onMouseIn.bind(this);

    this.onTouchStartListener = this.onTouchStart.bind(this);
    this.onTouchEndListener = this.onTouchEnd.bind(this);
    this.onTouchMoveListener = this.onTouchMove.bind(this);

    this.onKeyDownListener = this.onKeyDown.bind(this);
    this.onKeyPressedListener = this.onKeyPressed.bind(this);
    this.onKeyUpListener = this.onKeyUp.bind(this);


    // Add Drag and Drop listeners
    this.dndHandler.addListeners(this.domElement);

    this.domElement.addEventListener('contextmenu', this.onContextMenuListener);
    this.domElement.addEventListener('mousedown', this.onMouseDownListener);
    this.domElement.addEventListener('wheel', this.onMouseWheelListener);

    // this.domElement.addEventListener('touchstart', this.onTouchStartListener);
    // this.domElement.addEventListener('touchend', onTouchEnd);
    // this.domElement.addEventListener('touchmove', onTouchMove);

    this.domElement.addEventListener('keydown', this.onKeyDownListener);
    this.domElement.addEventListener('keypress', this.onKeyPressedListener);
    this.domElement.addEventListener('keyup', this.onKeyUpListener);

    // Set camera controller on GL panel
    glPanel.cameraController = this.camCon;
  }

  /**
   * Enable/Disable the camera controller.
   *
   * @param enabled true to enable the camera controller, false for disabling
   */
  setEnabled (enabled: boolean)
  {
    if (this.enabled !== enabled) {
      this.enabled = enabled;
    }
  }

  /**
   * Select the given object.
   *
   * @param obj the object to select or undefined to clear the selection
   */
  selectObject (obj?: MovableObject)
  {
    if (this.selectedObject) {
      this.selectedObject.setSelected(false);
    }

    this.selectedObject = obj;

    if (this.selectedObject) {
      this.selectedObject.setSelected(true);
    }
  }

  /**
   * The on context menu event listener.
   *
   * @param event the event object
   */
  onContextMenu (event: Event): void
  {
    if (!this.enabled) { return; }

    event.preventDefault();
  }

  /**
   * The on mouse down event listener.
   *
   * @param event the mouse event
   */
  onMouseDown (event: MouseEvent): void
  {
    if (!this.enabled) { return; }

    // console.log('InputCon: onMouseDown');

    if (!this.docMouseEnabled) {
      this.docMouseEnabled = true;
      // console.log('InputCon: enable doc listeners');
      document.addEventListener('mouseup', this.onMouseUpListener);
      document.addEventListener('mousemove', this.onMouseMoveListener);
      document.addEventListener('mouseover', this.onMouseInListener);
    }

    const clickPos = InputController.eventToLocalCenterPos(this.domElement, event);

    switch (event.button) {
      case MOUSE.LEFT:
        this.camCon.handleStartRotate(clickPos);
        this.selectAction = true;
        break;
      case MOUSE.MIDDLE:
        this.camCon.handleStartZoom(clickPos);
        this.playPauseAction = true;
        break;
      case MOUSE.RIGHT:
        this.camCon.handleStartPan(clickPos);
        break;
      default:
        break;
    }
  }

  /**
   * The on mouse up event listener.
   *
   * @param event the mouse event
   */
  onMouseUp (event: MouseEvent): void
  {
    if (!this.enabled) { return; }

    // console.log('InputCon: onMouseUp');

    const clickPos = InputController.eventToLocalCenterPos(this.domElement, event);

    switch (event.button) {
      case MOUSE.LEFT:
        this.camCon.handleEndRotate();

        if (this.selectAction) {
          // TODO: Try to select the actual object below the cursor
          this.selectObject();
        }
        break;
      case MOUSE.MIDDLE:
        this.camCon.handleEndZoom();

        if (this.playPauseAction) {
          this.model.logPlayer.playPause();
        }
        break;
      case MOUSE.RIGHT:
        this.camCon.handleEndPan();
        break;
      default:
        break;
    }

    if (!this.camCon.isWaitingForMouseEvents()) {
      this.docMouseEnabled = false;
      // console.log('InputCon: disable doc listeners');
      document.removeEventListener('mouseup', this.onMouseUpListener);
      document.removeEventListener('mousemove', this.onMouseMoveListener);
      document.removeEventListener('mouseover', this.onMouseInListener);
    }
  }

  /**
   * The on mouse move event listener.
   *
   * @param event the mouse event
   */
  onMouseMove (event: MouseEvent): void
  {
    if (!this.enabled) { return; }

    // Prevent browser from selecting any text, drag/drop the element, etc.
    event.preventDefault();
    event.stopPropagation();

    this.selectAction = false;
    this.playPauseAction = false;

    // console.log('InputCon: onMouseMove');

    const clickPos = InputController.eventToLocalCenterPos(this.domElement, event);

    this.camCon.handleRotate(clickPos);
    this.camCon.handleMouseZoom(clickPos);
    this.camCon.handlePan(clickPos);
  }

  /**
   * The on mouse wheel event listener.
   *
   * @param event the mouse event
   */
  onMouseWheel (event: WheelEvent): void
  {
    if (!this.enabled) { return; }

    // Prevent browser from scrolling and other stuff
    event.preventDefault();
    event.stopPropagation();

    // console.log('InputCon: onMouseWheel');

    let scrollAmount = 0;

    if (event.deltaY !== undefined) {
      // WebKit / Opera / Explorer 9
      scrollAmount = -event.deltaY;
    } else if (event.detail !== undefined) {
      // Firefox
      scrollAmount = -event.detail;
    }

    if (scrollAmount !== 0) {
      const clickPos = InputController.eventToLocalCenterPos(this.domElement, event);

      this.camCon.handleWheelZoom(clickPos, scrollAmount);
    }
  }

  /**
   * The on mouse in event listener.
   *
   * @param event the mouse event
   */
  onMouseIn (event: MouseEvent): void
  {
    if (!this.enabled) { return; }

    // console.log('InputCon: onMouseIn');

    if ((0x01 & event.buttons) === 0) {
      this.camCon.handleEndRotate();
    }

    if ((0x02 & event.buttons) === 0) {
      this.camCon.handleEndPan();
    }

    if ((0x04 & event.buttons) === 0) {
      this.camCon.handleEndZoom();
    }

    if (!this.camCon.isWaitingForMouseEvents()) {
      this.docMouseEnabled = false;
      // console.log('InputCon: disable doc listeners');
      document.removeEventListener('mouseup', this.onMouseUpListener);
      document.removeEventListener('mousemove', this.onMouseMoveListener);
      document.removeEventListener('mouseover', this.onMouseInListener);
    }
  }

  /**
   * The on touch start event listener.
   *
   * @param event te touch event
   */
  onTouchStart (event: TouchEvent): void
  {
    if (!this.enabled) { return; }

    // console.log('InputCon: onTouchStart');
  }

  /**
   * The on touch end event listener.
   *
   * @param event te touch event
   */
  onTouchEnd (event: TouchEvent): void
  {
    if (!this.enabled) { return; }

    // console.log('InputCon: onTouchEnd');
  }

  /**
   * The on touch move event listener.
   *
   * @param event te touch event
   */
  onTouchMove (event: TouchEvent): void
  {
    if (!this.enabled) { return; }

    // console.log('InputCon: onTouchMove');
  }

  /**
   * The on key down event listener.
   *
   * @param event the key event
   */
  onKeyDown (event: KeyboardEvent): void
  {
    if (!this.enabled) { return; }

    // console.log('InputCon: onKeyDown');
    // console.log(event);

    switch (event.keyCode) {
      case KeyCodes.LEFT:
      case KeyCodes.A:
        this.camCon.moveLeft();
        break;
      case KeyCodes.UP:
      case KeyCodes.W:
        this.camCon.moveForward();
        break;
      case KeyCodes.RIGHT:
      case KeyCodes.D:
        this.camCon.moveRight();
        break;
      case KeyCodes.DOWN:
      case KeyCodes.S:
        this.camCon.moveBack();
        break;
      case KeyCodes.PAGE_UP:
      case KeyCodes.Q:
        this.camCon.moveUp();
        break;
      case KeyCodes.PAGE_DOWN:
      case KeyCodes.E:
        this.camCon.moveDown();
        break;
    }
  }

  /**
   * The on key down event listener.
   *
   * @param event the key event
   */
  onKeyPressed (event: KeyboardEvent): void
  {
    if (!this.enabled) { return; }

    let preventDefault = false;

    // console.log('InputCon: onKeyDown ' + event.key);
    // console.log(event);

    switch (event.charCode) {
      case CharCodes.ZERO:
        // Select the ball object
        this.selectObject(this.model.world.ball);
        break;
      case CharCodes.ONE:
        this.camCon.setPredefinedPose(0);
        break;
      case CharCodes.TWO:
        this.camCon.setPredefinedPose(1);
        break;
      case CharCodes.THREE:
        this.camCon.setPredefinedPose(2);
        break;
      case CharCodes.FOUR:
        this.camCon.setPredefinedPose(3);
        break;
      case CharCodes.FIVE:
        this.camCon.setPredefinedPose(4);
        break;
      case CharCodes.SIX:
        this.camCon.setPredefinedPose(5);
        break;
      case CharCodes.SEVEN:
        this.camCon.setPredefinedPose(6);
        break;
      case CharCodes.EIGHT:
        this.camCon.setPredefinedPose(7);
        break;
      case CharCodes.NINE:
        break;
      case CharCodes.p:
        this.model.logPlayer.playPause();
        break;
      case CharCodes.PLUS:
        if (!event.ctrlKey) {
          this.model.logPlayer.step();
        }
        break;
      case CharCodes.MINUS:
        if (!event.ctrlKey) {
          this.model.logPlayer.step(true);
        }
        break;
      case CharCodes.SPACE:
        // Prevent browser from scrolling
        preventDefault = true;

        // Toggle tracking of ball
        if (!this.camCon.trackingObject) {
          this.camCon.trackObject(this.model.world.ball.objGroup);
        } else {
          this.camCon.trackObject();
        }
        break;
      case CharCodes.ENTER:
        if (event.ctrlKey) {
          this.fullscreenManager.toggleFullscreen();
        }
        break;
    }


    if (event.charCode === 0) {
      // Some keys don't provide char codes
      switch (event.keyCode) {
        case KeyCodes.ENTER:
          if (event.ctrlKey) {
            this.fullscreenManager.toggleFullscreen();
          }
          break;
      }
    }


    if (preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  /**
   * The on key up event listener.
   *
   * @param event the key event
   */
  onKeyUp (event: KeyboardEvent): void
  {
    if (!this.enabled) { return; }

    // console.log('InputCon: onUp');
    // console.log(event);

    switch (event.keyCode) {
      case KeyCodes.LEFT:
      case KeyCodes.A:
      case KeyCodes.RIGHT:
      case KeyCodes.D:
        this.camCon.stopMoveLeftRight();
        break;
      case KeyCodes.UP:
      case KeyCodes.W:
      case KeyCodes.DOWN:
      case KeyCodes.S:
        this.camCon.stopMoveForwardBack();
        break;
      case KeyCodes.PAGE_UP:
      case KeyCodes.Q:
      case KeyCodes.PAGE_DOWN:
      case KeyCodes.E:
        this.camCon.stopMoveUpDown();
        break;
    }
  }



  /**
   * Extract the event position relative to the given element.
   *
   * @param element the parent element
   * @param event the event
   * @returns
   */
  static eventToLocalPos (element: HTMLElement, event: MouseEvent): Vector2
  {
    const rect = element.getBoundingClientRect();

    return new Vector2(event.clientX - rect.left, event.clientY - rect.top);
  }

  /**
   * Extract the event position relative to the center of the given element.
   *
   * @param element the parent element
   * @param event the event
   * @returns 
   */
  static eventToLocalCenterPos (element: HTMLElement, event: MouseEvent): Vector2
  {
    const halfWidth = element.clientWidth / 2;
    const halfHeight = element.clientHeight / 2;
    const rect = element.getBoundingClientRect();

    return new Vector2(event.clientX - rect.left - halfWidth, halfHeight - event.clientY + rect.top);
  }
}

export { InputController };
