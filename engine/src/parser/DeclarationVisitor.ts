// Generated from src/parser/Declaration.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";

import { CodeContext } from "./DeclarationParser";
import { DeclarationContext } from "./DeclarationParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `DeclarationParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface DeclarationVisitor<Result> extends ParseTreeVisitor<Result> {
	/**
	 * Visit a parse tree produced by `DeclarationParser.code`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitCode?: (ctx: CodeContext) => Result;

	/**
	 * Visit a parse tree produced by `DeclarationParser.declaration`.
	 * @param ctx the parse tree
	 * @return the visitor result
	 */
	visitDeclaration?: (ctx: DeclarationContext) => Result;
}

