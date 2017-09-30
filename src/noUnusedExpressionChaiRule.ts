import * as ts from 'typescript';
import * as Lint from 'tslint';
import { getTokenAtPosition, isIdentifier } from 'tsutils';
import { Rule as BaseUnusedExpressionRule } from 'tslint/lib/rules/noUnusedExpressionRule';

/**
 * Predicate to determine given failure is chai's `expect` assertion.
 * It relies on naive assumptions based on chai assertion syntax.
 */
const chaiAssertionPredicate = (failure: Lint.RuleFailure, source: ts.SourceFile) => {
  const failurePosition = failure.getStartPosition();
  const token = getTokenAtPosition(source, failurePosition.getPosition())!;
  // check if the offending token is the `expect` in `expect(...)`
  return !isIdentifier(token) || token.text !== 'expect' || token.parent!.kind !== ts.SyntaxKind.CallExpression;
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