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
import { createHandlers } from "./core/handlers";
import "./index.css";

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);

// Set up UI elements and inject Blockly
const blocklyDiv = document.getElementById("blocklyDiv");
const ws = Blockly.inject(blocklyDiv, { toolbox });
const handlers = createHandlers((block, lines) => simulateBlock(block, lines));
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

function simulateBlock(block, lines) {
  if (block != null) {
    const handler = handlers[block.type];
    if (!handler) {
      return lines;
    }
    return handler(block, lines);
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
    current = current.getNextBlock();
    current != null
      ? console.log("next block", current.type)
      : console.log("next block is null");
  }
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = lastResult ? lastResult.join("<br>") : "";
  const generatedCode = jsonGenerator.blockToCode(programBlock, false);
  document.getElementById("generatedCode").textContent = Array.isArray(
    generatedCode
  )
    ? generatedCode[0]
    : generatedCode;
}

document
  .getElementById("runButton")
  .addEventListener("click", () => runProgram(programBlock));
