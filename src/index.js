/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly'
import { blocks } from './core/blocks/json'
import { save, load } from './core/utils/serialization'
import { toolbox } from './core/utils/toolbox'
import { jsonGenerator } from './core/generators/json'
import './index.css'
import bashEmulator from 'bash-emulator'

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks)

const outputDiv = document.getElementById('output')
const div = document.getElementById('executionLog')
const errorDiv = document.getElementById('error')
// utils functions
async function seedFileSystem (emulator) {
  const raw = document.getElementById('inputFile').textContent.trim()

  try {
    await emulator.write('/home/user/fruits.txt', raw)
    console.log('File written successfully')
  } catch (err) {
    console.error('Error writing file:', err)
  }
}

function clearDivs () {
  console.log('clear div')
  div.innerHTML = ''
  outputDiv.innerHTML = ''
  errorDiv.innerHTML = ''
}
// Set up UI elements and inject Blockly
const blocklyDiv = document.getElementById('blocklyDiv')
const ws = Blockly.inject(blocklyDiv, { toolbox })
load(ws)

let programBlock = ws.getBlocksByType('program', false)[0]
if (!programBlock) {
  programBlock = ws.newBlock('program')
  programBlock.initSvg()
  programBlock.render()
  programBlock.moveBy(20, 20)
}
programBlock.setMovable(false)
programBlock.setDeletable(false)
programBlock.setEditable(false)
programBlock.contextMenu = false

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return
  save(ws)
})

async function runProgram (rootBlock) {
  console.log('run program')
  clearDivs()

  // right now the state isn't saved because we don't need it
  // as it's blockly, but when using a typing interface we'll
  // need to create one emulator per exercise
  const emulator = bashEmulator({
    user: 'user',
    workingDirectory: '/home/user',
    fileSystem: {
      '/home/user': { type: 'dir', modified: Date.now() }
    },
    history: []
  })

  await seedFileSystem(emulator)

  let current = rootBlock.getNextBlock()

  while (current) {
    current = current.getNextBlock()
    current != null
      ? console.log('next block', current.type)
      : console.log('next block is null')
  }
  const generatedCode = jsonGenerator.blockToCode(programBlock, false)
  document.getElementById('generatedCode').textContent = Array.isArray(
    generatedCode
  )
    ? generatedCode[0]
    : generatedCode

  const commandStr = Array.isArray(generatedCode)
    ? generatedCode[0]
    : generatedCode

  try {
    console.log('running ', commandStr)
    const output = await emulator.run(commandStr)
    outputDiv.textContent = output
  } catch (err) {
    errorDiv.innerHTML = err
    console.error('error émulateur :', err)
  }
}

document
  .getElementById('runButton')
  .addEventListener('click', () => runProgram(programBlock))
