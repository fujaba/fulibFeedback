// Generated from src/parser/Declaration.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { DeclarationListener } from "./DeclarationListener";
import { DeclarationVisitor } from "./DeclarationVisitor";


export class DeclarationParser extends Parser {
	public static readonly SEMICOLON = 1;
	public static readonly OPEN_BRACE = 2;
	public static readonly CLOSING_BRACE = 3;
	public static readonly WS = 4;
	public static readonly ANY = 5;
	public static readonly RULE_code = 0;
	public static readonly RULE_declaration = 1;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"code", "declaration",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "SEMICOLON", "OPEN_BRACE", "CLOSING_BRACE", "WS", "ANY",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(DeclarationParser._LITERAL_NAMES, DeclarationParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return DeclarationParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "Declaration.g4"; }

	// @Override
	public get ruleNames(): string[] { return DeclarationParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return DeclarationParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(DeclarationParser._ATN, this);
	}
	// @RuleVersion(0)
	public code(): CodeContext {
		let _localctx: CodeContext = new CodeContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, DeclarationParser.RULE_code);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 7;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << DeclarationParser.SEMICOLON) | (1 << DeclarationParser.OPEN_BRACE) | (1 << DeclarationParser.ANY))) !== 0)) {
				{
				{
				this.state = 4;
				this.declaration();
				}
				}
				this.state = 9;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public declaration(): DeclarationContext {
		let _localctx: DeclarationContext = new DeclarationContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, DeclarationParser.RULE_declaration);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 13;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === DeclarationParser.ANY) {
				{
				{
				this.state = 10;
				this.match(DeclarationParser.ANY);
				}
				}
				this.state = 15;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 21;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case DeclarationParser.SEMICOLON:
				{
				this.state = 16;
				this.match(DeclarationParser.SEMICOLON);
				}
				break;
			case DeclarationParser.OPEN_BRACE:
				{
				this.state = 17;
				this.match(DeclarationParser.OPEN_BRACE);
				this.state = 18;
				this.code();
				this.state = 19;
				this.match(DeclarationParser.CLOSING_BRACE);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\x07\x1A\x04\x02" +
		"\t\x02\x04\x03\t\x03\x03\x02\x07\x02\b\n\x02\f\x02\x0E\x02\v\v\x02\x03" +
		"\x03\x07\x03\x0E\n\x03\f\x03\x0E\x03\x11\v\x03\x03\x03\x03\x03\x03\x03" +
		"\x03\x03\x03\x03\x05\x03\x18\n\x03\x03\x03\x02\x02\x02\x04\x02\x02\x04" +
		"\x02\x02\x02\x02\x1A\x02\t\x03\x02\x02\x02\x04\x0F\x03\x02\x02\x02\x06" +
		"\b\x05\x04\x03\x02\x07\x06\x03\x02\x02\x02\b\v\x03\x02\x02\x02\t\x07\x03" +
		"\x02\x02\x02\t\n\x03\x02\x02\x02\n\x03\x03\x02\x02\x02\v\t\x03\x02\x02" +
		"\x02\f\x0E\x07\x07\x02\x02\r\f\x03\x02\x02\x02\x0E\x11\x03\x02\x02\x02" +
		"\x0F\r\x03\x02\x02\x02\x0F\x10\x03\x02\x02\x02\x10\x17\x03\x02\x02\x02" +
		"\x11\x0F\x03\x02\x02\x02\x12\x18\x07\x03\x02\x02\x13\x14\x07\x04\x02\x02" +
		"\x14\x15\x05\x02\x02\x02\x15\x16\x07\x05\x02\x02\x16\x18\x03\x02\x02\x02" +
		"\x17\x12\x03\x02\x02\x02\x17\x13\x03\x02\x02\x02\x18\x05\x03\x02\x02\x02" +
		"\x05\t\x0F\x17";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!DeclarationParser.__ATN) {
			DeclarationParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(DeclarationParser._serializedATN));
		}

		return DeclarationParser.__ATN;
	}

}

export class CodeContext extends ParserRuleContext {
	public declaration(): DeclarationContext[];
	public declaration(i: number): DeclarationContext;
	public declaration(i?: number): DeclarationContext | DeclarationContext[] {
		if (i === undefined) {
			return this.getRuleContexts(DeclarationContext);
		} else {
			return this.getRuleContext(i, DeclarationContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return DeclarationParser.RULE_code; }
	// @Override
	public enterRule(listener: DeclarationListener): void {
		if (listener.enterCode) {
			listener.enterCode(this);
		}
	}
	// @Override
	public exitRule(listener: DeclarationListener): void {
		if (listener.exitCode) {
			listener.exitCode(this);
		}
	}
	// @Override
	public accept<Result>(visitor: DeclarationVisitor<Result>): Result {
		if (visitor.visitCode) {
			return visitor.visitCode(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class DeclarationContext extends ParserRuleContext {
	public SEMICOLON(): TerminalNode | undefined { return this.tryGetToken(DeclarationParser.SEMICOLON, 0); }
	public OPEN_BRACE(): TerminalNode | undefined { return this.tryGetToken(DeclarationParser.OPEN_BRACE, 0); }
	public code(): CodeContext | undefined {
		return this.tryGetRuleContext(0, CodeContext);
	}
	public CLOSING_BRACE(): TerminalNode | undefined { return this.tryGetToken(DeclarationParser.CLOSING_BRACE, 0); }
	public ANY(): TerminalNode[];
	public ANY(i: number): TerminalNode;
	public ANY(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(DeclarationParser.ANY);
		} else {
			return this.getToken(DeclarationParser.ANY, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return DeclarationParser.RULE_declaration; }
	// @Override
	public enterRule(listener: DeclarationListener): void {
		if (listener.enterDeclaration) {
			listener.enterDeclaration(this);
		}
	}
	// @Override
	public exitRule(listener: DeclarationListener): void {
		if (listener.exitDeclaration) {
			listener.exitDeclaration(this);
		}
	}
	// @Override
	public accept<Result>(visitor: DeclarationVisitor<Result>): Result {
		if (visitor.visitDeclaration) {
			return visitor.visitDeclaration(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


