import { SymbolNode } from './SymbolNode';

/**
 * The SymbolTreeParser class definition.
 *
 * The SymbolTreeParser allows parsing a symbol tree string into a tree representation.
 *
 * @author Stefan Glaser
 */
class SymbolTreeParser
{
  /**
   * Parse the given string into a symbol tree representation.
   *
   * @param input the string to parse
   * @returns a new SymbolNode instance
   */
  static parse (input: string): SymbolNode
  {
    const rootNode = new SymbolNode();

    if (input.charAt(0) !== '(' || input.charAt(input.length - 1) !== ')') {
      throw new Error('Input not embedded in braces: ' + input);
    }


    const pos = SymbolTreeParser.parseNode(input, 1, rootNode);
    if (pos !== input.length) {
      throw new Error('Multiple root nodes in input: ' + input);
    }

    return rootNode.children[0];
  }

  /**
   * Parse the given string into a symbol tree representation.
   *
   * @param input the string to parse
   * @param startIdx the index to start
   * @param parentNode the parent node
   * @returns the index after parsing the node
   */
  static parseNode (input: string, startIdx: number, parentNode: SymbolNode): number
  {
    // Create a new node
    const newNode = new SymbolNode();
    parentNode.children.push(newNode);

    let idx = startIdx;

    while (idx < input.length) {
      if (input.charAt(idx) === '(') {
        // Found a new subnode
        if (idx > startIdx) {
          // Add value to node
          newNode.values.push(input.slice(startIdx, idx));
        }
        startIdx = idx = SymbolTreeParser.parseNode(input, idx + 1, newNode);
      } else if (input.charAt(idx) === ')') {
        // Found node terminator for this node
        if (idx > startIdx) {
          // Add value to node
          newNode.values.push(input.slice(startIdx, idx));
        }
        return idx + 1;
      } else if (input.charAt(idx) === ' ') {
        // Found new value terminator
        if (idx > startIdx) {
          // Add value to node
          newNode.values.push(input.slice(startIdx, idx));
        }
        idx++;
        startIdx = idx;
      } else {
        idx++;
      }
    }

    throw new Error('Invalid tree structure in input: ' + input);
  }
}

export { SymbolTreeParser };
