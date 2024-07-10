/**
 * Base class for all configuration models.
 *
 * @author Stefan Glaser
 */
interface ConfigurationModel
{
  /**
   * Retrieve the configuration id.
   *
   * @returns the configuration id
   */
  getID (): string;

  /**
   * Retrieve a stringified version of this configuration for persistance.
   *
   * @returns the stringified version of this configuration
   */
  toJSONString (): string;

  /**
   * Restore this configuration from persistance string.
   *
   * @param jsonString a stringified version of this configuration
   */
  fromJSONString (jsonString: string): void;
}

export { ConfigurationModel };
