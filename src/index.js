/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {blocks} from './blocks/json';
import {save, load} from './serialization';
import { toolbox } from './toolbox';
import {jsonGenerator} from './generators/json';
import './index.css';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});

// This function resets the code div and shows the
// generated code from the workspace.
const runCode = () => {
  const code = jsonGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;
  
  updateFilteredOutput();
};
const sampleInput = `
pêche
pomme
poire
abricot
banane
fraise
kiwi
`.trim();

function updateFilteredOutput() {
  const blocks = ws.getTopBlocks(true);
  let output = sampleInput.split('\n');

  blocks.forEach(block => {
    output = simulateBlock(block, output);
  });

  const outputDiv = document.getElementById('filteredOutput');
  outputDiv.innerHTML = output.join('<br>');
}

function simulateBlock(block, lines) {
  switch (block.type) {
    case 'filter_grep':
      const pattern = block.getFieldValue('PATTERN');
      const option = block.getFieldValue('OPTION');

      // voir pour mieux gérer les options et les combiner
      let regexFlags = '';
      if (option.includes('-i')) {
        regexFlags += 'i';
      }
      
      const regex = new RegExp(pattern, regexFlags);

      if (option.includes('-v')) {
        return lines.filter(line => !regex.test(line));
      } else {
        return lines.filter(line => regex.test(line)).map(line => {
          return line.replace(regex, match => `<span class="highlight">${match}</span>`);
        });
      }

    default:
      return lines;
  }
}


// Load the initial state from storage and run the code.
load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});

// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (
    e.isUiEvent ||
    e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()
  ) {
    return;
  }
  runCode();
});
