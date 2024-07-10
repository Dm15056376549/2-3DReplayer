import { IGeometryFactory } from './IGeometryFactory';
import { BufferGeometry, FileLoader, ObjectLoader } from 'three';

class JSONGeometryFactoryRequest
{
  /** The name of the requested geometry. */
  name: string;

  /** The onLoad callback. */
  onLoad: (geometry: THREE.BufferGeometry) => any;

  /** The onError callback. */
  onError: ((errorMsg: string) => any) | undefined;
  
  /**
   * Helper class for storing geometry requests while the resource file is still loading.
   *
   * @param name the name of the requested geometry
   * @param onLoad the onLoad callback
   * @param onError the onError callback
   */
  constructor (name: string, onLoad: (geometry: THREE.BufferGeometry) => any, onError: ((errorMsg: string) => any) | undefined = undefined)
  {
    this.name = name;
    this.onLoad = onLoad;
    this.onError = onError;
  }
}

export { JSONGeometryFactoryRequest };



class JSONGeometryFactory implements IGeometryFactory
{
  /** The json resource file. */
  resourceFile: string;

  /** The list of loaded geometries. */
  geometries: BufferGeometry[];

  /** An array holding the create requests while the factory is still loading. */
  requestCache: JSONGeometryFactoryRequest[];

  /** Flag for indicating if the factory is currently loading the resource file. */
  loading: boolean;

  /** Flag for indicating if the factory resource file was loaded. */
  loaded: boolean;

  /**
   * @param resourceFile the json resource file containing a geometry array
   */
  constructor (resourceFile: string)
  { 
    this.resourceFile = resourceFile;
    this.geometries = [];
    this.requestCache = [];
    this.loading = false;
    this.loaded = false;
  }

  /**
   * Load the json resource file.
   */
  loadJSON (): void
  {
    if (this.loaded || this.loading) {
      return;
    }

    this.loading = true;

    const scope = this;
    const fileLoader = new FileLoader();

    fileLoader.load(this.resourceFile,
      function(json) {
        const objectLoader = new ObjectLoader();
        // TODO: Think about how to handle a ArrayBuffer response instead of simply assuming a string type.
        const loadedGeometries = objectLoader.parseGeometries(JSON.parse(json as string));

        for (const key in loadedGeometries) {
          const geometry = loadedGeometries[key];

          if (geometry.isGeometry !== undefined && geometry.isGeometry === true) {
            const bufferGeo = new BufferGeometry();
            bufferGeo.fromGeometry(geometry);
            bufferGeo.name = geometry.name;
            scope.geometries.push(bufferGeo);

            // Dispose source geometry after copy
            geometry.dispose();
          } else if (geometry.isBufferGeometry !== undefined && geometry.isBufferGeometry === true) {
            scope.geometries.push(geometry);
          }
        }

        // Set flags
        scope.loaded = true;
        scope.loading = false;

        // Serve cached geometry requests
        scope.serveCachedRequests();
      },
      undefined,
      function(xhr) {
        // Set flags
        scope.loaded = true;
        scope.loading = false;

        // Notify cached geometry requests about failure
        scope.serveCachedRequests();

        console.error('Failed to load GeometryFactory resource file: "' + scope.resourceFile + '"!');
      });
  }

  /**
   * Serve all cached requests.
   */
  serveCachedRequests (): void
  {
    let i = this.requestCache.length;
    let request;
    while (i--) {
      request = this.requestCache[i];
      this.createGeometry(request.name, request.onLoad, request.onError);
    }

    // Clear cached requests
    this.requestCache.length = 0;
  }

  /**
   * Create the geometry with the given name.
   *
   * @override
   * @param name the unique name of the geometry
   * @param onLoad the callback function to call on successfull creation
   * @param onError the callback function to call when creating the geometry failed
   */
  createGeometry (name: string, onLoad: (geometry: BufferGeometry) => any, onError: ((errorMsg: string) => any) | undefined = undefined): void
  {
    // Check if the resource file was loaded before
    if (this.loaded) {
      // The resource file is already loaded, so directly call onLoad/onError
      let i = this.geometries.length;
      while (i--) {
        if (this.geometries[i].name === name) {
          onLoad(this.geometries[i]);
          return;
        }
      }

      // Log error
      console.log('Geometry "' + name + '" not found!');

      // The requested geometry is not part of the resource file, report error
      if (onError) {
        onError('Geometry "' + name + '" not found!');
      }
    } else {
      // The resource file is not loaded yet, so check if we need to trigger loading it
      if (!this.loading) {
        this.loadJSON();
      }

      // While the resource file is loading, we need to remember the request and serve it later
      this.requestCache.push(new JSONGeometryFactoryRequest(name, onLoad, onError));
    }
  }
}

export { JSONGeometryFactory };
