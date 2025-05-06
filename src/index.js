/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly";
import { blocks } from "./core/blocks/json";
import { save, load } from "./core/utils/serialization";
import { toolbox } from "./core/utils/toolbox";
import { jsonGenerator } from "./core/generators/json";
import { createHandlers } from "./core/handlers/handlers";
import "./index.css";
import emulator from "./vendor/bash-emulator-wrapper";

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);

function seedFileSystem() {
  const raw = document.getElementById("inputFile").textContent;
  emulator.state.fileSystem["/home/user/fruits.txt"] = {
    type: "file",
    modified: Date.now(),
    content: raw,
  };
}

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
  seedFileSystem();

  let current = rootBlock.getNextBlock();
  console.log("current : ", rootBlock.getNextBlock());
  let lastResult = null;

  while (current) {
    const currentBlockType = current.type;
    console.log("while current", currentBlockType);
    const snippet = jsonGenerator.blockToCode(current, false);
    const codeStr = Array.isArray(snippet) ? snippet[0] : snippet;
    console.log("previous type", current.getPreviousBlock.type);
    const prevType = current.getPreviousBlock()?.type;

    if (
      lastResult != null ||
      (prevType === "program" && current.type !== "command_pipe")
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
  const generatedCode = jsonGenerator.blockToCode(programBlock, false);
  document.getElementById("generatedCode").textContent = Array.isArray(
    generatedCode
  )
    ? generatedCode[0]
    : generatedCode;
  const commandStr = Array.isArray(generatedCode)
    ? generatedCode[0]
    : generatedCode;

  try {
    const output = await emulator.run(commandStr);
    console.log("résultat emulateur :", output);
    document.getElementById("output").textContent = output;
  } catch (err) {
    console.error("Erreur émulateur :", err);
  }
}

document
  .getElementById("runButton")
  .addEventListener("click", () => runProgram(programBlock));
