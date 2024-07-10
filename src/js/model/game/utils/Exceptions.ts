/**
 * The ParserError class definition.
 *
 * @author Stefan Glaser
 */
class ParserError extends Error
{
  /**
   * ParserError Constructor
   *
   * @param msg the exception message
   */
  constructor (message: string)
  {
    super(message);
    this.name = 'ParserError';
  }
}

export { ParserError };
