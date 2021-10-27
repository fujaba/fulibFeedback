import {CharStreams, CommonTokenStream} from 'antlr4ts';
import {ParseTreeWalker} from 'antlr4ts/tree';
import {Node} from './node';
import {DeclarationLexer} from './parser/DeclarationLexer';
import {DeclarationListener} from './parser/DeclarationListener';
import {DeclarationParser} from './parser/DeclarationParser';

export function parseTree(code: string): Node {
  const input = CharStreams.fromString(code);
  const lexer = new DeclarationLexer(input);
  const tokens = new CommonTokenStream(lexer);
  const parser = new DeclarationParser(tokens);
  const codeCtx = parser.code();
  const nodes: Node[] = [{declaration: '', children: [], start: 0, end: code.length}];
  const listener: DeclarationListener = {
    enterDeclaration: (ctx) => {
      const parent = nodes[nodes.length - 1];
      const node: Node = {
        declaration: ctx.ANY().join(' '),
        parent,
        children: [],
        start: ctx.start.startIndex,
        end: ctx.stop.stopIndex + 1,
      };
      parent.children.push(node);
      nodes.push(node);
    },
    exitDeclaration: () => {
      nodes.pop();
    },
  };
  new ParseTreeWalker().walk(listener, codeCtx);
  return nodes[0];
}

export function getNodePath(node: Node, position: number): Node[] {
  if (!contains(node, position)) {
    return [];
  }

  const result: Node[] = [node];
  while (true) {
    const child = node.children.find(c => contains(c, position));
    if (!child) {
      return result;
    }
    result.push(child);
    node = child;
  }
}

export function contains(node: Node, position: number): boolean {
  return node.start <= position && position < node.end;
}
