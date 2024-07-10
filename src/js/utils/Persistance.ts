/**
 * Simple persistance helpers.
 *
 * @author Stefan Glaser
 */
class Persistance
{
  /**
   * Store the given value under the given key in the local storage.
   *
   * @param key the storage item key
   * @param value the item value
   */
  static storeItem (key: string, value: string | boolean): void
  {
    localStorage.setItem(key, value.toString());
  }

  /**
   * Read an item from the local storage with the given key.
   *
   * @param key the storage item key
   * @returns the stored value for the given key, or null if no such value exists
   */
  static readItem (key: string): string | null
  {
    return localStorage.getItem(key);
  }

  /**
   * Read a boolean from local storage.
   *
   * @param key the key
   * @param defaultVal the defaultVal value if no value for the given key was specified
   * @returns the stored value for the given key, or the default value if no such value exists
   */
  static readString (key: string, defaultVal: string): string
  {
    const item = localStorage.getItem(key);

    if (item !== null) {
      return item;
    }

    return defaultVal;
  }

  /**
   * Read a boolean from local storage.
   *
   * @param key the key
   * @param defaultVal the defaultVal value if no value for the given key was specified
   * @returns the stored value for the given key, or the default value if no such value exists
   */
  static readBoolean (key: string, defaultVal: boolean): boolean
  {
    const item = localStorage.getItem(key);

    if (item !== null) {
      return item == 'true';
    }

    return defaultVal;
  }
}

export { Persistance };
