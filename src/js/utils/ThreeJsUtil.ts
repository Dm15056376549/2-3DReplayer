import { Matrix4 } from 'three';


/**
 * Make 4x4 Matrtix.
 *
 * @param n11
 * @param n12
 * @param n13
 * @param n14
 * @param n21
 * @param n22
 * @param n23
 * @param n24
 * @param n31
 * @param n32
 * @param n33
 * @param n34
 * @return a new 4x4 matrix
 */
function makeM4x4 (n11: number, n12: number, n13: number, n14: number,
                          n21: number, n22: number, n23: number, n24: number,
                          n31: number, n32: number, n33: number, n34: number): Matrix4 {
  return new Matrix4().set(n11, n12, n13, n14,
                           n21, n22, n23, n24,
                           n31, n32, n33, n34,
                           0, 0, 0, 1);
}

export { makeM4x4 };
