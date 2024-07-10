import { ICameraController } from './ICameraController';
import { JsMath } from '../../utils/JsMath';
import { Euler, Matrix4, Mesh, MeshPhongMaterial, Object3D, PerspectiveCamera, SphereGeometry, Vector2, Vector3, Math as TMath } from 'three';


interface IntersectionPoint {
  /**
   * 
   */
  point: Vector3;

  /**
   * 
   */
  distance: number;
}


/**
 * The UniversalCameraController class definition.
 *
 * @author Stefan Glaser
 */
class UniversalCameraController extends ICameraController
{
  /** The camera object. */
  camera: PerspectiveCamera;

  /** The webgl renderer canvas object. */
  canvas: HTMLElement;

  /** The camera target position. */
  targetPos: Vector3;

  /** The camera target rotation. */
  targetRot: Euler;

  /** The camera target rotation as matrix. A 3x3 Matrix would be enough, but the Matrix3 from threejs has only limited functionality. */
  targetMatrix: Matrix4;

  /** The screen position where a rotation action was started, or undefined if no rotation action is active. */
  rotateStart?: Vector2;

  /** The screen position where a pan action was started, or undefined if no pan action is active. */
  panStart?: Vector2;

  /** The pan speed. */
  panSpeed: number;

  /** The screen position where a zoom action was started, or undefined if no zoom action is active. */
  zoomStart?: Vector2;

  /** The current pan speed vector resulting from keyboard actions. */
  currentSpeed: Vector3;

  /** The intended pan speed vector resulting from keyboard actions. */
  intendedSpeed: Vector3;

  /** The click indicator sphere. */
  indicatorSphere: Mesh;

  /** The click indicator sphere time to live. */
  indicatorTTL: number;

  /** The area of interest. */
  areaOfInterest: Vector2;

  /** The camera controller bounds. */
  bounds: Vector3;

  /** Enable/Disable camera controller. */
  enabled: boolean;

  /** The object to track or undefined if no object is currently tracked. */
  trackingObject?: Object3D;

  /**
   * Universal camera controller constructor
   *
   * @param camera the camera object
   * @param canvas the monitor canvas
   */
  constructor (camera: PerspectiveCamera, canvas: HTMLElement)
  {
    super();

    this.camera = camera;
    this.canvas = canvas;

    const scope = this;
    this.targetPos = new Vector3(0, 105, 0);
    this.targetRot = new Euler(-Math.PI / 2, 0, 0, 'YXZ');
    this.targetRot.onChange(function() {
      scope.targetMatrix.makeRotationFromEuler(scope.targetRot);
    });
    this.targetMatrix = new Matrix4();
    this.targetMatrix.makeRotationX(-Math.PI / 2);
    this.rotateStart = undefined;
    this.panStart = undefined;
    this.panSpeed = 1;
    this.zoomStart = undefined;
    this.currentSpeed = new Vector3();
    this.intendedSpeed = new Vector3();

    // Klick indicator sphere
    const geometry = new SphereGeometry(0.05, 16, 16);
    const material = new MeshPhongMaterial({ color: 0xaaaa00 });
    this.indicatorSphere = new Mesh(geometry, material);
    this.indicatorSphere.name = 'camControlIndicatorSphere';
    this.indicatorSphere.visible = false;
    this.indicatorTTL = 0;
    this.areaOfInterest = new Vector2(105, 68);
    this.bounds = new Vector3(500, 500, 500);
    this.enabled = true;
    this.trackingObject = undefined;
  }

  /**
   * @override
   * @param enabled
   */
  setEnabled (enabled: boolean): void
  {
    if (this.enabled !== enabled) {
      this.enabled = enabled;

      if (!enabled) {
        this.rotateStart = undefined;
        this.panStart = undefined;
        this.zoomStart = undefined;
        this.intendedSpeed.setScalar(0);
      }
    }
  }

  /**
   * @override
   * @param bounds
   */
  setBounds (bounds: Vector3): void
  {
    this.bounds.copy(bounds);

    // TODO: Clamp current camera position
  }

  /**
   * @override
   * @param areaOfInterest
   */
  setAreaOfInterest (areaOfInterest: Vector2): void
  {
    this.areaOfInterest.copy(areaOfInterest);
  }

  /**
   * @override
   * @param deltaT
   */
  update (deltaT: number): void
  {
    // Move camera according to speedVector
    this.currentSpeed.lerp(this.intendedSpeed, 0.1);

    if (this.currentSpeed.length() < 0.01) {
      this.currentSpeed.setScalar(0);
    } else {
      this.move(this.currentSpeed.x, this.currentSpeed.z, this.currentSpeed.y);
    }

    this.camera.position.copy(this.targetPos);

    if (this.trackingObject) {
      this.camera.lookAt(this.trackingObject.position);
      this.targetRot.copy(this.camera.rotation);
    } else {
      this.camera.rotation.copy(this.targetRot);
    }

    if (this.indicatorSphere.visible && this.indicatorTTL-- < 0) {
      this.indicatorSphere.visible = false;
    }
  }

  /**
   * Track the given object.
   *
   * @param obj the object to track with the camera
   */
  trackObject (obj?: Object3D): void
  {
    this.trackingObject = obj;
  }

  /**
   * Set the indicator sphere to a certain position and give it 10 cycles TTL.
   *
   * @param pos the target position
   */
  setIndicator (pos: Vector3): void
  {
    this.indicatorSphere.position.copy(pos);
    this.indicatorSphere.visible = true;
    this.indicatorTTL = 10;
  }

  /**
   * [getCenterIntersectionPoint description]
   *
   * @param min the minimum distance
   * @param max the maximum distance
   * @returns the intersection point
   */
  getCenterIntersectionPoint (min: number, max: number): IntersectionPoint
  {
    let length = 0;
    const dirVec = new Vector3();
    dirVec.setFromMatrixColumn(this.targetMatrix, 2);
    dirVec.negate();

    if (dirVec.y < -0.01 || dirVec.y > 0.01) {
      dirVec.multiplyScalar(Math.abs(this.targetPos.y / dirVec.y));
      dirVec.clampLength(-max, max);
      length = dirVec.length();
    } else {
      // Calculate a point maxLength or 100 meter away from the view direction
      length = max;
      dirVec.multiplyScalar(max / dirVec.length());
    }

    dirVec.add(this.targetPos);

    this.setIndicator(dirVec);

  //    console.log('At Point: ' + dirVec.x + ' ' + dirVec.y + ' ' + dirVec.z);
    return { point: dirVec, distance: length };
  }

  /**
   * [getIntersectionPoint description]
   *
   * @param clickPos
   * @param min
   * @param max
   * @returns the intersection point
   */
  getIntersectionPoint (clickPos: Vector2, min: number, max: number): IntersectionPoint
  {
    let length = 0;
    const fovMax = Math.tan((this.camera.fov / 2) * Math.PI / 180.0) * 2;

    const x = fovMax * clickPos.x / this.canvas.clientHeight;
    const y = fovMax * clickPos.y / this.canvas.clientHeight;

    const dirVec = new Vector3(x, y, -1);
    dirVec.applyMatrix4(this.targetMatrix);

    if (dirVec.y < -0.01 || dirVec.y > 0.01) {
      dirVec.multiplyScalar(-this.targetPos.y / dirVec.y);
      dirVec.clampLength(min, max);
      length = dirVec.length();
    } else {
      // Calculate a point max length meter away from the view direction
      length = max;
      dirVec.multiplyScalar(max / dirVec.length());
    }

    dirVec.add(this.targetPos);

    this.setIndicator(dirVec);

  //    console.log('At Point: ' + dirVec.x + ' ' + dirVec.y + ' ' + dirVec.z);
    return { point: dirVec, distance: length };
  }

  /**
   * Set the traget rotation in degrees.
   *
   * @param horizontalAngle
   * @param verticalAngle
   */
  setTargetRotDeg (horizontalAngle: number, verticalAngle: number): void
  {
    this.setTargetRot(JsMath.toRad(horizontalAngle), JsMath.toRad(verticalAngle));
  }

  /**
   * Set the target rotation in radians.
   *
   * @param horizontalAngle
   * @param verticalAngle
   */
  setTargetRot (horizontalAngle: number, verticalAngle: number): void
  {
    if (horizontalAngle > Math.PI) {
      horizontalAngle -= Math.PI * 2;
    } else if (horizontalAngle < -Math.PI) {
      horizontalAngle += Math.PI * 2;
    }

    this.targetRot.set(TMath.clamp(verticalAngle, -Math.PI / 2, Math.PI / 2), horizontalAngle, 0);
  }

  /**
   * [shiftTargetRot description]
   *
   * @param horizontalShift
   * @param verticalshift
   */
  shiftTargetRot (horizontalShift: number, verticalshift: number): void
  {
    this.setTargetRot(this.targetRot.y + horizontalShift, this.targetRot.x + verticalshift);
  }

  /**
   * Set the target position of the camera.
   *
   * @param x
   * @param y
   * @param z
   */
  setTargetPos (x: number, y: number, z: number): void
  {
    this.targetPos.x = x;
    this.targetPos.y = y;
    this.targetPos.z = z;
  }

  /**
   * Shift the target position of the camera.
   *
   * @param x
   * @param y
   * @param z
   */
  shiftTargetPos (x: number, y: number, z: number): void
  {
    this.targetPos.x += x;
    this.targetPos.y += y;
    this.targetPos.z += z;
  }

  /**
   * Handle start rotation.
   *
   * @param pos
   */
  handleStartRotate (pos: Vector2): void
  {
    if (this.enabled) {
      this.rotateStart = new Vector2();
      this.rotateStart.copy(pos);
    }
  }

  /**
   * Handle start pan.
   *
   * @param pos
   */
  handleStartPan (pos: Vector2): void
  {
    if (this.enabled) {
      this.panStart = new Vector2();
      this.panStart.copy(pos);

      const dist = this.getIntersectionPoint(pos, 0.5, 100).distance;
      this.panSpeed = dist * Math.tan((this.camera.fov / 2) * Math.PI / 180.0) * 2;
    }
  }

  /**
   * Handle start zoom.
   *
   * @param pos
   */
  handleStartZoom (pos: Vector2): void
  {
    if (this.enabled) {
      this.zoomStart = new Vector2();
      this.zoomStart.copy(pos);
    }
  }

  /**
   * Handle end rotate.
   */
  handleEndRotate (): void
  {
    this.rotateStart = undefined;
  }

  /**
   * Handle pan end.
   */
  handleEndPan (): void
  {
    this.panStart = undefined;
  }

  /**
   * Handle zoom end.
   */
  handleEndZoom (): void
  {
    this.zoomStart = undefined;
  }

  /**
   * Handle zoom end.
   *
   * @returns true, if waiting for mouse events, false otherwise
   */
  isWaitingForMouseEvents (): boolean
  {
    return !!this.rotateStart || !!this.panStart || !!this.zoomStart;
  }

  /**
   * Handle rotation.
   *
   * @param pos
   */
  handleRotate (pos: Vector2): void
  {
    if (!this.rotateStart) { return; }

    const deltaX = this.rotateStart.x - pos.x;
    const deltaY = pos.y - this.rotateStart.y;

    this.shiftTargetRot(Math.PI * deltaX / this.canvas.clientHeight,
                        Math.PI * deltaY / this.canvas.clientHeight);

    this.rotateStart.set(pos.x, pos.y);
  }

  /**
   * Handle pan.
   *
   * @param pos
   */
  handlePan (pos: Vector2): void
  {
    if (!this.panStart) { return; }

    const deltaX = this.panStart.x - pos.x;
    const deltaY = this.panStart.y - pos.y;

    this.pan(this.panSpeed * deltaX / this.canvas.clientHeight,
             this.panSpeed * deltaY / this.canvas.clientHeight,
             0);

    this.panStart.set(pos.x, pos.y);
  }

  /**
   * Handle mouse zoom.
   *
   * @param pos
   */
  handleMouseZoom (pos: Vector2): void
  {
    if (!this.zoomStart) { return; }

    // const deltaX = this.zoomStart.x - pos.x;
    const deltaY = this.zoomStart.y - pos.y;

    const dist = this.getCenterIntersectionPoint(1, 25).distance;
    const zoomSpeed = dist * Math.tan((this.camera.fov / 2) * Math.PI / 180.0) * 2;

    this.pan(0, 0, -5 * zoomSpeed * deltaY / this.canvas.clientHeight);

    this.zoomStart.set(pos.x, pos.y);
  }

  /**
   * Handle mouse wheel zoom.
   *
   * @param pos
   * @param amount
   */
  handleWheelZoom (pos: Vector2, amount: number): void
  {
    if (!this.enabled) { return; }

    let distance = 0.02 * amount * Math.abs(this.targetPos.y) / 30;

    if (distance < 0 && distance > -0.8) {
      distance = -0.8;
    } else if (distance > 0 && distance < 0.8) {
      distance = 0.8;
    }

    this.pan(0, 0, distance);
  }

  /**
   * Set a predefined cmaera pose.
   *
   * @param id
   */
  setPredefinedPose (id: number = 0): void
  {
    if (!this.enabled) { return; }

    const length = this.areaOfInterest.x;
    const width = this.areaOfInterest.y;

    switch (id) {
      case 1:
        this.setTargetPos(-length * 0.8, length * 0.4, 0);
        this.setTargetRotDeg(-90, -35);
        break;
      case 2:
        this.setTargetPos(-length * 0.8, length * 0.4, width);
        this.setTargetRotDeg(-50, -30);
        break;
      case 3:
        this.setTargetPos(0, length * 0.4, width);
        this.setTargetRotDeg(35, -40);
        break;
      case 4:
        this.setTargetPos(0, length * 0.6, width * 1.1);
        this.setTargetRotDeg(0, -45);
        break;
      case 5:
        this.setTargetPos(0, length * 0.4, width);
        this.setTargetRotDeg(-35, -40);
        break;
      case 6:
        this.setTargetPos(length * 0.8, length * 0.4, width);
        this.setTargetRotDeg(50, -30);
        break;
      case 7:
        this.setTargetPos(length * 0.8, length * 0.4, 0);
        this.setTargetRotDeg(90, -35);
        break;
      case 0:
      default:
        this.setTargetPos(0, length, 0);
        this.setTargetRotDeg(0, -90);
        break;
    }
  }

  /**
   * Set a predefined cmaera pose.
   */
  moveLeft (): void
  {
    if (!this.enabled) { return; }

    const speed = this.areaOfInterest.x / 300;

    this.intendedSpeed.x = -speed;
    this.currentSpeed.x = -speed;
  }

  /**
   * Set a predefined cmaera pose.
   */
  moveRight (): void
  {
    if (!this.enabled) { return; }

    const speed = this.areaOfInterest.x / 300;

    this.intendedSpeed.x = speed;
    this.currentSpeed.x = speed;
  }

  /**
   * Set a predefined cmaera pose.
   */
  moveForward (): void
  {
    if (!this.enabled) { return; }

    const speed = this.areaOfInterest.x / 300;

    this.intendedSpeed.z = -speed;
    this.currentSpeed.z = -speed;
  }

  /**
   * Set a predefined cmaera pose.
   */
  moveBack (): void
  {
    if (!this.enabled) { return; }

    const speed = this.areaOfInterest.x / 300;

    this.intendedSpeed.z = speed;
    this.currentSpeed.z = speed;
  }

  /**
   * Set a predefined cmaera pose.
   */
  moveUp (): void
  {
    if (!this.enabled) { return; }

    const speed = this.areaOfInterest.x / 300;

    this.intendedSpeed.y = speed;
    this.currentSpeed.y = speed;
  }

  /**
   * Set a predefined cmaera pose.
   */
  moveDown (): void
  {
    if (!this.enabled) { return; }

    const speed = this.areaOfInterest.x / 300;

    this.intendedSpeed.y = -speed;
    this.currentSpeed.y = -speed;
  }

  /**
   * Set a predefined cmaera pose.
   */
  stopMoveLeftRight (): void
  {
    this.intendedSpeed.x = 0;
  }

  /**
   * Set a predefined cmaera pose.
   */
  stopMoveForwardBack (): void
  {
    this.intendedSpeed.z = 0;
  }

  /**
   * Set a predefined cmaera pose.
   */
  stopMoveUpDown (): void
  {
    this.intendedSpeed.y = 0;
  }

  /**
   * Perform pan.
   *
   * @param panRight
   * @param panUp
   * @param panIn
   */
  pan (panRight: number, panUp: number, panIn: number): void
  {
    const v = new Vector3();
    const t = new Vector3();

    v.setFromMatrixColumn(this.targetMatrix, 0);
    v.multiplyScalar(panRight);
    t.setFromMatrixColumn(this.targetMatrix, 1);
    t.multiplyScalar(panUp);
    v.add(t);
    t.setFromMatrixColumn(this.targetMatrix, 2);
    t.multiplyScalar(panIn);
    v.sub(t);

    this.shiftTargetPos(v.x, v.y, v.z);
  }

  /**
   * Perform move.
   *
   * @param moveRight
   * @param moveIn
   * @param moveUp
   */
  move (moveRight: number, moveIn: number, moveUp: number): void
  {
    const v = new Vector3();
    const t = new Vector3();

    v.setFromMatrixColumn(this.targetMatrix, 0);
    v.multiplyScalar(moveRight);
    t.setFromMatrixColumn(this.targetMatrix, 2);
    if (t.y < -0.99 || t.y > 0.99) {
      t.setFromMatrixColumn(this.targetMatrix, 1);
      t.negate();
    }
    t.y = 0;
    t.normalize();
    t.multiplyScalar(moveIn);
    v.add(t);

    this.shiftTargetPos(v.x, moveUp, v.z);
  }
}

export { UniversalCameraController };
