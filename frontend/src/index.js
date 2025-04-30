/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly";
import { blocks } from "./core/blocks/json";
import { save, load } from "./core/serialization";
import { toolbox } from "./core/toolbox";
import { jsonGenerator } from "./core/generators/json";
import "./index.css";

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);

const sampleInput = `
pêche
pomme
poire
abricot
banane
fraise
kiwi
`.trim();

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById("generatedCode").firstChild;
const blocklyDiv = document.getElementById("blocklyDiv");
const ws = Blockly.inject(blocklyDiv, { toolbox });

// This function resets the code div and shows the
// generated code from the workspace.
const runCode = () => {
  const code = jsonGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;

  updateFilteredOutput();
};

function updateFilteredOutput() {
  const blocks = ws.getTopBlocks(true);
  let output = sampleInput.split("\n");

  blocks.forEach((block) => {
    output = simulateBlock(block, output);
  });
}
function updateOutput(updatedLines) {
  const outputDiv = document.getElementById("output");
  if (updatedLines != null) {
    outputDiv.innerHTML = updatedLines.join("<br>");
  } else {
    outputDiv.innerHTML = "";
  }
}
function showFileContent(filename) {
  const outputDiv = document.getElementById("output");
  const output = sampleInput.split("\n");
  const filenameDefined = document.getElementById("filename").innerHTML;
  if (filename == filenameDefined) {
    outputDiv.innerHTML = output.join("<br>");
    return output;
  } else {
    outputDiv.innerHTML = "";
    return null;
  }
}
const output = null;
function simulateBlock(block, lines) {
  if (block != null) {
    switch (block.type) {
      case "command_cat2": {
        console.log("command_cat2");
        const filename = block.getFieldValue("FILENAME");
        const result = showFileContent(filename);
        const next = block.getNextBlock();
        return next ? simulateBlock(next, result) : result;
      }

      case "command_pipe2":

      case "filter_grep2": {
        console.log("filter_grep");
        const pattern = block.getFieldValue("PATTERN");
        const opts = [];
        for (let i = 0; i < block.optionCount_; i++) {
          const optBlock = block.getInputTargetBlock("OPTIONS_SLOT" + i);
          if (!optBlock) continue;
          if (optBlock.type === "option_i") opts.push("i");
          if (optBlock.type === "option_v") opts.push("v");
        }

        const flags = opts.includes("i") ? "i" : "";
        const regex = new RegExp(pattern, flags);

        let result = lines || [];
        if (opts.includes("v")) {
          result = result.filter((line) => !regex.test(line));
        } else {
          result = result
            .filter((line) => regex.test(line))
            .map((line) =>
              line.replace(regex, (m) => `<span class="highlight">${m}</span>`)
            );
        }

        const next = block.getNextBlock();
        return next ? simulateBlock(next, result) : result;
      }

      default:
        return lines;
    }
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
