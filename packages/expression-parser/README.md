# @tupaia/expression-parser
This package wraps around mathjs package, used for evaluating expressions.
Read more about mathjs: https://mathjs.org/docs/expressions/syntax.html

## Usage
Evaluating an arithmetic expression:

```
import { ExpressionParser } from @tupaia/expression-parser;

const expressionParser = new ExpressionParser();

//Set the scope variable 'a'
expressionParser.set('a', 1);

//Evaluate an expression that has 'a' as a variable
expressionParser.evaluate('a + 2'); //returns 3
```

Evaluating a boolean expression:

```
import { BooleanExpressionParser } from @tupaia/expression-parser;

const expressionParser = new BooleanExpressionParser();

//Set the scope variable 'a'
expressionParser.set('a', 1);

//Evaluate an expression that has 'a' as a variable
expressionParser.evaluate('a < 2'); //returns true
expressionParser.evaluate('a > 2'); //returns false
```

## Limitation
Variable names cannot start with a number because mathjs parser will parse it as implicit multiplication (eg: 5abc -> 5 * abc).
