/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as Blockly from 'blockly'
import { blocks } from '../core/blocks/json'
import { save } from '../core/utils/serialization'
import { jsonGenerator } from '../core/generators/json'
import bashEmulator from 'bash-emulator'

Blockly.common.defineBlocks(blocks)

const state = {
  workspace: null,
  programBlock: null,
  emulator: null,
  exercises: {},
  currentExerciseId: null
}
const $ = (id) => document.getElementById(id)
let outputDiv, errorDiv, generatedCodeDiv

function clearDivs () {
  ['generatedCode', 'executionLog', 'output', 'error'].forEach(id => {
    const el = $(id)
    if (el) el.innerHTML = ''
  })
}

function setActiveButton (button) {
  document.querySelectorAll('#loadExo1, #loadExo2,#loadExo3').forEach(btn => btn.classList.remove('active'))
  button.classList.add('active')
}

async function loadExerciseConfig (configPath) {
  const response = await fetch(configPath)
  if (!response.ok) throw new Error(`config missing : ${configPath}`)
  return response.json()
}

async function loadFile (path) {
  console.log('loadFile', path)
  const fileResponse = await fetch(path)
  if (!fileResponse.ok) throw new Error(`missing file: ${path}`)
  return fileResponse.text()
}

async function createEmulatorWithFile (filename, fileContent) {
  const emulator = bashEmulator({
    user: 'user',
    workingDirectory: '/home/user',
    fileSystem: {
      '/home': { type: 'dir', modified: Date.now() },
      '/home/user': { type: 'dir', modified: Date.now() }
    },
    history: []
  })

  await emulator.write(`${filename}`, fileContent.trim())
  return emulator
}

function initWorkspace (toolbox, maxBlocks, xml) {
  if (state.workspace) {
    state.workspace.dispose()
    state.workspace = null
  }
  state.workspace = Blockly.inject(document.getElementById('blocklyDiv'), {
    toolbox: { kind: 'flyoutToolbox', contents: toolbox },
    maxBlocks
  })

  if (xml) {
    Blockly.Xml.domToWorkspace(xml, state.workspace)
  } else {
    createProgramBlock()
  }
  state.programBlock = state.workspace.getBlocksByType('program', false)[0]
  if (!state.programBlock) {
    createProgramBlock()
  }

  state.programBlock.setMovable(false)
  state.programBlock.setDeletable(false)
  state.programBlock.setEditable(false)
  state.programBlock.contextMenu = false

  state.workspace.addChangeListener(e => {
    if (!e.isUiEvent) {
      if (state.exercises[state.currentExerciseId]) {
        state.exercises[state.currentExerciseId].xml = Blockly.Xml.workspaceToDom(state.workspace)
      }
      save(state.workspace)
    }
  })
}

export async function switchExercise (configPath, exerciseId, buttonElement) {
  clearDivs()
  setActiveButton(buttonElement)
  if (state.currentExerciseId && state.exercises[state.currentExerciseId]) {
    if (state.workspace) {
      state.exercises[state.currentExerciseId].xml = Blockly.Xml.workspaceToDom(state.workspace)
      if (state.currentEmulator && state.currentEmulator.getState) {
        state.exercises[state.currentExerciseId].emulatorState = state.currentEmulator.getState()
      }
    }
  }

  state.currentExerciseId = exerciseId

  if (state.exercises[exerciseId]) {
    const exo = state.exercises[exerciseId]
    initWorkspace(exo.toolbox, exo.maxBlocks, exo.xml)
    state.currentEmulator = exo.emulator
    if (exo.emulatorState && state.currentEmulator.setState) {
      state.currentEmulator.setState(exo.emulatorState)
    }

    $('exerciseTitle').innerText = exo.title || ''
    $('exerciseGuideline').innerText = exo.guideline || ''
    $('filename').innerText = exo.filename || ''
    $('inputFile').innerText = exo.fileContent || ''
  } else {
    try {
      const data = await loadExerciseConfig(configPath)
      const fileContent = await loadFile(`/exercises/ex0${data.exerciseNumber}/${data.filename}`)
      const expectedFileContent = await loadFile(`/exercises/ex0${data.exerciseNumber}/${data.expectedResult}`)
      state.emulator = await createEmulatorWithFile(data.filename, fileContent)

      initWorkspace(data.toolbox, data.maxBlocks, null)

      state.exercises[exerciseId] = {
        configPath,
        title: data.title,
        guideline: data.guideline,
        filename: data.filename,
        toolbox: data.toolbox,
        maxBlocks: data.maxBlocks,
        fileContent,
        expectedResult: expectedFileContent,
        xml: Blockly.Xml.workspaceToDom(state.workspace),
        emulator: state.emulator,
        emulatorState: null
      }

      $('exerciseTitle').innerText = data.title || ''
      $('exerciseGuideline').innerText = data.guideline || ''
      $('filename').innerText = data.filename || ''
      $('inputFile').innerText = fileContent || ''
    } catch (err) {
      console.error('error loading exercise:', err)
    }
  }

  $('runButton').onclick = () => runProgram(state.programBlock)
}

function createProgramBlock () {
  if (!state.workspace) return
  state.programBlock = state.workspace.newBlock('program')
  state.programBlock.initSvg()
  state.programBlock.render()
  state.programBlock.moveBy(20, 20)
}

export async function runProgram (rootBlock) {
  clearDivs()

  const generatedCodeFromBlock = jsonGenerator.blockToCode(rootBlock, false)
  generatedCodeDiv.textContent =
    '$ ' + (Array.isArray(generatedCodeFromBlock) ? generatedCodeFromBlock[0] : generatedCodeFromBlock)

  const commandStr = Array.isArray(generatedCodeFromBlock)
    ? generatedCodeFromBlock[0]
    : generatedCodeFromBlock

  try {
    const output = await state.emulator.run(commandStr)
    outputDiv.textContent = output

    const expected = state.exercises[state.currentExerciseId]?.expectedResult
    console.log('expected', expected)
    console.log('output', output)
    if (expected !== undefined) {
      if (output.trim() === expected.trim()) {
        errorDiv.textContent += 'Exercice réussi !'
      } else {
        errorDiv.textContent += 'Essaye encore...'
      }
    }
  } catch (err) {
    errorDiv.innerHTML = err
  }
}

document.addEventListener('DOMContentLoaded', () => {
  outputDiv = $('output')
  errorDiv = $('error')
  generatedCodeDiv = $('generatedCode')

  $('runButton').addEventListener('click', () => runProgram(state.programBlock))

  $('loadExo1').addEventListener('click', () => {
    switchExercise('/exercises/ex01/config.json', 'exo1', $('loadExo1'))
  })

  $('loadExo2').addEventListener('click', () => {
    switchExercise('/exercises/ex02/config.json', 'exo2', $('loadExo2'))
  })

  $('loadExo3').addEventListener('click', () => {
    switchExercise('/exercises/ex03/config.json', 'exo3', $('loadExo3'))
  })
})
