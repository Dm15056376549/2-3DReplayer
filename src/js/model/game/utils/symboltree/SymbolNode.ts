/**
 * The SymbolNode class definition.
 *
 * The SymbolNode represents a symbolic node in a symbol tree, holding values and child nodes.
 *
 * @author Stefan Glaser
 */
class SymbolNode
{
  /** The symbol node values */
  values: string[];

  /** The symbol node children. */
  children: SymbolNode[];

  /**
   * SymbolNode Constructor - create a new SymbolNode.
   */
  constructor ()
  {
    this.values = [];
    this.children = [];
  }
}

export { SymbolNode };
