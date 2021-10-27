grammar Declaration;

code: declaration*;
declaration: ANY* (SEMICOLON | OPEN_BRACE code CLOSING_BRACE);

SEMICOLON: [;];
OPEN_BRACE: [{];
CLOSING_BRACE: [}];
WS: [ \t\r\n\f\b] -> skip;
ANY: ~[ \t\r\n\f\b;{}]+;
