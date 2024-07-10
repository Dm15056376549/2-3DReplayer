import { RobotModel } from '../RobotModel';
import { SceneUtil } from '../../../../utils/SceneUtil';
import { MeshFactory } from '../../utils/MeshFactory';
import { RobotSpecification, BodyPartSpecification } from './RobotSpecification';
import { Mesh, Object3D, Vector3 } from 'three';

/**
 * The DynamicRobotModel class definition.
 *
 * @author Stefan Glaser
 */
class DynamicRobotModel extends RobotModel
{
  /**
   * DynamicRobotModel Constructor
   *
   * @param name the name of the agent model
   * @param specification the dynamic model specification
   * @param meshFactory the mesh factory
   */
  constructor (name: string, specification: RobotSpecification, meshFactory: MeshFactory)
  {
    super(name);

    // Create model gl representation based on model specification
    this.createModel(specification, meshFactory);
  }

  /**
   * Create a robot model to the given name.
   *
   * @param spec the robot specification
   * @param meshFactory the mesh factory
   */
  createModel (spec: RobotSpecification, meshFactory: MeshFactory): void
  {
    let i = 0;

    // Create root body
    const rootBody = new Object3D();
    rootBody.name = spec.name;
    this.objGroup.add(rootBody);

    if (spec.meshes.length > 0) {
      // Create placeholder
      const placeholder = meshFactory.createDummyMesh();
      rootBody.add(placeholder);

      const onLoaded = function() {
        const body = rootBody;
        const ph = placeholder;

        return function(mesh: Mesh) {
          body.remove(ph);
          body.add(mesh);
        };
      }();

      // Create meshes
      i = spec.meshes.length;
      while (i--) {
        meshFactory.createMesh(spec.meshes[i].name, spec.meshes[i].material, spec.meshes[i].matrix, onLoaded);
      }
    }

    // Create child body parts
    for (i = 0; i < spec.children.length; ++i) {
      rootBody.add(this.createBodyParts(spec.children[i], meshFactory));
    }

    // Extract team materials
    i = spec.teamMaterialNames.length;
    while (i--) {
      const mat = meshFactory.materialCache[spec.teamMaterialNames[i]];
      if (mat !== undefined) {
        if (Array.isArray(mat)) {
          this.teamMatList.push(...mat);
        } else {
          this.teamMatList.push(mat);
        }
      }
    }
  }

  /**
   * Create a body part hierarchy according to the given specification.
   *
   * @param specification the body part specification
   * @param meshFactory the mesh factory
   * @returns an object representing this body part
   */
  createBodyParts (specification: BodyPartSpecification, meshFactory: MeshFactory): Object3D
  {
    let i = 0;
    // TODO: Kind of a ugly to append a "jointAxis" attribute to an THREE.Object3D. Think about a more elegant way to do or describe it.
    const bodyGroup: Object3D & {jointAxis?: Vector3} = new Object3D();
    bodyGroup.name = specification.name;
    this.jointGroups.push(bodyGroup);

    // Set body part data
    bodyGroup.position.copy(specification.translation);
    bodyGroup.jointAxis = specification.jointAxis;

    if (specification.meshes.length > 0) {
      // Create placeholder
      const placeholder = SceneUtil.createDummyMesh();
      bodyGroup.add(placeholder);

      const onLoaded = function() {
        const body = bodyGroup;
        const ph = placeholder;

        return function(mesh: Mesh) {
          body.remove(ph);
          body.add(mesh);
        };
      }();

      // Create meshes
      i = specification.meshes.length;
      while (i--) {
        meshFactory.createMesh(specification.meshes[i].name, specification.meshes[i].material, specification.meshes[i].matrix, onLoaded);
      }
    }

    // Create child body parts
    for (i = 0; i < specification.children.length; ++i) {
      bodyGroup.add(this.createBodyParts(specification.children[i], meshFactory));
    }

    return bodyGroup;
  }
}

export { DynamicRobotModel };
