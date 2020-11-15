# @tupaia/expression-parser

## Usage
```
import { ExpressionParser } from @tupaia/expression-parser;

const expressionParser = new ExpressionParser();

//Set the scope variable 'a'
expressionParser.set('a', 1);

//Evaluate an expression that has 'a' as a variable
expressionParser.evaluate('a + 2'); //returns 3
```

## Limitation
Variable names cannot start with a number because mathjs parser will parse it as implicit multiplication (eg: 5abc -> 5 * abc).
