import { expect } from 'chai';
import 'mocha';
import { BatchReferencesProvider, BatchElementPosition } from '../../lsp/BatchReferencesProvider';

describe('Find batch references', () => {

  it('Finds label references with a string containing same label name. Issue #4', async () => {
    const buffer = [
      ":home",
      "",
      "",
      "set str=\" home \"",
      "",
      "goto home",
      "",
    ];
    const expected: BatchElementPosition[] = [
      { line: 0, column: 1 },
      { line: 5, column: 5 },
    ]
    const result = await new BatchReferencesProvider().findReferences(buffer.join("\n"), 'home');
    assertReferences(expected, result);
  });

  it('Finds variable references within string containing multiple references of the same variable', async () => {
    const buffer = [
      "echo \"containing teste!myVar!%myVar%\"\n",
    ];
    const expected: BatchElementPosition[] = [
      { line: 0, column: 23 },
      { line: 0, column: 30 },
    ]
    const result = await new BatchReferencesProvider().findReferences(buffer.join("\n"), 'myVar');
    assertReferences(expected, result);
  });

  it('Finds command references with multiple references of the same command. Issue #17', async () => {
    const buffer = [
      "set variable=value",
      "rem some other code",
      "set another_variable=another_value"
    ];
    const expected: BatchElementPosition[] = [
      { line: 0, column: 0 },
      { line: 2, column: 0 },
    ]
    const result = await new BatchReferencesProvider().findReferences(buffer.join("\n"), 'set');
    assertReferences(expected, result);
  });

  it('Finds variable references within string containing same variable name', async () => {
    const buffer = [
      "set myVar=S",
      "",
      "echo \"this text containing myVar must be ignored\"",
      "echo %myVar%",
      "echo \"this text containing %myVar% must not be ignored\"",
      "echo \"this text containing teste!myVar!%myVar%%myVar%myVar must not be ignored either\"",
      "echo \"set myVar=ABC\"",
      "echo set myVar=ABC",
      "",
      "goto :eof",
      "",
    ];
    const expected: BatchElementPosition[] = [
      { line: 0, column: 4 },
      { line: 3, column: 6 },
      { line: 4, column: 28 },
      { line: 5, column: 33 },
      { line: 5, column: 40 },
      { line: 5, column: 47 },
      { line: 7, column: 9 },
    ]
    const result = await new BatchReferencesProvider().findReferences(buffer.join("\n"), 'myVar');
    assertReferences(expected, result);
  });


  it('Finds inexisting variable reference', async () => {
    const buffer = [
      "set myVar=S",
      "",
      "echo \"this text containing myVar must be ignored\"",
      "echo %myVar%",
      "echo \"this text containing %myVar% must not be ignored\"",
      "echo \"this text containing !myVar! must not be ignored either\"",
      "echo \"set myVar=ABC\"",
      "echo set myVar=ABC",
      "",
      "goto :eof",
      "",
    ];
    const expected: BatchElementPosition[] = [];
    const result = await new BatchReferencesProvider().findReferences(buffer.join("\n"), 'inexistentVar');
    assertReferences(expected, result);
  });
});

function assertReferences(expected: BatchElementPosition[], result: BatchElementPosition[]): void {
  expect(expected.length).to.equal(result.length);
  for (let i = 0; i < result.length; i++) {
    expect(expected[i].line).to.equal(result[i].line);
    expect(expected[i].column).to.equal(result[i].column);
  }
}
