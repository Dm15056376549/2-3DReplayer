/**
 * Geometry factory interface.
 * 
 * @author Stefan Glaser
 */
interface IGeometryFactory
{
  /**
   * Create the geometry with the given name.
   *
   * @param name the unique name of the geometry
   * @param onLoad the callback function to call on successfull creation
   * @param onError the callback function to call when creating the geometry failed
   */
  createGeometry (name: string,
                  onLoad: (geometry: THREE.BufferGeometry) => any,
                  onError: ((errorMsg: string) => any) | undefined): void;
}

export { IGeometryFactory };
