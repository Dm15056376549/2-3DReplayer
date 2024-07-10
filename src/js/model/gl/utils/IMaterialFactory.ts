import { Material } from 'three';

/**
 * Material factory interface.
 * 
 * @author Stefan Glaser
 */
interface IMaterialFactory
{
	/**
	 * Create the material with the given name.
	 *
	 * @param name the unique name of the material
	 * @returns the requested (multi-)material or a default material if the requested material definition was not found
	 */
	createMaterial (name: string): Material | Material[];
}

export { IMaterialFactory };
