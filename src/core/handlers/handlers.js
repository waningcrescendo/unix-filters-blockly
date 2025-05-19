import { showFileContent } from '../utils/utils'

export function createHandlers (simulateBlock) {
  return {
    command_cat: (block, _) => {
      const filename = block.getFieldValue('FILENAME')
      // simulate the case where cat is used at the end of a line ?
      return showFileContent(filename)
    },

    command_grep: (block, lines) => {
      console.log('filter_grep')
      const pattern = block.getFieldValue('PATTERN')
      const opts = []
      for (let i = 0; i < block.optionCount_; i++) {
        const optBlock = block.getInputTargetBlock('OPTIONS_SLOT' + i)
        if (!optBlock) continue
        if (optBlock.type === 'option_i') opts.push('i')
        if (optBlock.type === 'option_v') opts.push('v')
      }

      const flags = opts.includes('i') ? 'i' : ''
      const regex = new RegExp(pattern, flags)

      let result = lines || []
      if (opts.includes('v')) {
        result = result.filter((line) => !regex.test(line))
      } else {
        result = result.filter((line) => regex.test(line))
      }
      console.log('result grep ', result)
      return result
    },

    command_grep_filename: (block, _) => {
      console.log('filter_grep with filename')

      const filename = block.getFieldValue('FILENAME')
      const input = showFileContent(filename)

      const pattern = block.getFieldValue('PATTERN')
      const opts = []
      for (let i = 0; i < block.optionCount_; i++) {
        const optBlock = block.getInputTargetBlock('OPTIONS_SLOT' + i)
        if (!optBlock) continue
        if (optBlock.type === 'option_i') opts.push('i')
        if (optBlock.type === 'option_v') opts.push('v')
      }

      const flags = opts.includes('i') ? 'i' : ''
      const regex = new RegExp(pattern, flags)

      let result = input || []
      if (opts.includes('v')) {
        result = result.filter((line) => !regex.test(line))
      } else {
        result = result.filter((line) => regex.test(line))
      }
      console.log('result grep ', result)
      return result
    }
  }
}
