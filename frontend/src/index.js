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
      case "command_cat":
        {
          console.log("command_cat");
          const filename = block.getFieldValue("FILENAME");
          return showFileContent(filename);
        }
        break;

      case "command_pipe": {
        console.log("command_pipe");
        const leftBlock = block.getInputTargetBlock("COMMAND2");
        const rightBlock = block.getInputTargetBlock("COMMAND1");

        if (leftBlock && rightBlock) {
          pipe(leftBlock, rightBlock, lines);
        }
        return lines;
      }

      case "filter_grep": {
        console.log("filter_grep");
        const inBlock = block.getInputTargetBlock("COMMAND_IN");
        // const inLines = simulateBlock(inBlock, lines);
        console.log("lines = ", lines);
        const pattern = block.getFieldValue("PATTERN");
        const option = block.getFieldValue("OPTION") || "";
        let flags = option.includes("-i") ? "i" : "";
        const regex = new RegExp(pattern, flags);

        // -v invert?
        if (option.includes("-v")) {
          if (lines != null) {
            console.log("there is something before");
            console.log(lines.filter((l) => !regex.test(l)));
            return lines.filter((l) => !regex.test(l));
          } else {
            console.log("lines est null");
          }
        }
        // normal match + highlight
        if (lines != null) {
          return lines
            .filter((l) => regex.test(l))
            .map((l) =>
              l.replace(regex, (m) => `<span class="highlight">${m}</span>`)
            );
        }
      }

      default:
        return lines;
    }
  }
}

function pipe(blockBefore, blockAfter, lines) {
  console.log("simulate the first");
  const linesFromFirstBlock = simulateBlock(blockBefore, lines);
  console.log(
    "now we do the simulate 2 with lines from cat",
    linesFromFirstBlock
  );
  const finalLines = simulateBlock(blockAfter, linesFromFirstBlock);
  updateOutput(finalLines);
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
