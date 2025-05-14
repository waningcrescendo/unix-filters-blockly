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
import json from '../ex1.json'
import { createApp } from 'vue'
import App from './App.vue'

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks)

const maxBlocks = json.maxBlocks
const jsonFileContent = json.fileContent
const jsonFilename = json.filename
const outputDiv = document.getElementById('output')
const div = document.getElementById('executionLog')
const errorDiv = document.getElementById('error')

toolbox.contents = json.toolbox
const app = createApp(App, { message: json.title, guideline: json.guideline, filename: jsonFilename, fileContent: jsonFileContent })
app.mount('#app')

// utils functions
async function seedFileSystem (emulator) {
  document.getElementById('fileContent').innerText = jsonFileContent

  try {
    await emulator.write(`/home/user/${jsonFilename}`, jsonFileContent)
    console.log('File written successfully')
  } catch (err) {
    console.error('Error writing file:', err)
  }
}

function clearDivs () {
  div.innerHTML = ''
  outputDiv.innerHTML = ''
  errorDiv.innerHTML = ''
}

// Set up UI elements and inject Blockly
const blocklyDiv = document.getElementById('blocklyDiv')
// inject toolbox associated with exercise
const ws = Blockly.inject(blocklyDiv, { toolbox, maxBlocks })
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
    console.log('output', output)
    console.log('expected result', json.expectedResult)

    if (output == json.expectedResult) {
      console.log('you passed!!!')
    } else {
      console.log('you failed...')
    }
  } catch (err) {
    errorDiv.innerHTML = err
    console.error('error émulateur :', err)
    console.log('you failed...')
  }
}

document
  .getElementById('runButton')
  .addEventListener('click', () => runProgram(programBlock))
