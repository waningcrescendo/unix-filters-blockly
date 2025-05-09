import * as Blockly from 'blockly'

export const jsonGenerator = new Blockly.Generator('JSON')

jsonGenerator.ORDER_ATOMIC = 0
jsonGenerator.ORDER_NONE = 0

// test avec les séquentiels
jsonGenerator.forBlock.command_cat = function (block) {
  const filename = block.getFieldValue('FILENAME')
  return `cat ${filename}`
}

jsonGenerator.forBlock.command_grep = function (block) {
  const pattern = block.getFieldValue('PATTERN')
  const opts = extractGrepOptions(block)
  const optionString = opts.join(' ')
  return `grep ${optionString} "${pattern}"`
}

jsonGenerator.forBlock.command_grep_filename = function (block) {
  const pattern = block.getFieldValue('PATTERN')
  const filename = block.getFieldValue('FILENAME')
  const opts = extractGrepOptions(block)
  const optionString = opts.join(' ')
  return `grep ${optionString} "${pattern}" ${filename}`
}

function extractGrepOptions (block) {
  const authorizedOptions = new Set(['option_i', 'option_v'])
  const optionFlagsMap = {
    option_i: '-i',
    option_v: '-v'
  }

  const opts = []
  let hasInvalid = false

  for (let i = 0; i < block.optionCount_; i++) {
    const opt = block.getInputTargetBlock('OPTIONS_SLOT' + i)
    if (!opt) continue

    if (authorizedOptions.has(opt.type)) {
      opts.push(optionFlagsMap[opt.type])
    } else {
      opts.push(`[INVALID:${opt.type}]`)
      hasInvalid = true
    }
  }

  block.setWarningText(
    hasInvalid
      ? 'One or more options are not valid in this command'
      : null
  )

  return opts
}

jsonGenerator.forBlock.command_pipe = function () {
  return '|'
}

jsonGenerator.forBlock.option_i = function () {
  return '-i'
}
jsonGenerator.forBlock.option_v = function () {
  return '-v'
}

jsonGenerator.forBlock.program = function (block) {
  let code = ''
  let child = block.getNextBlock()
  while (child) {
    const snippet = jsonGenerator.blockToCode(child, false)
    code += Array.isArray(snippet) ? snippet[0] : snippet
    code += ' '
    child = child.getNextBlock()
  }
  return code
}
