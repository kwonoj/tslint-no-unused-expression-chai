import * as shell from 'shelljs';
import * as fs from 'fs';
import * as path from 'path';

//As custom rule overrides base rules, test verifies over
//tslint's test fixtures with chai assertion.
//This runner will iterate current test fixture directory and
//will run `tslint --test` against each fixtures.

//original fixture at
//https://github.com/palantir/tslint/tree/07eb8daf25c5631ca300ae48875d7e509f92cbb8/test/rules/no-unused-expression

const testDirectories = fs.readdirSync(__dirname)
  .map((directory) => path.resolve(__dirname, directory))
  .filter((p) => fs.lstatSync(p).isDirectory());

testDirectories
  .map((directory) => shell.exec(`tslint --test ${directory}`))
  .forEach((result) => {
    if (result.code !== 0) {
      process.exit(result.code);
    }
  });