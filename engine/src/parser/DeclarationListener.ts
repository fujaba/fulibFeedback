// Generated from src/parser/Declaration.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

import { CodeContext } from "./DeclarationParser";
import { DeclarationContext } from "./DeclarationParser";


/**
 * This interface defines a complete listener for a parse tree produced by
 * `DeclarationParser`.
 */
export interface DeclarationListener extends ParseTreeListener {
	/**
	 * Enter a parse tree produced by `DeclarationParser.code`.
	 * @param ctx the parse tree
	 */
	enterCode?: (ctx: CodeContext) => void;
	/**
	 * Exit a parse tree produced by `DeclarationParser.code`.
	 * @param ctx the parse tree
	 */
	exitCode?: (ctx: CodeContext) => void;

	/**
	 * Enter a parse tree produced by `DeclarationParser.declaration`.
	 * @param ctx the parse tree
	 */
	enterDeclaration?: (ctx: DeclarationContext) => void;
	/**
	 * Exit a parse tree produced by `DeclarationParser.declaration`.
	 * @param ctx the parse tree
	 */
	exitDeclaration?: (ctx: DeclarationContext) => void;
}

