[![Build Status](https://travis-ci.org/kwonoj/tslint-no-unused-expression-chai.svg?branch=master)](https://travis-ci.org/kwonoj/tslint-no-unused-expression-chai)
[![npm](https://img.shields.io/npm/v/tslint-no-unused-expression-chai.svg)](https://www.npmjs.com/package/tslint-no-unused-expression-chai)

# tslint-no-unused-expression-chai

From tslint 5, lint applies `no-unused-expression` more strictly. This affects
test assertion written via [`chai`](http://chaijs.com/), as its `expect` assertion is form of expression caught by lint. `tslint-no-unused-expression-chai` provides drop-in replacement of rule `no-unused-expression` to loosen lint checker for chai's assertion.

This module supports chai's `expect` based assertion (i.e `expect(x).to.be....`).
When adding `"should"` to the rule configuration, it also supports those assertios.
Other type of property based assertion still may not work.

# Install

This has a peer dependencies of `tslint@5.*.*` and implicit dependency of `typescript`, which will have to be installed as well

```sh
npm install --save-dev tslint-no-unused-expression-chai
```

# Usage

You can configure tslint rules by replacing existing `no-unused-expression` rule.

```js
"rules": {
  //accepts all options of https://palantir.github.io/tslint/rules/no-unused-expression/
  "no-unused-expression-chai": true
  ...
},
"rulesDirectory": [
  "tslint-no-unused-expression-chai"
  ...
]
```

Alternatively you can just extend the configuration preset provided by this package. It disables `no-unused-expression` and enables `no-unused-expression-chai`.

```js
"extends": [
  ...
  "tslint-no-unused-expression-chai"
]
```

# Building / Testing

Few npm scripts are supported for build / test code. As this rule is simple override to default rules, it doesn't have own unit test coverage but borrows test fixture from [original rule](https://github.com/palantir/tslint/tree/master/test/rules/no-unused-expression).

- `build`: Transpiles code to ES5 commonjs to `rules`.
- `test`: Run tests.
- `lint`: Run lint over all codebases
- `lint:staged`: Run lint only for staged changes. This'll be executed automatically with precommit hook.
- `commit`: Commit wizard to write commit message