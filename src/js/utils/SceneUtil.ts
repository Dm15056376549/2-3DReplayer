import { Vector2, Vector3, Matrix4, Shape, Geometry, BufferGeometry, RingGeometry, PlaneGeometry, CircleGeometry, CylinderGeometry, ShapeGeometry, Texture, TextureLoader, ObjectLoader, MeshPhongMaterial, Material, Mesh, RingBufferGeometry, MeshBasicMaterial, BackSide, BoxBufferGeometry, SphereBufferGeometry, Object3D, PlaneBufferGeometry, RepeatWrapping, DoubleSide, CircleBufferGeometry, CylinderBufferGeometry, DirectionalLight, AmbientLight } from 'three';

/**
 * Simple Three.js scene helpers.
 * 
 * @author Stefan Glaser
 */
class SceneUtil
{
  /**
   * Create a geometry representing the field lines.
   *
   * @param lineWidth the field line width
   * @param fieldDimensions the dimensions of the field
   * @param centerRadius the radius of the center circle
   * @param goalAreaDimensions the dimensions of the goal area
   * @param penaltyAreaDimensions the dimensions of the penalty area + penalty kick spot
   * @returns a new BufferGeometry for the field lines
   */
  static createFieldLinesGeometry (lineWidth: number,
                                   fieldDimensions: Vector2,
                                   centerRadius: number,
                                   goalAreaDimensions: Vector2,
                                   penaltyAreaDimensions?: Vector3): BufferGeometry
  {
    const halfLength = fieldDimensions.x / 2;
    const halfWidth = fieldDimensions.y / 2;
    const halfLineWidth = lineWidth / 2;
    const halfGoalAreaWidth = goalAreaDimensions.y / 2;
    let tempX = 0;
    const mat = new Matrix4();

    /**
     * Helper function for simple merging of geometries.
     *
     * @param x the x position value
     * @param y the y position value
     * @param rotZ the z rotation (if not zero)
     */
     const mergeAt = function (x: number, y: number, rotZ?: number): void {
      // Set matrix rotation
      if (rotZ) {
        mat.makeRotationZ(rotZ);
      } else {
        mat.identity();
      }

      // Set matrix position
      mat.elements[12] = x;
      mat.elements[13] = y;

      // Merge geometry
      totalGeometry.merge(tempGeometry, mat);
    };


    // ---------- Center circle geometry
    let radius = centerRadius;
    const totalGeometry = new RingGeometry(radius - halfLineWidth, radius + halfLineWidth, 64, 1);


    // ---------- Vertical field line geometry
    let tempGeometry: THREE.Geometry = new PlaneGeometry(lineWidth, fieldDimensions.y);

    // Left/Right border line
    mergeAt(-halfLength, 0);
    mergeAt(halfLength, 0);

    // Center line
    mergeAt(0, 0);


    // ---------- Horizontal field line geometry
    tempGeometry = new PlaneGeometry(fieldDimensions.x + lineWidth, lineWidth);

    // Top/Bottom border line
    mergeAt(0, -halfWidth);
    mergeAt(0, halfWidth);


    // ---------- Corner circle geometry
    radius = fieldDimensions.x / 105.0;
    tempGeometry = new RingGeometry(radius - halfLineWidth, radius + halfLineWidth, 8, 1, 0, Math.PI / 2);

    // Top left corner circle
    mergeAt(-halfLength, -halfWidth);

    // Top right corner circle
    mergeAt(halfLength, -halfWidth, Math.PI / 2);

    // Bottom right corner circle
    mergeAt(halfLength, halfWidth, Math.PI);

    // Bottom left corner circle
    mergeAt(-halfLength, halfWidth, -Math.PI / 2);


    // ---------- Center spot geometry
    tempGeometry = new CircleGeometry(lineWidth * 1.2, 16);
    mergeAt(0, 0);


    // Penalty area
    if (penaltyAreaDimensions) {
      const halfPenaltyWidth = penaltyAreaDimensions.y / 2;
      tempX = halfLength - penaltyAreaDimensions.z;

      // Left/Right penalty kick spot
      mergeAt(-tempX, 0);
      mergeAt(tempX, 0);


      // ---------- Vertical penalty area line geometry
      tempGeometry = new PlaneGeometry(lineWidth, penaltyAreaDimensions.y + lineWidth);
      tempX = halfLength - penaltyAreaDimensions.x;

      // Left/Right penalty area front line
      mergeAt(-tempX, 0);
      mergeAt(tempX, 0);


      // ---------- Horizontal penalty area line geometry
      tempGeometry = new PlaneGeometry(penaltyAreaDimensions.x, lineWidth);
      tempX = halfLength - penaltyAreaDimensions.x / 2;

      // Left/Right penalty area top line
      mergeAt(-tempX, -halfPenaltyWidth);
      mergeAt(tempX, -halfPenaltyWidth);

      // Left/Right penalty area bottom line
      mergeAt(-tempX, halfPenaltyWidth);
      mergeAt(tempX, halfPenaltyWidth);


      // ---------- Penalty area arcs geometry
      const diffAngle = Math.acos((penaltyAreaDimensions.x - penaltyAreaDimensions.z) / centerRadius);
      tempGeometry = new RingGeometry(centerRadius - halfLineWidth, centerRadius + halfLineWidth, 32, 1, diffAngle, -2 * diffAngle);
      tempX = halfLength - penaltyAreaDimensions.z;

      // Left/Right penalty area arc
      mergeAt(-tempX, 0);
      mergeAt(tempX, 0, Math.PI);
    }


    // ---------- Vertical goal area lines geometry
    tempGeometry = new PlaneGeometry(lineWidth, goalAreaDimensions.y + lineWidth);
    tempX = halfLength - goalAreaDimensions.x;

    // Left/Right goal area front line
    mergeAt(-tempX, 0);
    mergeAt(tempX, 0);


    // ---------- Horizontal goal area lines geometry
    tempGeometry = new PlaneGeometry(goalAreaDimensions.x, lineWidth);
    tempX = halfLength - goalAreaDimensions.x / 2;

    // Left/Right goal area top line
    mergeAt(-tempX, -halfGoalAreaWidth);
    mergeAt(tempX, -halfGoalAreaWidth);

    // Left/Right goal area bottom line
    mergeAt(-tempX, halfGoalAreaWidth);
    mergeAt(tempX, halfGoalAreaWidth);


    // Create final buffer geometry from total geometry
    const geometry = new BufferGeometry();
    geometry.name = 'fieldLinesGeo';
    geometry.fromGeometry(totalGeometry);

    return geometry;
  }

  /**
   * Create a geometry representing a hockey goal (with a slanted back).
   *
   * @param postRadius the goal post radius
   * @param dimensions the dimensions of the goal
   * @returns a new BufferGeometry representing a hockey goal
   */
  static createHockeyGoalGeometry (postRadius: number, dimensions: Vector3): BufferGeometry
  {
    const mat = new Matrix4();

    /**
     * Helper function for simple merging of geometries.
     *
     * @param x the x position value
     * @param y the y position value
     * @param z the z position value
     * @param rot the x/y rotation (if not zero)
     * @param yRot indicator if rot is about y
     */
     const mergeAt = function (x: number, y: number, z: number, rot: number | undefined = undefined, yRot: boolean = false): void {
      // Set matrix rotation
      if (rot) {
        if (yRot) {
          mat.makeRotationY(rot);
        } else {
          mat.makeRotationX(rot);
        }
      } else {
        mat.identity();
      }

      // Set matrix position
      mat.elements[12] = x;
      mat.elements[13] = y;
      mat.elements[14] = z;

      // Merge geometry
      totalGeometry.merge(tempGeometry, mat);
    };


    const goalBarRadius = postRadius / 2;
    const halfGoalWidth = postRadius + dimensions.y / 2;
    const halfGoalHeight = (goalBarRadius + dimensions.z) / 2;

    const totalGeometry = new Geometry();


    // ---------- Goal post geometry
    let tempGeometry: Geometry = new CylinderGeometry(postRadius, postRadius, dimensions.z + goalBarRadius, 16);

    // Left/Right goal posts
    mergeAt(postRadius, halfGoalWidth, halfGoalHeight, -Math.PI / 2);
    mergeAt(postRadius, -halfGoalWidth, halfGoalHeight, -Math.PI / 2);


    // ---------- Upper goal bar geometry
    tempGeometry = new CylinderGeometry(goalBarRadius, goalBarRadius, halfGoalWidth * 2, 8);

    // Upper goal bar
    mergeAt(postRadius, 0, dimensions.z);


    // ---------- Bottom goal bar cylinder geometry
    const angle = Math.atan(0.5 * dimensions.z / dimensions.x);
    tempGeometry = new CylinderGeometry(goalBarRadius, goalBarRadius, halfGoalWidth * 2, 8, 1, false, -0.5 * Math.PI, angle);

    // Bottom goal bar cylinder
    mergeAt(dimensions.x, 0, 0);


    // ---------- Bottom goal bar plane geometry
    tempGeometry = new PlaneGeometry(goalBarRadius, halfGoalWidth * 2);

    // Bottom goal bar bottom plane
    mergeAt(dimensions.x - goalBarRadius / 2, 0, 0);

    // Bottom goal bar upper plane
    mergeAt(dimensions.x - Math.cos(angle) * goalBarRadius / 2, 0, Math.sin(angle) * goalBarRadius / 2, angle, true);


    // ---------- Goal stand geometry
    const triShape = new Shape();
    triShape.moveTo(0, 0);
    triShape.lineTo(dimensions.x, 0);
    triShape.lineTo(0, dimensions.z / 2);
    triShape.lineTo(0, 0);
    tempGeometry = new ShapeGeometry(triShape);

    // Left/Right goal stands
    mergeAt(0, halfGoalWidth, 0, Math.PI / 2);
    mergeAt(0, -halfGoalWidth, 0, Math.PI / 2);


    // Create final buffer geometry from total geometry
    const geometry = new BufferGeometry();
    geometry.name = 'goalGeo';
    geometry.fromGeometry(totalGeometry);

    return geometry;
  }

  /**
   * Create a geometry representing the side nets of a hockey goal.
   *
   * @returns a new grometry representing the side net of a hockey goal
   */
  static createHockeyGoalSideNetGeometry (): BufferGeometry {
    const totalGeometry = new Geometry();

    const triShape = new Shape();
    triShape.moveTo(0, 0);
    triShape.lineTo(1, 0);
    triShape.lineTo(0, 1);
    triShape.lineTo(0, 0);
    const tempGeometry = new ShapeGeometry(triShape);

    const mat = new Matrix4();
    mat.makeRotationX(Math.PI / 2);
    mat.elements[13] = 0.5;
    totalGeometry.merge(tempGeometry, mat);
    mat.elements[13] = -0.5;
    totalGeometry.merge(tempGeometry, mat);


    // Create final buffer geometry from total geometry
    const geometry = new BufferGeometry();
    geometry.name = 'goalNetSidesGeo';
    geometry.fromGeometry(totalGeometry);

    return geometry;
  }



  /**
   * Create a new texture from the given path.
   *
   * @param path the texture path
   * @returns a new texture object
   */
  static loadTexture (path: string): Texture
  {
    if (!TextureLoaderInstance) {
      TextureLoaderInstance = new TextureLoader();
    }

    return TextureLoaderInstance.load(TexturePath + path);
  }

  /**
   * Load an object from the given path.
   *
   * @param path the object file path
   * @param onLoad the on load callback
   * @param onProgress the on progress callback
   * @param onError the on error callback
   */
  static loadObject (path: string,
                     onLoad: (object: THREE.Object3D) => any,
                     onProgress: ((event: ProgressEvent<EventTarget>) => any) | undefined = undefined,
                     onError: ((event: Error | ErrorEvent) => any) | undefined = undefined): void
  {
    if (!ObjectLoaderInstance) {
      ObjectLoaderInstance = new ObjectLoader();
    }

    ObjectLoaderInstance.load(ModelPath + path,
      onLoad,
      onProgress,
      function(xhr) {
        // TODO: Check if we really want to print "message" here istead of "statusText"!
        console.error('Error loading object "' + path + '": ' + xhr.message);

        if (onError !== undefined) {
          onError(xhr);
        }
      });
  }

  /**
   * Create a MeshPhongMaterial.
   * The texture argument can be a texture path or an actual texture object.
   * In case of a texture path, a new texture is loaded from the given path.
   * This material has by default:
   *   specular: 0x7f7f7f
   *   emissive: 0x000000
   *   shininess: 49
   *
   * @param name the name of the material
   * @param color the material color
   * @param texture the material texture
   * @returns the new material
   */
  static createStdPhongMat (name: string, color: number, texture?: Texture | string): MeshPhongMaterial
  {
    let textureMap: Texture | null = null;

    if (texture) {
      textureMap = typeof texture === 'string' ? SceneUtil.loadTexture(texture) : texture;
    }

    return new MeshPhongMaterial({
          name: name,
          color: color,
          specular: 0x7f7f7f,
          emissive: 0x000000,
          shininess: 49,
          map: textureMap as Texture
        });
  }

  /**
   * Create a new number material.
   *
   * @param name the name of the material
   * @param matColor the material color
   * @param num the number to print on the texture
   * @param numColor the color of the number texture
   * @returns the number material
   */
  static createStdNumberMat (name: string, matColor: number, num: number, numColor: number = 0x000000): Material
  {
    // Create number texture
    return SceneUtil.createStdPhongMat(name, matColor);

    // const text = '' + number;
    // const canvas1 = UIUtil.el('canvas');

    // const context1 = canvas1.getContext('2d');
    // context1.clearRect(0, 0, 64, 64);

    // canvas1.width = 64;
    // canvas1.height = 64;

    // context1.fillStyle = 'white';
    // context1.fillRect(0, 0, 64, 64);

    // context1.font = '44px Arial Black';
    // context1.fillStyle = 'black';
    // let textWidth = context1.measureText(text).width;

    // if (number < 10) {
    //   context1.fillText(text, 32 - textWidth / 2, 52);
    // } else {
    //   const firstChar = text.slice(0, 1);
    //   const secondChar = text.slice(1, 2);
    //   const firstWidth = textWidth - context1.measureText(secondChar).width - 2;
    //   const secondWidth = textWidth - context1.measureText(firstChar).width - 2;
    //   textWidth = firstWidth + secondWidth;

    //   context1.fillText(firstChar, 30 - (textWidth / 2), 48);
    //   context1.fillText(secondChar, 30 - (textWidth / 2) + firstWidth, 48);
    // }



    // // const context1 = canvas1.getContext('2d');
    // // context1.clearRect(0, 0, 32, 32);

    // // canvas1.width = 32;
    // // canvas1.height = 32;

    // // context1.fillStyle = 'white';
    // // context1.fillRect(0, 0, 32, 32);

    // // context1.font = '900 22px Arial';
    // // context1.fillStyle = 'black';
    // // const halfTextWidth = context1.measureText(text).width / 2;
    // // context1.fillText(text, 16 - halfTextWidth, 28);


    // const texture1 = new THREE.Texture(canvas1);
    // texture1.needsUpdate = true;

    // const mat = SceneUtil.createStdPhongMat(name, matColor, texture1);
    // // mat.transparent = true;

    // return mat;
  }

  /**
   * Offset the given material to avoid z-fighting.
   *
   * @param material the material to offset
   * @param factor the offset factor
   * @param units the offset units
   */
  static offsetMaterial (material: Material, factor: number = -1, units: number = -0.1): void
  {
    material.depthTest = true;
    material.polygonOffset = true;
    material.polygonOffsetFactor = factor;
    material.polygonOffsetUnits = units;
  }

  /**
   * Create a mesh with the given parameter.
   * By default, the mesh will cast and receive shadows.
   *
   * @param name the name of the mesh
   * @param geometry the mesh geometry
   * @param material the mesh material
   * @param rotXNeg90 true if the mesh should be rotated around x about -90 degrees, false for no rotation
   * @returns a new mesh with the specified properties
   */
  static createMesh (name: string, geometry: Geometry | BufferGeometry, material: Material | Material[], rotXNeg90: boolean = false): Mesh
  {
    const mesh = new Mesh(geometry, material);
    mesh.name = name;
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    if (rotXNeg90) {
      mesh.rotation.x = -Math.PI / 2;
    }

    return mesh;
  }

  /**
   * Create a mesh with the given parameter.
   *
   * @param name the name of the mesh
   * @param geometry the mesh geometry
   * @param material the mesh material
   * @param x the x-coordinate of the mesh
   * @param y the y-coordinate of the mesh
   * @param z the z-coordinate of the mesh
   * @param rotXNeg90 true if the mesh should be rotated around x about -90 degrees, false for no rotation
   * @returns a new mesh with the specified properties
   */
  static createMeshAt (name: string, geometry: Geometry | BufferGeometry, material: Material | Material[], x: number, y: number, z: number, rotXNeg90: boolean = false): Mesh
  {
    const mesh = SceneUtil.createMesh(name, geometry, material, rotXNeg90);

    mesh.position.set(x, y, z);

    return mesh;
  }

  /**
   * Create a simple circle for representing a selected object.
   *
   * @param radius the circle radius
   * @param halfLineWidth the half circle line width
   * @returns the selection mesh
   */
  static createSelectionMesh (radius: number, halfLineWidth: number): Mesh
  {
    const mesh = new Mesh(new RingBufferGeometry(radius - halfLineWidth, radius + halfLineWidth, 16, 1), SelectionMaterial);
    mesh.name = 'selectionCircle';
    mesh.visible = false;
    mesh.receiveShadow = false;
    mesh.castShadow = false;
    mesh.rotation.x = -Math.PI / 2;

    return mesh;
  }

  /**
   * Create a dummy mesh used as placehoder for loading/failing body parts.
   * @returns a dummy mesh
   */
  static createDummyMesh (): Mesh
  {
    const mesh = new Mesh(DummyGeometry, DummyMaterial);
    mesh.name = 'placeholder';
    mesh.receiveShadow = false;
    mesh.castShadow = false;

    return mesh;
  }

  /**
   * Create a sky box material.
   *
   * @returns the sky box material
   */
  static createSkyBoxMaterial (): Material[]
  {
    const texPosx = SceneUtil.loadTexture('sky_posx.jpg');
    const texNegx = SceneUtil.loadTexture('sky_negy.jpg');
    const texPosy = SceneUtil.loadTexture('sky_posy.jpg');
    const texNegy = SceneUtil.loadTexture('sky_negz.jpg');
    const texPosz = SceneUtil.loadTexture('sky_posz.jpg');
    const texNegz = SceneUtil.loadTexture('sky_negx.jpg');

    return [
            new MeshBasicMaterial({ map: texPosx, side: BackSide }),
            new MeshBasicMaterial({ map: texNegx, side: BackSide }),
            new MeshBasicMaterial({ map: texPosy, side: BackSide }),
            new MeshBasicMaterial({ map: texNegy, side: BackSide }),
            new MeshBasicMaterial({ map: texPosz, side: BackSide }),
            new MeshBasicMaterial({ map: texNegz, side: BackSide }),
       ];
  }

  /**
   * Create a sky box of the given size.
   *
   * @param size the size of the box
   * @returns the sky box mesh
   */
  static createSkyBox (size: number): Mesh
  {
    const boxMaterial = SceneUtil.createSkyBoxMaterial();
    const boxGeometry = new BoxBufferGeometry(size, size, size);

    const mesh = new Mesh(boxGeometry, boxMaterial);
    mesh.name = 'skyBox';

    return mesh;
  }

  /**
   * Create a simple, white, spherical ball mesh.
   *
   * @param radius the ball radius
   * @returns the ball mesh
   */
  static createSimpleBall (radius: number): Mesh
  {
    const geometry = new SphereBufferGeometry(radius, 16, 16);
    geometry.name = 'ballGeo';

    const material = SceneUtil.createStdPhongMat('ballMat', 0xffffff);

    return SceneUtil.createMesh('ballSphere', geometry, material);
  }

  /**
   * Add a soccer field (grass) plane to the given object group.
   *
   * @param group the object group to add the field plane
   * @param fieldLength the length of the field
   * @param fieldWidth the width of the field
   * @param textureRepeat the number of texture repeats
   */
  static addFieldPlane (group: Object3D, fieldLength: number, fieldWidth: number, textureRepeat?: number): void
  {
    let mesh;

    /**
     * Helper method for adding meshes.
     * @param name
     * @param x
     * @param y
     * @param z
     */
    const addMesh = function(name: string, x: number, y: number, z: number): void {
      mesh = new Mesh(geometry, material);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.rotation.x = -Math.PI / 2;
      mesh.receiveShadow = true;
      mesh.castShadow = false;

      group.add(mesh);
    };


    // Create field plane
    let halfLength = Math.floor((fieldLength + 1.99) / 2);
    let geometry = new PlaneBufferGeometry(halfLength * 2, fieldWidth);
    let texture = SceneUtil.loadTexture('field.png');
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    if (textureRepeat !== undefined) {
      texture.repeat.set(textureRepeat, fieldWidth * textureRepeat / fieldLength);
    } else {
      texture.repeat.set(halfLength, fieldWidth);
    }
    let material = new MeshPhongMaterial({name: 'fieldMat', color: 0xcccccc, map: texture});
    addMesh('fieldPlane', 0, 0, 0);

    // Create field border
    halfLength = fieldLength / 2;
    const halfWidth = fieldWidth / 2;
    const borderSize = fieldLength / 12;
    geometry = new PlaneBufferGeometry(fieldLength + borderSize * 2, borderSize);
    texture = SceneUtil.loadTexture('field_border.png');
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set((fieldLength + borderSize * 2), borderSize);
    material = new MeshPhongMaterial({name: 'tbBorderMat', color: 0xaa99aa, map: texture});
    addMesh('topBorder', 0, 0, -halfWidth - borderSize / 2);
    addMesh('bottomBorder', 0, 0, halfWidth + borderSize / 2);

    texture = SceneUtil.loadTexture('field_border.png');
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(borderSize, fieldWidth);
    material = new MeshPhongMaterial({name: 'lrBorderMat', color: 0xaa99aa, map: texture});
    SceneUtil.offsetMaterial(material, -0.5, -0.05);
    geometry = new PlaneBufferGeometry(borderSize, fieldWidth);
    addMesh('leftBorder', -halfLength - borderSize / 2, 0, 0);
    addMesh('rightBorder', halfLength + borderSize / 2, 0, 0);
  }

  /**
   * Add standard field lines to the given object group.
   *
   * @param group the object group to add the field plane
   * @param lineWidth the field line width
   * @param fieldDimensions the dimensions of the field
   * @param centerRadius the radius of the center circle
   * @param goalAreaDimensions the dimensions of the goal area
   * @param penaltyAreaDimensions the dimensions of the penalty area + penalty kick spot
   */
  static addFieldLines (group: Object3D,
                        lineWidth: number,
                        fieldDimensions: Vector2,
                        centerRadius: number,
                        goalAreaDimensions: Vector2,
                        penaltyAreaDimensions?: Vector3): void
  {
    let mesh;
    let tempX = 0;
    const lineMaterial = new MeshBasicMaterial({ color: 0xeeeeee, side: DoubleSide });
    SceneUtil.offsetMaterial(lineMaterial, -1, -0.1);

    /**
     * Helper method for adding meshes.
     * @param name
     * @param x
     * @param y
     * @param z
     * @param rotZ
     */
     const addMesh = function(name: string, x: number, y: number, z: number, rotZ: number = 0) {
      mesh = new Mesh(geometry, lineMaterial);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = rotZ;
      mesh.receiveShadow = true;
      mesh.castShadow = false;

      group.add(mesh);
    };

    const halfLength = fieldDimensions.x / 2;
    const halfWidth = fieldDimensions.y / 2;
    const halfLineWidth = lineWidth / 2;

    // Circle
    let radius = centerRadius;
    let geometry: BufferGeometry = new RingBufferGeometry(radius - halfLineWidth, radius + halfLineWidth, 64, 1);
    addMesh('centerCircle', 0, 0, 0);

    // General field lines (l, r, t, b, c)
    geometry = new PlaneBufferGeometry(fieldDimensions.x + lineWidth, lineWidth);
    addMesh('topBorderLine', 0, 0, -halfWidth);
    addMesh('btmBorderLine', 0, 0, halfWidth);

    geometry = new PlaneBufferGeometry(lineWidth, fieldDimensions.y);
    addMesh('leftBorderLine', -halfLength, 0, 0);
    addMesh('rightBorderLine', halfLength, 0, 0);

    addMesh('centerLine', 0, 0, 0);

    // Corner circles
    radius = fieldDimensions.x / 105.0;
    geometry = new RingBufferGeometry(radius - halfLineWidth, radius + halfLineWidth, 8, 1, 0, Math.PI / 2);
    addMesh('btmLeftCircle', -halfLength, 0, halfWidth);
    addMesh('btmRightCircle', halfLength, 0, halfWidth, Math.PI / 2);
    addMesh('topRightCircle', halfLength, 0, -halfWidth, Math.PI);
    addMesh('topLeftCircle', -halfLength, 0, -halfWidth, -Math.PI / 2);

    // Center spot
    geometry = new CircleBufferGeometry(lineWidth * 1.2, 16);
    addMesh('centerSpot', 0, 0, 0);

    // Penalty area
    if (penaltyAreaDimensions) {
      // Penalty kick spots
      tempX = halfLength - penaltyAreaDimensions.z;
      addMesh('leftPenaltySpot', -tempX, 0, 0);
      addMesh('rightPenaltySpot', tempX, 0, 0);

      // Penalty area front lines
      const halfPenaltyWidth = penaltyAreaDimensions.y / 2;
      tempX = halfLength - penaltyAreaDimensions.x;
      geometry = new PlaneBufferGeometry(lineWidth, penaltyAreaDimensions.y + lineWidth);
      addMesh('leftPAFrontLine', -tempX, 0, 0);
      addMesh('rightPAFrontLine', tempX, 0, 0);

      // Penalty area top and bottom lines
      tempX = halfLength - penaltyAreaDimensions.x / 2;
      geometry = new PlaneBufferGeometry(penaltyAreaDimensions.x, lineWidth);
      addMesh('leftPATopLine', -tempX, 0, -halfPenaltyWidth);
      addMesh('leftPABtmLine', -tempX, 0, halfPenaltyWidth);

      addMesh('rightPABtmLine', tempX, 0, -halfPenaltyWidth);
      addMesh('rightPATopLine', tempX, 0, halfPenaltyWidth);

      // Penalty area arcs
      tempX = halfLength - penaltyAreaDimensions.z;
      const diffAngle = Math.acos((penaltyAreaDimensions.x - penaltyAreaDimensions.z) / centerRadius);
      geometry = new RingBufferGeometry(centerRadius - halfLineWidth, centerRadius + halfLineWidth, 32, 1, diffAngle, -2 * diffAngle);
      addMesh('leftPAArc', -tempX, 0, 0);
      addMesh('rightPAArc', tempX, 0, 0, Math.PI);
    }

    // Goal area
    const halfGoalAreaWidth = goalAreaDimensions.y / 2;
    tempX = halfLength - goalAreaDimensions.x;
    geometry = new PlaneBufferGeometry(lineWidth, goalAreaDimensions.y + lineWidth);
    addMesh('leftGAFrontLine', -tempX, 0, 0);
    addMesh('rightGAFrontLine', tempX, 0, 0);

    tempX = halfLength - goalAreaDimensions.x / 2;
    geometry = new PlaneBufferGeometry(goalAreaDimensions.x, lineWidth);
    addMesh('leftGATopLine', -tempX, 0, -halfGoalAreaWidth);
    addMesh('leftGABtmLine', -tempX, 0, halfGoalAreaWidth);

    addMesh('rightGATopLine', tempX, 0, -halfGoalAreaWidth);
    addMesh('rightGABtmLine', tempX, 0, halfGoalAreaWidth);
  }

  /**
   * Create a hockey (triangular) goal. The created goal is for the right side.
   *
   * @param name the name of the goal object group
   * @param postRadius the line width
   * @param dimensions the goal dimensions
   * @param color the goal color
   * @returns the ball object
   */
  static createHockeyGoal (name: string, postRadius: number, dimensions: Vector3, color: number): Object3D
  {
    const objGroup = new Object3D();
    objGroup.name = name;

    /**
     * Helper method for adding meshes.
     * @param name
     * @param material
     * @param x
     * @param y
     * @param z
     * @param shadows
     * @param keepRot
     * @returns the new mesh instance
     */
     const addMesh = function(name: string, material: Material, x: number, y: number, z: number, shadows: boolean, keepRot: boolean = false): Mesh {
      const newMesh = new Mesh(geometry, material);
      newMesh.name = name;
      newMesh.position.set(x, y, z);
      newMesh.rotation.x = keepRot ? 0 : -Math.PI / 2;
      newMesh.receiveShadow = shadows;
      newMesh.castShadow = shadows;
      objGroup.add(newMesh);

      return newMesh;
    };


    const goalBarRadius = postRadius / 2;
    const halfGoalWidth = postRadius + dimensions.y / 2;
    const halfGoalHeight = (goalBarRadius + dimensions.z) / 2;

    const goalMat = SceneUtil.createStdPhongMat('goalMat', color);
    goalMat.side = DoubleSide;

    const goalOffsetMat = goalMat.clone();
    SceneUtil.offsetMaterial(goalOffsetMat, -1, -0.1);

    // Goal posts
    let geometry: THREE.BufferGeometry = new CylinderBufferGeometry(postRadius, postRadius, dimensions.z + goalBarRadius, 16);
    addMesh('leftPost', goalOffsetMat, postRadius, halfGoalHeight, halfGoalWidth, true, true);
    addMesh('rightPost', goalOffsetMat, postRadius, halfGoalHeight, -halfGoalWidth, true, true);


    // Upper goal bar
    geometry = new CylinderBufferGeometry(goalBarRadius, goalBarRadius, halfGoalWidth * 2, 8);
    addMesh('upperBar', goalMat, postRadius, dimensions.z, 0, true);


    // Goal bottom bar
    const angle = Math.atan(0.5 * dimensions.z / dimensions.x);
    const tempGeometry = new CylinderGeometry(goalBarRadius, goalBarRadius, halfGoalWidth * 2, 8, 1, false, -0.5 * Math.PI, angle);
    const mat = new Matrix4();
    mat.identity();
    mat.elements[12] = -goalBarRadius / 2;
    tempGeometry.merge(new PlaneGeometry(goalBarRadius, halfGoalWidth * 2), mat);
    mat.makeRotationY(angle);
    mat.elements[12] = -Math.cos(angle) * goalBarRadius / 2;
    mat.elements[14] = Math.sin(angle) * goalBarRadius / 2;
    tempGeometry.merge(new PlaneGeometry(goalBarRadius, halfGoalWidth * 2), mat);

    geometry = new BufferGeometry();
    geometry.fromGeometry(tempGeometry);
    addMesh('bottomBar', goalOffsetMat, dimensions.x, 0, 0, true);


    // Goal stand
    let triShape = new Shape();
    triShape.moveTo(0, 0);
    triShape.lineTo(dimensions.x, 0);
    triShape.lineTo(0, dimensions.z / 2);
    triShape.lineTo(0, 0);
    geometry = new BufferGeometry();
    geometry.fromGeometry(new ShapeGeometry(triShape));
    addMesh('leftStand', goalMat, 0, 0, halfGoalWidth, true, true);
    addMesh('rightStand', goalMat, 0, 0, -halfGoalWidth, true, true);


    // Goal net
    const netWidth = dimensions.y + postRadius * 2 - 0.02;
    const netDepth = dimensions.x - postRadius - 0.01;
    const netHeight = Math.sqrt(netDepth * netDepth + dimensions.z * dimensions.z);

    const netSideTexture = SceneUtil.loadTexture('goalnet.png');
    netSideTexture.wrapS = RepeatWrapping;
    netSideTexture.wrapT = RepeatWrapping;
    netSideTexture.repeat.set(netDepth, dimensions.z);
    const goalNetMatSides = SceneUtil.createStdPhongMat('netSideMat', 0xffffff, netSideTexture);
    goalNetMatSides.side = DoubleSide;
    goalNetMatSides.transparent = true;

    const netBackTexture = SceneUtil.loadTexture('goalnet.png');
    netBackTexture.wrapS = RepeatWrapping;
    netBackTexture.wrapT = RepeatWrapping;
    netBackTexture.repeat.set(netWidth, netHeight);
    const goalNetMatBack = SceneUtil.createStdPhongMat('netBackMat', 0xffffff, netBackTexture);
    goalNetMatBack.side = DoubleSide;
    goalNetMatBack.transparent = true;

    triShape = new Shape();
    triShape.moveTo(0, 0);
    triShape.lineTo(netDepth, 0);
    triShape.lineTo(0, dimensions.z);
    triShape.lineTo(0, 0);
    geometry = new BufferGeometry();
    geometry.fromGeometry(new ShapeGeometry(triShape));
    addMesh('leftNet', goalNetMatSides, postRadius, 0, netWidth / 2, false, true);
    addMesh('rightNet', goalNetMatSides, postRadius, 0, -netWidth / 2, false, true);

    geometry = new PlaneBufferGeometry(netWidth, netHeight);
    const mesh = addMesh('backNet', goalNetMatBack, postRadius + netDepth / 2, dimensions.z / 2, 0, false, true);
    mesh.rotation.order = 'ZYX';
    mesh.rotation.y = -Math.PI / 2;
    mesh.rotation.x = (Math.PI / 2) - Math.atan(dimensions.z / netDepth);

    return objGroup;
  }

  /**
   * Create a hockey (triangular) goal. The created goal is for the right side.
   *
   * @param scene the scene/group to add lighting
   * @param fieldLength the length of the field
   * @param fieldWidth the width of the field
   */
  static addStdLighting (scene: Object3D, fieldLength: number, fieldWidth: number): void
  {
    // Ambient lighting
    scene.add(new AmbientLight(0xeeeeee));


    // sun lighting
    const vertical = Math.ceil(fieldWidth * 0.8);
    const horizontal = Math.ceil(fieldLength * 0.7);
    const depth = fieldWidth;

    const directionalLight = new DirectionalLight(0xeeeeee, 0.4);
    directionalLight.position.set(300, 300, 500);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;

    directionalLight.shadow.camera.left = -horizontal;
    directionalLight.shadow.camera.right = horizontal;
    directionalLight.shadow.camera.top = vertical;
    directionalLight.shadow.camera.bottom = -vertical;
    directionalLight.shadow.camera.near = 655 - depth;
    directionalLight.shadow.camera.far = 655 + depth;

    scene.add(directionalLight);
  }
}

export { SceneUtil };


/**
 * The threejs texture loader.
 */
let TextureLoaderInstance: TextureLoader | undefined = undefined;

/**
 * The texture path.
 * @const {string}
 */
const TexturePath = 'textures/';


/**
 * The threejs object loader.
 */
let ObjectLoaderInstance: ObjectLoader | undefined = undefined;

/**
 * The object/model path.
 * @const {string}
 */
const ModelPath = 'models/';


/**
 * The selection material.
 */
export const SelectionMaterial = new MeshPhongMaterial({name: 'selectionMat', color: 0xeeeeee, side: DoubleSide});
SceneUtil.offsetMaterial(SelectionMaterial, -1.5, -0.15);

/**
 * The Dummy geometry.
 */
export const DummyGeometry = new BoxBufferGeometry(0.1, 0.1, 0.1);

/**
 * The dummy material.
 */
export const DummyMaterial = new MeshPhongMaterial({name: 'dummyMat', color: 0x000000});
