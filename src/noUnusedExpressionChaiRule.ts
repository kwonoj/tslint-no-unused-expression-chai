import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as tsutils from 'tsutils';
import {Rule as BaseUnusedExpressionRule} from 'tslint/lib/rules/noUnusedExpressionRule';

const OPTION_SHOULD: 'should' = 'should';

// START copied from noUnusedExpression.ts
const ALLOW_FAST_NULL_CHECKS = 'allow-fast-null-checks';
const ALLOW_NEW = 'allow-new';
const ALLOW_TAGGED_TEMPLATE = 'allow-tagged-template';

const TSLINT_META: Partial<Lint.IRuleMetadata> = {
  optionsDescription: Lint.Utils.dedent`
The following arguments may be optionally provided:

* \`${ALLOW_FAST_NULL_CHECKS}\` allows to use logical operators to perform fast null checks
  and perform method or function calls for side effects (e.g. \`e && e.preventDefault()\`).
* \`${ALLOW_NEW}\` allows 'new' expressions for side effects (e.g. \`new ModifyGlobalState();\`.
* \`${ALLOW_TAGGED_TEMPLATE}\` allows tagged templates for side effects
  (e.g. \`this.add\\\`foo\\\`;\`).
* \`${OPTION_SHOULD}\` supports chai assertions using \`should\` in addition to \`expect\`;\`.
`,
  options: {
    type: 'array',
    items: {
      type: 'string',
      enum: [ALLOW_FAST_NULL_CHECKS, ALLOW_NEW, ALLOW_TAGGED_TEMPLATE, OPTION_SHOULD]
    },
    minLength: 0,
    maxLength: 4
  },
  optionExamples: [
    true,
    [true, ALLOW_FAST_NULL_CHECKS],
    [true, OPTION_SHOULD],
    [true, ALLOW_FAST_NULL_CHECKS, OPTION_SHOULD]
  ]
};
// END copied from noUnusedExpression.ts

/**
 * Predicate to determine given failure is chai's `expect` assertion.
 * It relies on naive assumptions based on chai assertion syntax.
 */
const chaiAssertionPredicate = (failure: Lint.RuleFailure, source: ts.SourceFile) => {
  const failurePosition = failure.getStartPosition();
  const token = tsutils.getTokenAtPosition(source, failurePosition.getPosition());

  //for any reason locating token is not available, falls back to default rule
  if (!token) {
    return true;
  }

  //check very exact token is identifier, `expect`
  const isTokenIdentifier = tsutils.isIdentifier(token);
  if (!isTokenIdentifier) {
    return true;
  }

  const parentToken = token.parent;
  //same as token. located chai assertion should have parent token
  if (!parentToken) {
    return true;
  }
  //traverse up one parent, check it's call expression
  const isParentTokenCallExpression = tsutils.isCallExpression(parentToken);
  if (!isParentTokenCallExpression) {
    return true;
  }

  //finally compare actual token text to chai assertion, return false if given token is `expect`
  return token.getText() !== 'expect';
};

/**
 * Predicate to determine given failure is chai's `should` assertion.
 * It relies on naive assumptions based on chai assertion syntax.
 */
const withoutShouldAssertions = (failure: Lint.RuleFailure, source: ts.SourceFile) => {
  const failurePosition = failure.getStartPosition();
  const token = tsutils.getTokenAtPosition(source, failurePosition.getPosition());

  // for any reason locating token is not available, falls back to default rule
  if (!token) {
    return true;
  }

  let current: ts.Node | undefined = token;
  // scan through parents for a property access expression
  // stop when hitting expression statement
  while (current && !tsutils.isExpressionStatement(current)) {
    if (tsutils.isPropertyAccessExpression(current)) {
      if (current.name.text === 'should') {
        // make sure there is at least one more property access after should
        return current.parent && !tsutils.isPropertyAccessExpression(current.parent);
      }
    }
    current = current.parent;
  }

  return true;
};

/**
 * Implements no-unused-expression-chai rules
 * To honor base rule's behavior, it inherits from default no-unused-expression rule
 * and override specific failure only
 *
 */
export class Rule extends BaseUnusedExpressionRule {

  public static metadata = {...BaseUnusedExpressionRule.metadata, ...TSLINT_META};
  /**
   * Apply rules. Simply walk source by default rule first, and filter out chai expression
   *
   */
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const failures: Lint.RuleFailure[] = super.apply(sourceFile);
    if (failures && failures.length > 0) {
      const filterShould = this.ruleArguments.indexOf(OPTION_SHOULD) > -1;
      return failures.filter(x => {
        const expectResult = chaiAssertionPredicate(x, sourceFile);
        if (expectResult && filterShould) {
          return withoutShouldAssertions(x, sourceFile);
        }
        return expectResult;
      });
    }

    return failures;
  }
}
