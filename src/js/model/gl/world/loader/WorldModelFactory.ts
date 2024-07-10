import { MeshFactory } from '../../utils/MeshFactory';
import { SceneUtil } from '../../../../utils/SceneUtil';
import { Field } from '../Field';
import { Ball } from '../Ball';
import { AmbientLight, BoxBufferGeometry, BufferGeometry, DirectionalLight, DoubleSide, Geometry, Material, Mesh, MeshBasicMaterial, MeshPhongMaterial, Object3D, PlaneBufferGeometry, RepeatWrapping, Scene, Texture, Vector2 } from 'three';

/**
 *
 * @author Stefan Glaser
 */
class WorldModelFactory
{
  /** Geometry cache. */
  geometryCache: Record<string, BufferGeometry>;

  /** Material cache. */
  materialCache: Record<string, Material | Material[]>;

  /**
   * WorldModelFactory Constructor
   */
  constructor()
  {
    this.geometryCache = {};
    this.materialCache = {};
  }

  /**
   * Dispose all resources allocated within this factory.
   */
  dispose (): void {}

  /**
   * Create a default world representation (sky box and lighting).
   *
   * @param scene the world scene
   */
  createScene (scene: Scene): void
  {
    // Create sky box
    const geometry = this.fetchGeometry('skyBoxGeo');
    const material = this.fetchMaterial('skyBoxMat');

    const mesh = new Mesh(geometry, material);
    mesh.name = 'skyBox';
    scene.add(mesh);


    // Ambient lighting
    let light = new AmbientLight(0xeeeeee);
    light.name = 'ambient';
    scene.add(light);

    // Directional lighting
    light = new DirectionalLight(0xeeeeee, 0.4);
    light.name = 'sun';
    light.position.set(300, 300, 500);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    scene.add(light);
  }

  /**
   * Update the scene representation (adjust shadow camera to field size).
   *
   * @param scene the scene instance
   * @param fieldDimensions the field dimensions
   */
  updateScene (scene: Scene, fieldDimensions: Vector2): void
  {
    // Update shadow camera of "sun" DirectionalLight
    const light = scene.getObjectByName('sun');
    if (light instanceof DirectionalLight) {
      const vertical = Math.ceil(fieldDimensions.y * 0.8);
      const horizontal = Math.ceil(fieldDimensions.x * 0.7);
      const depth = fieldDimensions.y;

      light.shadow.camera.left = -horizontal;
      light.shadow.camera.right = horizontal;
      light.shadow.camera.top = vertical;
      light.shadow.camera.bottom = -vertical;
      light.shadow.camera.near = 655 - depth;
      light.shadow.camera.far = 655 + depth;
      light.shadow.camera.updateProjectionMatrix();
    }
  }

  /**
   * Update the field representation for the given field instance.
   * This function repositions and rescales all objects on the field (field plane, border, field lines and goals)
   * to match their specification.
   *
   * @param field the field instance
   */
  updateField (field: Field): void
  {
    const size = field.fieldDimensions;
    // ANYFIX: Shoule be THREE.Mesh but then "material.map" and "material.needsUpdate" are not specified as expected.
    let mesh: any;
    const scope = this;

    /**
     * Helper function...
     * @param name the name of the mesh
     * @param mtl the name of the material or the material instance to use
     * @param geo the name of the geometry or the geometry instance to use
     * @param disposeExisting dispose an existing object if present
     */
    const addOrFetchMesh = function (name: string, mtl: string | Material | Material[], geo: string | Geometry | BufferGeometry, disposeExisting: boolean = false): void {
      // Try fetch an existing object with the given name
      mesh = field.objGroup.getObjectByName(name) as Mesh;
      if (mesh) {
        if (disposeExisting) {
          // remove mesh
          field.objGroup.remove(mesh);
          mesh.geometry.dispose();
        } else {
          return;
        }
      }

      // No corresponding object found, thus create new one
      if (typeof mtl === 'string') {
        mtl = scope.fetchMaterial(mtl);
      }
      if (typeof geo === 'string') {
        geo = scope.fetchGeometry(geo);
      }

      mesh = new Mesh(geo, mtl);
      mesh.name = name;
      mesh.rotation.x = -Math.PI / 2;
      mesh.receiveShadow = true;
      mesh.castShadow = false;
      field.objGroup.add(mesh);
    };


    let halfLength = Math.floor((size.x + 1.99) / 2);

    // ---------- Update field plane
    addOrFetchMesh('fieldPlane', 'grassMat', 'planeGeo');

    // Resize field plane
    mesh.scale.set(halfLength * 2, size.y, 1);
    if (field.textureRepeat) {
      mesh.material.map.repeat.set(field.textureRepeat, field.textureRepeat * size.y / size.x);
    } else {
      mesh.material.map.repeat.set(halfLength, size.y);
    }
    mesh.material.needsUpdate = true;



    halfLength = size.x / 2;
    const halfWidth = size.y / 2;
    const borderSize = size.x / 12;

    // ---------- Update field top border
    addOrFetchMesh('fieldBorderTop', 'tbBorderMat', 'planeGeo');

    // Adjust top border
    mesh.scale.set(size.x + borderSize * 2, borderSize, 1);
    mesh.position.set(0, 0, -halfWidth - borderSize / 2);
    mesh.material.map.repeat.set((size.x + borderSize * 2), borderSize);
    mesh.material.needsUpdate = true;


    // ---------- Update field bottom border
    addOrFetchMesh('fieldBorderBottom', 'tbBorderMat', 'planeGeo');

    // Adjust bottom border
    mesh.scale.set(size.x + borderSize * 2, borderSize, 1);
    mesh.position.set(0, 0, halfWidth + borderSize / 2);
    mesh.material.map.repeat.set((size.x + borderSize * 2), borderSize);
    mesh.material.needsUpdate = true;


    // ---------- Update field left border
    addOrFetchMesh('fieldBorderLeft', 'lrBorderMat', 'planeGeo');

    // Adjust left border
    mesh.scale.set(borderSize, size.y, 1);
    mesh.position.set(-halfLength - borderSize / 2, 0, 0);
    mesh.material.map.repeat.set(borderSize, size.y);
    mesh.material.needsUpdate = true;


    // ---------- Update field right border
    addOrFetchMesh('fieldBorderRight', 'lrBorderMat', 'planeGeo');

    // Adjust right border
    mesh.scale.set(borderSize, size.y, 1);
    mesh.position.set(halfLength + borderSize / 2, 0, 0);
    mesh.material.map.repeat.set(borderSize, size.y);
    mesh.material.needsUpdate = true;


    // ---------- Update field lines
    const geometry = SceneUtil.createFieldLinesGeometry(field.lineWidth,
                                                        field.fieldDimensions,
                                                        field.centerRadius,
                                                        field.goalAreaDimensions,
                                                        field.penaltyAreaDimensions);
    addOrFetchMesh('fieldLines', 'lineMat', geometry, true);


    // ---------- Update goals
    this.updateGoals(field);
  }

  /**
   * Update the goal representations for the given field instance.
   * This function repositions and rescales the goal objects in the given field instance to match their specification.
   *
   * @param field the field instance
   */
  updateGoals (field: Field): void
  {
    const dimensions = field.goalDimensions;
    let group: Object3D | undefined;
    // ANYFIX: Shoule be THREE.Mesh but then "material.map" and "material.needsUpdate" are not specified as expected.
    let mesh: any;
    const netWidth = dimensions.y + field.lineWidth * 2 - 0.02;
    const netDepth = dimensions.x - field.lineWidth - 0.01;
    const netHeight = Math.sqrt(netDepth * netDepth + dimensions.z * dimensions.z);
    const scope = this;

    /**
     * Helper function...
     * @param name the name of the mesh
     * @param mtl the name of the material or the material instance to use
     * @param geo the name of the geometry or the geometry instance to use
     * @param shadow cast / receive shadow
     * @param disposeExisting dispose an existing object if present
     */
    const addOrFetchMesh = function (name: string, mtl: string | Material | Material[], geo: string | Geometry | BufferGeometry, shadow: boolean, disposeExisting: boolean = false): void
    {
      if (!group) { return; }

      // Try fetch an existing object with the given name
      mesh = group.getObjectByName(name) as Mesh;
      if (mesh) {
        if (disposeExisting) {
          // remove mesh
          group.remove(mesh);
          mesh.geometry.dispose();
        } else {
          return;
        }
      }

      // No corresponding object found, thus create new one
      if (typeof mtl === 'string') {
        mtl = scope.fetchMaterial(mtl);
      }
      if (typeof geo === 'string') {
        geo = scope.fetchGeometry(geo);
      }

      mesh = new Mesh(geo, mtl);
      mesh.name = name;
      mesh.rotation.x = -Math.PI / 2;
      mesh.receiveShadow = shadow;
      mesh.castShadow = shadow;
      group.add(mesh);
    };

    const goalGeometry = SceneUtil.createHockeyGoalGeometry(field.lineWidth, field.goalDimensions);


    // ---------- Update left goal group
    group = field.objGroup.getObjectByName('leftGoal');
    if (!group) {
      // No left goal group found, thus create new one
      group = new Object3D();
      group.name = 'leftGoal';
      group.rotation.y = Math.PI;
      field.objGroup.add(group);
    }
    group.position.x = -field.fieldDimensions.x / 2;


    // ---------- Update left goal skeleton
    addOrFetchMesh('goalSkeleton', 'leftGoalMat', goalGeometry, true, true)


    // ---------- Update left goal side nets
    addOrFetchMesh('goalNetSides', 'goalNetSidesMat', 'goalNetSidesGeo', false);
    mesh.position.set(dimensions.x - netDepth, 0, 0);
    mesh.scale.set(netDepth, netWidth, dimensions.z);
    mesh.material.map.repeat.set(netDepth, dimensions.z);
    mesh.material.needsUpdate = true;


    // ---------- Update left goal back net
    addOrFetchMesh('goalNetBack', 'goalNetBackMat', 'planeGeo', false);
    mesh.position.set(field.lineWidth + netDepth / 2, dimensions.z / 2, 0);
    mesh.scale.set(netWidth, netHeight, 1);
    mesh.rotation.order = 'ZYX';
    mesh.rotation.y = -Math.PI / 2;
    mesh.rotation.x = (Math.PI / 2) - Math.atan(dimensions.z / netDepth);
    mesh.material.map.repeat.set(netWidth, netHeight);
    mesh.material.needsUpdate = true;



    // ---------- Update right goal group
    group = field.objGroup.getObjectByName('rightGoal');
    if (!group) {
      // No right goal group found, thus create new one
      group = new Object3D();
      group.name = 'rightGoal';
      field.objGroup.add(group);
    }
    group.position.x = field.fieldDimensions.x / 2;


    // ---------- Update right goal skeleton
    addOrFetchMesh('goalSkeleton', 'rightGoalMat', goalGeometry, true, true);


    // ---------- Update right goal side nets
    addOrFetchMesh('goalNetSides', 'goalNetSidesMat', 'goalNetSidesGeo', false);
    mesh.position.set(dimensions.x - netDepth, 0, 0);
    mesh.scale.set(netDepth, netWidth, dimensions.z);
    mesh.material.map.repeat.set(netDepth, dimensions.z);
    mesh.material.needsUpdate = true;


    // ---------- Update left goal back net
    addOrFetchMesh('goalNetBack', 'goalNetBackMat', 'planeGeo', false);
    mesh.position.set(field.lineWidth + netDepth / 2, dimensions.z / 2, 0);
    mesh.scale.set(netWidth, netHeight, 1);
    mesh.rotation.order = 'ZYX';
    mesh.rotation.y = -Math.PI / 2;
    mesh.rotation.x = (Math.PI / 2) - Math.atan(dimensions.z / netDepth);
    mesh.material.map.repeat.set(netWidth, netHeight);
    mesh.material.needsUpdate = true;
  }

  /**
   * Create a ball representation.
   *
   * @param ball the ball instance
   */
  createBall (ball: Ball): void
  {
    // Create simple ball placeholder
    const placeholder = SceneUtil.createSimpleBall(ball.radius);
    ball.objGroup.add(placeholder);

    // Load nice looking ball object
    SceneUtil.loadObject('soccer_ball.json',
      function(scene: Object3D) { // onLoad
        const geometry = new BufferGeometry();
        geometry.fromGeometry(((scene.getObjectByName('soccerball') as Mesh).geometry) as Geometry);
        geometry.name = 'ballGeo';

        const material = SceneUtil.createStdPhongMat('ballMat', 0xffffff, 'rcs-soccerball.png');

        const mesh = new Mesh(geometry, material);
        mesh.name = 'ballSphere';
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Exchange placeholder with nice looking ball mesh
        ball.objGroup.remove(placeholder);
        ball.objGroup.add(mesh);
      });
  }

  /**
   * Fetch the material with the given name from the internal cache (or create it if not existent).
   *
   * @param name the unique name of the material
   * @returns the requested (multi-)material or a default material if the requested material definition was not found
   */
  fetchMaterial (name: string): Material | Material[]
  {
    let material = this.materialCache[name];
    let texture: Texture;

    if (!material) {
      switch (name) {
        case 'skyBoxMat':
          material = SceneUtil.createSkyBoxMaterial();
          break;
        case 'grassMat':
          texture = SceneUtil.loadTexture('field.png');
          texture.wrapS = RepeatWrapping;
          texture.wrapT = RepeatWrapping;
          material = new MeshPhongMaterial({name: 'fieldMat', color: 0xcccccc, map: texture});
          break;
        case 'tbBorderMat':
          texture = SceneUtil.loadTexture('field_border.png');
          texture.wrapS = RepeatWrapping;
          texture.wrapT = RepeatWrapping;
          material = new MeshPhongMaterial({name: 'tbBorderMat', color: 0xaa99aa, map: texture});
          break;
        case 'lrBorderMat':
          texture = SceneUtil.loadTexture('field_border.png');
          texture.wrapS = RepeatWrapping;
          texture.wrapT = RepeatWrapping;
          material = new MeshPhongMaterial({name: 'lrBorderMat', color: 0xaa99aa, map: texture});
          SceneUtil.offsetMaterial(material, -0.5, -0.05);
          break;
        case 'lineMat':
          material = new MeshBasicMaterial({name: 'lineMat', color: 0xeeeeee, side: DoubleSide});
          SceneUtil.offsetMaterial(material, -1, -1);
          break;
        case 'goalNetSidesMat':
          texture = SceneUtil.loadTexture('goalnet.png');
          texture.wrapS = RepeatWrapping;
          texture.wrapT = RepeatWrapping;
          material = SceneUtil.createStdPhongMat('goalNetSidesMat', 0xffffff, texture);
          material.side = DoubleSide;
          material.transparent = true;
          break;
        case 'goalNetBackMat':
          texture = SceneUtil.loadTexture('goalnet.png');
          texture.wrapS = RepeatWrapping;
          texture.wrapT = RepeatWrapping;
          material = SceneUtil.createStdPhongMat('goalNetBackMat', 0xffffff, texture);
          material.side = DoubleSide;
          material.transparent = true;
          break;
        case 'leftGoalMat':
          material = SceneUtil.createStdPhongMat(name, 0xcccc00);
          material.side = DoubleSide;
          SceneUtil.offsetMaterial(material, -1, -0.1);
          break;
        case 'rightGoalMat':
          material = SceneUtil.createStdPhongMat(name, 0x0088bb);
          material.side = DoubleSide;
          SceneUtil.offsetMaterial(material, -1, -0.1);
          break;
        default:
          // By default create a quite white material
          material = SceneUtil.createStdPhongMat(name, 0xeeeeee);
          break;
      }

      this.materialCache[name] = material;
    }

    return material;
  }

  /**
   * Fetch the geometry with the given name from the internal cache (or create it if not existent).
   *
   * @param name the unique name of the geometry
   * @returns the requested geometry
   */
  fetchGeometry (name: string): BufferGeometry
  {
    let geometry = this.geometryCache[name];

    if (geometry === undefined) {
      switch (name) {
      case 'skyBoxGeo':
        geometry = new BoxBufferGeometry(1024, 1024, 1024);
        break;
      case 'planeGeo':
        geometry = new PlaneBufferGeometry(1, 1);
        break;
      case 'goalNetSidesGeo':
        geometry = SceneUtil.createHockeyGoalSideNetGeometry()
        break;
      default:
        // Log error
        console.log('Geometry "' + name + '" not found!');
        geometry = new BoxBufferGeometry(0.5, 0.5, 0.5);
        break;
      }

      this.geometryCache[name] = geometry;
    }

    return geometry;
  }
}

export { WorldModelFactory };
