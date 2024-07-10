type ParameterObject = {
  [key: string]: number | boolean | string | ParameterObject;
};

/**
 * The ParameterMap class definition.
 *
 * The ParameterMap provides
 *
 * @author Stefan Glaser / http://chaosscripting.net
 */
class ParameterMap
{
  /** The parameter object. */
  paramObj: ParameterObject;

  /**
   * ParameterMap Constructor
   *
   * @param params the parameter object.
   */
  constructor(params: ParameterObject = {})
  {
    this.paramObj = params;
  }

  /**
   * Clear this parameter map.
   */
  clear (): void
  {
    this.paramObj = {};
  }

  /**
   * Fetch a number parameter with the given key.
   * This method will return undefined if:
   * - the key is invalid (undefined)
   * - the value with the given key is not a number
   *
   * @param key the key of interest
   */
  getNumber (key: string | number): number | undefined
  {
    const value = this.paramObj[key];

    if (typeof value === 'number') {
      return value;
    }

    return undefined;
  }

  /**
   * Fetch a boolean parameter with the given key.
   * This method will return undefined if:
   * - the key is invalid (undefined)
   *
   * @param key the key of interest
   */
  getBoolean (key: string | number): boolean | undefined
  {
    const value = this.paramObj[key];

    if (value !== undefined) {
      return value ? true : false;
    }

    return undefined;
  }

  /**
   * Fetch a string parameter with the given key.
   * This method will return undefined if:
   * - the key is invalid (undefined)
   * - the value with the given key is not a string
   *
   * @param key the key of interest
   */
  getString (key: string | number): string | undefined
  {
    const value = this.paramObj[key];

    if (typeof value === 'string') {
      return value;
    }

    return undefined;
  }

  /**
   * Fetch a new parameter wrapper object for the object with the given key.
   * This method will return undefined if:
   * - the key is invalid (undefined)
   * - the value with the given key is not an object
   *
   * @param key the key of interest
   */
  getObject (key: string | number): ParameterMap | undefined
  {
    const value = this.paramObj[key];

    if (typeof value === 'object') {
      return new ParameterMap(value);
    }

    return undefined;
  }
}

export { ParameterObject, ParameterMap };
