import { Matrix4, Vector3 } from 'three';

/**
 *
 * @author Stefan Glaser
 */
class MeshSpecification
{
  /** The name of the mesh. */
  name: string;

  /** The name of the material. */
  material: string;

  /** The name of the material. */
  matrix: Matrix4;

  /**
   * MeshSpecification Constructor
   *
   * @param name the name of the mesh
   * @param material the name of the material
   * @param matrix the mesh transformation matrix
   */
  constructor (name: string, material: string, matrix: Matrix4 = new Matrix4())
  {
    this.name = name;
    this.material = material;
    this.matrix = matrix;
  }
}

export { MeshSpecification };


/**
 *
 * @author Stefan Glaser
 */
class BodyPartSpecification
{
  /** The name of the body part. */
  name: string;

  /** The Array of mesh specifications representing this body part. */
  meshes: MeshSpecification[];

  /** The translation from the parent body part to this body part. */
  translation: Vector3;

  /** The Array of body part object names. */
  jointAxis: Vector3;

  /** The Array of child body parts. */
  children: BodyPartSpecification[];

  /**
   * BodyPartSpecification Constructor
   *
   * @param name the name of the body part
   * @param meshes the list of mesh specifications representing this body part
   * @param translation the translation from the parent body part to this body part
   * @param jointAxis the rotation axis of the joint attached to this body part
   * @param children the child body parts
   */
  constructor (name: string, meshes: MeshSpecification[], translation: Vector3, jointAxis: Vector3, children: BodyPartSpecification[])
  {
    this.name = name;
    this.meshes = meshes;
    this.translation = translation;
    this.jointAxis = jointAxis;
    this.children = children;
  }
}

export { BodyPartSpecification };


/**
 *
 * @author Stefan Glaser
 */
class RobotSpecification
{
  /** The name of the root body part. */
  name: string;

  /** The names of the team materials. */
  teamMaterialNames: string[];

  /** The Array of mesh specifications representing the root body part. */
  meshes: MeshSpecification[];

  /** The Array of child body parts. */
  children: BodyPartSpecification[];

  /**
   * RobotSpecification Constructor
   *
   * @param name the name of the root body part
   * @param teamMaterialNames the names of the team materials
   * @param meshes the list of mesh specifications representing this body part
   * @param children the child body parts
   */
  constructor (name: string, teamMaterialNames: string[] = [], meshes: MeshSpecification[] = [], children: BodyPartSpecification[] = [])
  {
    this.name = name;
    this.teamMaterialNames = teamMaterialNames;
    this.meshes = meshes;
    this.children = children;
  }
}

export { RobotSpecification };
