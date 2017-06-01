import * as ts from 'typescript';
import * as Lint from 'tslint';
import * as tsutils from 'tsutils';
import { Rule as BaseUnusedExpressionRule } from 'tslint/lib/rules/noUnusedExpressionRule';

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
 * Implements no-unused-expression-chai rules
 * To honor base rule's behavior, it inherits from default no-unused-expression rule
 * and override specific failure only
 *
 */
export class Rule extends BaseUnusedExpressionRule {
  /**
   * Apply rules. Simply walk source by default rule first, and filter out chai expression
   *
   */
  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const failures = super.apply(sourceFile);
    if (failures && failures.length > 0) {
      return failures.filter((x) => chaiAssertionPredicate(x, sourceFile));
    }

    return failures;
  }
}