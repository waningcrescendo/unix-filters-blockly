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

// const exerciseStatus = {
//   exo1: false,
//   exo2: false,
//   exo3: false
// }
let workspace = null
let programBlock = null
let outputDiv, errorDiv, executionDiv, generatedCodeDiv
let currentExerciseId = null
let currentEmulator = null
const exercises = {}
const $ = (id) => document.getElementById(id)

document.addEventListener('DOMContentLoaded', () => {
  // $('homeTab').classList.add('active')
  // updateExerciseListView()

  // $('homeView').style.display = 'block'
  // $('blocklyDiv').style.display = 'none'
  // $('contentTitle').style.display = 'none'
  // $('resultTitle').style.display = 'none'
  // $('generatedCode').style.display = 'none'
  // $('exerciseTitle').style.display = 'none'
  // $('exerciseGuideline').style.display = 'none'
  // $('runButton').style.display = 'none'
  // $('executionLog').style.display = 'none'
  // $('filenameContainer').style.display = 'none'
  // $('fileContentContainer').style.display = 'none'
  // $('error').style.display = 'none'
  // $('output').style.display = 'none'

  outputDiv = $('output')
  errorDiv = $('error')
  executionDiv = $('executionLog')
  generatedCodeDiv = $('generatedCode')

  $('runButton').addEventListener('click', () => runProgram(programBlock))

  // $('homeTab').addEventListener('click', () => {
  //   document.querySelectorAll('#loadExo1, #loadExo2, #loadExo3, #homeTab').forEach(btn => {
  //     btn.classList.remove('active')
  //   })
  //   $('homeTab').classList.add('active')

  //   $('homeView').style.display = 'block'
  //   $('contentTitle').style.display = 'none'
  //   $('resultTitle').style.display = 'none'
  //   $('blocklyDiv').style.display = 'none'
  //   $('generatedCode').style.display = 'none'
  //   $('exerciseTitle').style.display = 'none'
  //   $('exerciseGuideline').style.display = 'none'
  //   $('runButton').style.display = 'none'
  //   $('executionLog').style.display = 'none'
  //   $('filenameContainer').style.display = 'none'
  //   $('fileContentContainer').style.display = 'none'
  //   $('error').style.display = 'none'
  //   $('output').style.display = 'none'
  // })

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

export async function switchExercise (configPath, exerciseId, buttonElement) {
  // $('homeView').style.display = 'none'
  // $('contentTitle').style.display = 'block'
  // $('resultTitle').style.display = 'block'
  // $('blocklyDiv').style.display = 'block'
  // $('generatedCode').style.display = 'block'
  // $('exerciseTitle').style.display = 'block'
  // $('exerciseGuideline').style.display = 'block'
  // $('runButton').style.display = 'inline-block'
  // $('executionLog').style.display = 'block'
  // $('filenameContainer').style.display = 'block'
  // $('fileContentContainer').style.display = 'block'
  // $('error').style.display = 'block'
  // $('output').style.display = 'block'

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

    $('exerciseTitle').innerText = exo.title || ''
    $('exerciseGuideline').innerText = exo.guideline || ''
    $('filename').innerText = exo.filename || ''
    $('inputFile').innerText = exo.fileContent || ''
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

      $('exerciseTitle').innerText = data.title || ''
      $('exerciseGuideline').innerText = data.guideline || ''
      $('filename').innerText = data.filename || ''
      $('inputFile').innerText = fileContent || ''
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

  $('runButton').onclick = () => runProgram(programBlock)
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
        // exerciseStatus[currentExerciseId] = true
        // updateExerciseListView()
      } else {
        errorDiv.textContent += 'Essaye encore...'
      }
    }
  } catch (err) {
    errorDiv.innerHTML = err
  }
}

// function updateExerciseListView () {
//   const exerciseList = $('exerciseList')
//   exerciseList.innerHTML = ''

//   const exerciseNames = {
//     exo1: 'Exercice 1',
//     exo2: 'Exercice 2',
//     exo3: 'Exercice 3'
//   }

//   Object.keys(exerciseNames).forEach((exoId) => {
//     const li = document.createElement('li')
//     li.textContent = `${exerciseNames[exoId]} - ${exerciseStatus[exoId] ? '✅ Réussi' : '❌ À faire'}`
//     exerciseList.appendChild(li)
//   })
// }
