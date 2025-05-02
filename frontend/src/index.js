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
const blocklyDiv = document.getElementById("blocklyDiv");
const ws = Blockly.inject(blocklyDiv, { toolbox });

load(ws);

let programBlock = ws.getBlocksByType("program", false)[0];
if (!programBlock) {
  programBlock = ws.newBlock("program");
  programBlock.initSvg();
  programBlock.render();
  programBlock.moveBy(20, 20);
}
programBlock.setMovable(false);
programBlock.setDeletable(false);
programBlock.setEditable(false);
programBlock.contextMenu = false;

const logDiv = document.getElementById("executionLog");
function clearLog() {
  logDiv.innerHTML = "";
}
function appendLog(html) {
  logDiv.insertAdjacentHTML("beforeend", html);
  logDiv.scrollTop = logDiv.scrollHeight;
}

function showFileContent(filename) {
  const output = sampleInput.split("\n");
  const filenameDefined = document.getElementById("filename").innerHTML;
  if (filename === filenameDefined) {
    return output;
  } else {
    return null;
  }
}

function simulateBlock(block, lines) {
  if (block != null) {
    switch (block.type) {
      case "command_cat2": {
        console.log("command_cat2");
        const filename = block.getFieldValue("FILENAME");
        const result = showFileContent(filename);
        return result;
      }

      case "command_pipe2":
        const precedentResult = simulateBlock(block.getPreviousBlock(), lines);
        console.log("precedent result ,", precedentResult);
        const nextBlock = block.getNextBlock();
        const result =
          nextBlock != null && precedentResult != null
            ? simulateBlock(nextBlock, precedentResult)
            : null;
        console.log("result pipe ", result);
        return result;

      case "filter_grep2": {
        console.log("filter_grep");
        const previous = block.getPreviousBlock();
        if (!previous || previous.type !== "command_pipe2") {
          console.warn("grep must follow a pipe");
          return null;
        }
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
        return result;
      }

      default:
        return lines;
    }
  }
}

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});

async function runProgram(rootBlock) {
  console.log("run program");
  clearLog();

  let current = rootBlock.getNextBlock();
  console.log("current : ", rootBlock.getNextBlock());
  let lastResult = null;

  while (current) {
    console.log("while current", current.type);
    const snippet = jsonGenerator.blockToCode(current, false);
    const codeStr = Array.isArray(snippet) ? snippet[0] : snippet;
    console.log("previous type", current.getPreviousBlock.type);
    const prevType = current.getPreviousBlock()?.type;

    if (
      lastResult != null ||
      (prevType === "program" && current.type !== "command_pipe2")
    ) {
      lastResult = simulateBlock(current, lastResult);
    }
    console.log("last result", lastResult);
    appendLog(`
      <div style="margin-bottom:8px;">
        <strong>${current.type}</strong>: 
        <code>${codeStr}</code>
        &rarr; <em>${String(lastResult)}</em>
      </div>
    `);
    current = current.getNextBlock();
    current != null
      ? console.log("next block", current.type)
      : console.log("next block is null");
  }
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = lastResult ? lastResult.join("<br>") : "";
}

document
  .getElementById("runButton")
  .addEventListener("click", () => runProgram(programBlock));
