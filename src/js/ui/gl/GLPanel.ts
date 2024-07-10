import { FPSMeter } from '../../utils/FPSMeter';
import { GLInfoBoard } from './GLInfoBoard';
import { ICameraController } from './ICameraController';
import { Clock, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';

/**
 * The GLPanel class definition.
 *
 * @author Stefan Glaser
 */
class GLPanel
{
  /**
   * The render interval.
   * 1 --> the scene is rendered every cycle
   * 2 --> the scene is rendered every second cycle
   * 3 --> the scene is rendered every third cycle
   * etc.
   */
  renderInterval: number;

  /** The number of render cycles befor the next scene rendering. */
  renderTTL: number;

  /** The time passed since the last render call. */
  timeSinceLastRenderCall: number;

  /** The Camera instance. */
  camera: PerspectiveCamera;

  /** The WebGLRenderer instance from threejs. */
  renderer: WebGLRenderer;

  /** The Scene instance to render. */
  scene?: Scene;

  /** The camera controller. */
  cameraController?: ICameraController;

  /** The clock used to measure render times. */
  clock: Clock;

  /** A helper util for monitoring the fps of the monitor. */
  fpsMeter: FPSMeter;

  /** The gl info board. */
  glInfoBoard: GLInfoBoard;

  /** A listener to notify when a render cycle was triggered. */
  onNewRenderCycle: ((deltaT: number) => any) | undefined;

  /** The render function bound to this monitor instance. */
  renderFunction: FrameRequestCallback;

  /**
   * GLPanel Constructor
   *
   * @param container the gl panel root dom element
   */
  constructor (container: HTMLElement)
  {
    // Fetch initial container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.renderInterval = 1;
    this.renderTTL = 1;
    this.timeSinceLastRenderCall = 0;
    
    this.camera = new PerspectiveCamera(45, width / height, 0.1, 2000);
    this.camera.position.set(20, 15, 15);
    this.camera.lookAt(new Vector3());
    this.camera.updateMatrix();

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    container.appendChild(this.renderer.domElement);

    this.scene = undefined;
    this.cameraController = undefined;
    this.clock = new Clock(true);
    this.fpsMeter = new FPSMeter(10);
    
    this.glInfoBoard = new GLInfoBoard(this.fpsMeter);
    this.glInfoBoard.setVisible(false);
    container.appendChild(this.glInfoBoard.domElement);
    
    this.onNewRenderCycle = undefined;
    this.renderFunction = this.render.bind(this);


    // Start animation
    requestAnimationFrame(this.renderFunction);
  }

  /**
   * The central gl render function.
   *
   * @param time
   */
  render (time: DOMHighResTimeStamp): void
  {
    // TODO: Check if we actually get a DOMHighResTimeStamp argument and if so, consider using it.
    // Kepp render look alive
    requestAnimationFrame(this.renderFunction);

    // Fetch delta time sine last render call
    this.timeSinceLastRenderCall = this.clock.getDelta();

    // Print poor FPS info
    if (this.timeSinceLastRenderCall > 0.5) {
      console.log('LAAAAG: ' + this.timeSinceLastRenderCall);
    }

    // Update fps-meter
    this.fpsMeter.update(this.clock.elapsedTime);

    // Check for render interval
    if (--this.renderTTL > 0) {
      return;
    } else {
      this.renderTTL = this.renderInterval;
    }

    // Notify camera controller and render listener if present
    if (this.onNewRenderCycle !== undefined) {
      this.onNewRenderCycle(this.timeSinceLastRenderCall);
    }
    if (this.cameraController) {
      this.cameraController.update(this.timeSinceLastRenderCall);
    }

    // Render scene is present
    if (this.scene) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Automatically resize the gl canvas to fit its container.
   */
  autoResize (): void
  {
    const container = this.renderer.domElement.parentElement;

    if (container) {
      this.setDimensions(container.clientWidth, container.clientHeight);
    }
  }

  /**
   * Set the gl canvas dimensions.
   *
   * @param width the canvas width
   * @param height the canvas height
   */
  setDimensions (width: number, height: number): void
  {
    // Directly return if size hasn't changed
    const size = this.renderer.getSize();
    if (size.width === width && size.height === height) {
      return;
    }

    // Update renderer size
    this.renderer.setSize(width, height);

    // Update camera parameters
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    // Render as soon as possible
    this.renderTTL = 0;
  }
}

export { GLPanel };
