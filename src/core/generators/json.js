import * as Blockly from 'blockly'

export const jsonGenerator = new Blockly.Generator('JSON')

jsonGenerator.ORDER_ATOMIC = 0
jsonGenerator.ORDER_NONE = 0

jsonGenerator.forBlock.command_cat = function (block) {
  const filename = block.getFieldValue('FILENAME')
  return `cat ${filename}`
}

jsonGenerator.forBlock.command_grep = function (block) {
  const pattern = block.getFieldValue('PATTERN')
  const opts = extractOptions(block)
  const optionString = opts.join(' ')
  return `grep ${optionString} ${pattern}`
}

jsonGenerator.forBlock.command_grep_filename = function (block) {
  const pattern = block.getFieldValue('PATTERN')
  const filename = block.getFieldValue('FILENAME')
  const opts = extractOptions(block)
  const optionString = opts.join(' ')
  return `grep ${optionString} ${pattern} ${filename}`
}

jsonGenerator.forBlock.command_sort = function (block) {
  const opts = extractOptions(block)
  const optionString = opts.join(' ')
  return `sort ${optionString}`
}

function extractOptions (block) {
  const optionsMap = {
    command_grep: ['option_v', 'option_i', 'option_n', 'option_c'],
    command_sort: ['option_k', 'option_r', 'option_u', 'option_n']
  }
  const optionFlagsMap = {
    option_i: '-i',
    option_v: '-v',
    option_n: '-n',
    option_c: '-c',
    option_k: '-k',
    option_r: '-r',
    option_u: '-u'
  }

  const opts = []
  let hasInvalid = false
  const validOptions = optionsMap[block.type] || []

  for (let i = 0; i < (block.optionCount_ || 0); i++) {
    const opt = block.getInputTargetBlock('OPTIONS_SLOT' + i)
    if (!opt) continue

    if (opt.type === 'option_k' && validOptions.includes('option_k')) {
      const col = opt.getFieldValue('COLUMN_INDEX')
      opts.push(`-k${col}`)
    } else if (validOptions.includes(opt.type)) {
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

jsonGenerator.forBlock.program = function (block) {
  let code = ''
  let child = block.getNextBlock()
  let previousBlockWasCommandBlock = false
  while (child) {
    const snippet = jsonGenerator.blockToCode(child, false)
    const currentBlockIsCommand = child.type.startsWith('command_')
    if (previousBlockWasCommandBlock && currentBlockIsCommand) {
      code += '| '
    }
    code += Array.isArray(snippet) ? snippet[0] : snippet
    code += ' '
    previousBlockWasCommandBlock = currentBlockIsCommand
    child = child.getNextBlock()
  }
  return code
}
