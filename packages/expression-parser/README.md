# @tupaia/expression-parser

This package exposes a wrapper around the [Math.js](https://mathjs.org) package, used for evaluating expressions.

Read more about Math.js: https://mathjs.org/docs/expressions/syntax.html

## Usage

> [!TIP]
> Creating a new `ExpressionParser` instance is relatively expensive (15–40 ms), so we suggest using a singleton pattern where possible.

Evaluating an arithmetic expression:

```js
import { ExpressionParser } from @tupaia/expression-parser;

const expressionParser = new ExpressionParser();

// Set the scope variable `a`
expressionParser.set('a', 1);

// Evaluate an expression that has `a` as a variable
expressionParser.evaluate('a + 2');  // returns 3
```

Evaluating a boolean expression:

```js
import { BooleanExpressionParser } from @tupaia/expression-parser;

const expressionParser = new BooleanExpressionParser();

// Set the scope variable `a`
expressionParser.set('a', 1);

// Evaluate an expression that has `a` as a variable
expressionParser.evaluate('a < 2');  // returns true
expressionParser.evaluate('a > 2');  // returns false
```

## Limitations

> [!WARNING]
> Variable names cannot start with a number because the Math.js parser will parse it as implicit multiplication. For example, `5abc` ≡ `5 * abc`.
