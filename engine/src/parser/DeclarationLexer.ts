// Generated from src/parser/Declaration.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class DeclarationLexer extends Lexer {
	public static readonly SEMICOLON = 1;
	public static readonly OPEN_BRACE = 2;
	public static readonly CLOSING_BRACE = 3;
	public static readonly WS = 4;
	public static readonly ANY = 5;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"SEMICOLON", "OPEN_BRACE", "CLOSING_BRACE", "WS", "ANY",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "SEMICOLON", "OPEN_BRACE", "CLOSING_BRACE", "WS", "ANY",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(DeclarationLexer._LITERAL_NAMES, DeclarationLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return DeclarationLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(DeclarationLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "Declaration.g4"; }

	// @Override
	public get ruleNames(): string[] { return DeclarationLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return DeclarationLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return DeclarationLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return DeclarationLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\x07\x1C\b\x01" +
		"\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06" +
		"\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05\x03\x05\x03\x05" +
		"\x03\x05\x03\x06\x06\x06\x19\n\x06\r\x06\x0E\x06\x1A\x02\x02\x02\x07\x03" +
		"\x02\x03\x05\x02\x04\x07\x02\x05\t\x02\x06\v\x02\x07\x03\x02\x07\x03\x02" +
		"==\x03\x02}}\x03\x02\x7F\x7F\x05\x02\n\f\x0E\x0F\"\"\b\x02\n\f\x0E\x0F" +
		"\"\"==}}\x7F\x7F\x02\x1C\x02\x03\x03\x02\x02\x02\x02\x05\x03\x02\x02\x02" +
		"\x02\x07\x03\x02\x02\x02\x02\t\x03\x02\x02\x02\x02\v\x03\x02\x02\x02\x03" +
		"\r\x03\x02\x02\x02\x05\x0F\x03\x02\x02\x02\x07\x11\x03\x02\x02\x02\t\x13" +
		"\x03\x02\x02\x02\v\x18\x03\x02\x02\x02\r\x0E\t\x02\x02\x02\x0E\x04\x03" +
		"\x02\x02\x02\x0F\x10\t\x03\x02\x02\x10\x06\x03\x02\x02\x02\x11\x12\t\x04" +
		"\x02\x02\x12\b\x03\x02\x02\x02\x13\x14\t\x05\x02\x02\x14\x15\x03\x02\x02" +
		"\x02\x15\x16\b\x05\x02\x02\x16\n\x03\x02\x02\x02\x17\x19\n\x06\x02\x02" +
		"\x18\x17\x03\x02\x02\x02\x19\x1A\x03\x02\x02\x02\x1A\x18\x03\x02\x02\x02" +
		"\x1A\x1B\x03\x02\x02\x02\x1B\f\x03\x02\x02\x02\x04\x02\x1A\x03\b\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!DeclarationLexer.__ATN) {
			DeclarationLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(DeclarationLexer._serializedATN));
		}

		return DeclarationLexer.__ATN;
	}

}

