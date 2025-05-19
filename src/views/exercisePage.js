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

let workspace = null
let programBlock = null
let outputDiv, errorDiv, executionDiv, generatedCodeDiv
let currentExerciseId = null
let currentEmulator = null
const exercises = {}

document.addEventListener('DOMContentLoaded', () => {
  outputDiv = document.getElementById('output')
  errorDiv = document.getElementById('error')
  executionDiv = document.getElementById('executionLog')
  generatedCodeDiv = document.getElementById('generatedCode')

  document.getElementById('runButton').addEventListener('click', () => runProgram(programBlock))

  document.getElementById('loadExo1').addEventListener('click', () => {
    switchExercise('/exercises/ex01/config.json', 'exo1', document.getElementById('loadExo1'))
  })

  document.getElementById('loadExo2').addEventListener('click', () => {
    switchExercise('/exercises/ex02/config.json', 'exo2', document.getElementById('loadExo2'))
  })

  document.getElementById('loadExo3').addEventListener('click', () => {
    switchExercise('/exercises/ex03/config.json', 'exo3', document.getElementById('loadExo3'))
  })
})

export async function switchExercise (configPath, exerciseId, buttonElement) {
  clearDivs()
  document.querySelectorAll('#loadExo1, #loadExo2,#loadExo3').forEach(btn => btn.classList.remove('active'))
  buttonElement.classList.add('active')

  if (currentExerciseId && exercises[currentExerciseId]) {
    if (workspace) {
      exercises[currentExerciseId].xml = Blockly.Xml.workspaceToDom(workspace)
      if (currentEmulator && currentEmulator.getState) {
        exercises[currentExerciseId].emulatorState = currentEmulator.getState()
      }
    }
  }

  currentExerciseId = exerciseId

  if (exercises[exerciseId]) {
    if (workspace) {
      workspace.dispose()
      workspace = null
    }

    const exo = exercises[exerciseId]

    workspace = Blockly.inject(document.getElementById('blocklyDiv'), {
      toolbox: { kind: 'flyoutToolbox', contents: exo.toolbox },
      maxBlocks: exo.maxBlocks
    })

    if (exo.xml) {
      Blockly.Xml.domToWorkspace(exo.xml, workspace)
    } else {
      createProgramBlock()
    }

    currentEmulator = exo.emulator
    if (exo.emulatorState && currentEmulator.setState) {
      currentEmulator.setState(exo.emulatorState)
    }

    document.getElementById('exerciseTitle').innerText = exo.title || ''
    document.getElementById('exerciseGuideline').innerText = exo.guideline || ''
    document.getElementById('filename').innerText = exo.filename || ''
    document.getElementById('inputFile').innerText = exo.fileContent || ''
  } else {
    try {
      const response = await fetch(configPath)
      if (!response.ok) throw new Error(`config missing : ${configPath}`)
      const data = await response.json()

      const exerciseNumber = data.exerciseNumber
      const filePathInputFile = `/exercises/ex0${exerciseNumber}/${data.filename}`
      const fileResponse = await fetch(filePathInputFile)
      if (!fileResponse.ok) throw new Error(`missing file: ${filePathInputFile}`)
      const fileContent = await fileResponse.text()

      const filePathExpectedResult = `/exercises/ex0${exerciseNumber}/${data.expectedResult}`
      const fileResponseExpected = await fetch(filePathExpectedResult)
      if (!fileResponseExpected.ok) throw new Error(`missing file: ${filePathExpectedResult}`)
      const expectedFileContent = await fileResponseExpected.text()

      currentEmulator = bashEmulator({
        user: 'user',
        workingDirectory: '/home/user',
        fileSystem: {
          '/home': { type: 'dir', modified: Date.now() },
          '/home/user': { type: 'dir', modified: Date.now() }
        },
        history: []
      })

      await seedFileSystem(currentEmulator, data.filename, fileContent)

      if (workspace) {
        workspace.dispose()
        workspace = null
      }

      workspace = Blockly.inject(document.getElementById('blocklyDiv'), {
        toolbox: { kind: 'flyoutToolbox', contents: data.toolbox },
        maxBlocks: data.maxBlocks
      })

      createProgramBlock()

      exercises[exerciseId] = {
        configPath,
        title: data.title,
        guideline: data.guideline,
        filename: data.filename,
        toolbox: data.toolbox,
        maxBlocks: data.maxBlocks,
        fileContent,
        expectedResult: expectedFileContent,
        xml: Blockly.Xml.workspaceToDom(workspace),
        emulator: currentEmulator,
        emulatorState: null
      }

      document.getElementById('exerciseTitle').innerText = data.title || ''
      document.getElementById('exerciseGuideline').innerText = data.guideline || ''
      document.getElementById('filename').innerText = data.filename || ''
      document.getElementById('inputFile').innerText = fileContent || ''
    } catch (err) {
      console.error('error loading exercise:', err)
    }
  }

  programBlock = workspace.getBlocksByType('program', false)[0]
  if (!programBlock) {
    createProgramBlock()
  }

  programBlock.setMovable(false)
  programBlock.setDeletable(false)
  programBlock.setEditable(false)
  programBlock.contextMenu = false

  workspace.addChangeListener(e => {
    if (!e.isUiEvent) {
      if (exercises[currentExerciseId]) {
        exercises[currentExerciseId].xml = Blockly.Xml.workspaceToDom(workspace)
      }
      save(workspace)
    }
  })

  document.getElementById('runButton').onclick = () => runProgram(programBlock)
}

function createProgramBlock () {
  if (!workspace) return
  programBlock = workspace.newBlock('program')
  programBlock.initSvg()
  programBlock.render()
  programBlock.moveBy(20, 20)
}

async function seedFileSystem (emulator, filename, content) {
  try {
    await emulator.write(`/home/user/${filename}`, content.trim())
  } catch (err) {
    console.error('error writing file:', err)
  }
}

function clearDivs () {
  if (generatedCodeDiv) generatedCodeDiv.innerHTML = ''
  if (executionDiv) executionDiv.innerHTML = ''
  if (outputDiv) outputDiv.innerHTML = ''
  if (errorDiv) errorDiv.innerHTML = ''
}

export async function runProgram (rootBlock) {
  clearDivs()

  let emulator = currentEmulator

  if (!emulator) {
    emulator = bashEmulator({
      user: 'user',
      workingDirectory: '/home/user',
      fileSystem: {
        '/home': { type: 'dir', modified: Date.now() },
        '/home/user': { type: 'dir', modified: Date.now() }
      },
      history: []
    })
  }

  const generatedCodeFromBlock = jsonGenerator.blockToCode(rootBlock, false)
  generatedCodeDiv.textContent =
    '$ ' + (Array.isArray(generatedCodeFromBlock) ? generatedCodeFromBlock[0] : generatedCodeFromBlock)

  const commandStr = Array.isArray(generatedCodeFromBlock)
    ? generatedCodeFromBlock[0]
    : generatedCodeFromBlock

  try {
    const output = await emulator.run(commandStr)
    outputDiv.textContent = output

    const expected = exercises[currentExerciseId]?.expectedResult
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
