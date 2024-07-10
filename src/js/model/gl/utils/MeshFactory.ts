import { IGeometryFactory } from './IGeometryFactory';
import { IMaterialFactory } from './IMaterialFactory';
import { SceneUtil } from '../../../utils/SceneUtil';
import { BufferGeometry, Material, Matrix4, Mesh } from 'three';

/** 
 * 
 * @author Stefan Glaser
 */
class MeshFactory
{
  /** The geometry factory. */
  geometryFactory: IGeometryFactory;

  /** The material factory. */
  materialFactory: IMaterialFactory;

  /** Geometry cache. */
  geometryCache: Record<string, BufferGeometry>;

  /** Material cache. */
  materialCache: Record<string, Material | Material[]>;

  /** Let created meshes cast shadow. */
  castShadow: boolean;

  /** Let created meshes receive shadow. */
  receiveShadow: boolean;

  /**
   * MeshFactory Constructor
   *
   * @param geometryFactory the geometry factory to use
   * @param materialFactory the material factory to use
   */
  constructor (geometryFactory: IGeometryFactory, materialFactory: IMaterialFactory)
  {
    this.geometryFactory = geometryFactory;
    this.materialFactory = materialFactory;
    this.geometryCache = {};
    this.materialCache = {};
    this.castShadow = true;
    this.receiveShadow = true;
  }

  /**
   * Clear the internal cache.
   */
  clearCache (): void
  {
    this.geometryCache = {};
    this.materialCache = {};
  }

  /**
   * Create a mesh with the given name.
   * This method will call the GeometryFactory for a geometry with the given mesh name appended with 'Geo'.
   * If such a geometry exists, it creates a new mesh with the requested geometry and material.
   *
   * @param name the unique name of the geometry
   * @param materialName the unique name of the the material to use
   * @param matrix the mesh matrix
   * @param onLoad the callback function to call on successfull creation
   * @param onError the callback function to call when creating the mesh failed
   */
  createMesh (name: string,
              materialName: string,
              matrix: Matrix4,
              onLoad: (mesh: Mesh) => any,
              onError: ((errorMsg: string) => any) | undefined = undefined): void
  {
    const geometryName = name + 'Geo';

    // Fetch material
    const material = this.fetchMaterial(materialName);

    // Check if geometry is already cached
    if (this.geometryCache[geometryName] !== undefined) {
      // Directly create the requested mesh object with cached geometry
      const mesh = new Mesh(this.geometryCache[geometryName], material);
      mesh.name = name;
      mesh.castShadow = this.castShadow;
      mesh.receiveShadow = this.receiveShadow;
      mesh.applyMatrix(matrix);

      onLoad(mesh);
    } else {
      const scope = this;

      // Try to create the requested geometry
      this.geometryFactory.createGeometry(geometryName,
        function(newGeometry) { // onLoad
          scope.geometryCache[geometryName] = newGeometry;

          // Create the mesh object
          const mesh = new Mesh(newGeometry, material);
          mesh.name = name;
          mesh.castShadow = scope.castShadow;
          mesh.receiveShadow = scope.receiveShadow;
          mesh.applyMatrix(matrix);

          onLoad(mesh);
        },
        onError);
    }
  }

  /**
   * Fetch the material with the given name.
   *
   * @returns the dummy mesh
   */
  createDummyMesh (): Mesh
  {
    return SceneUtil.createDummyMesh();
  }

  /**
   * Fetch the material with the given name.
   *
   * @param name the unique name of the material
   * @returns the requested material
   */
  fetchMaterial (name: string): Material | Material[]
  {
    // Try fetching material from cache
    let material = this.materialCache[name];

    if (material === undefined) {
      // Create the requested material if not yet present
      material = this.materialFactory.createMaterial(name);
      this.materialCache[name] = material;
    }

    return material;
  }
}

export { MeshFactory };