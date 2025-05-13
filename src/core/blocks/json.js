import * as Blockly from 'blockly'
import './grep_mutator.js'
import './sort_mutator.js'

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    type: 'program',
    tooltip: '',
    helpUrl: '',
    message0: 'Programme %1',
    args0: [
      {
        type: 'input_dummy',
        name: 'NAME'
      }
    ],
    nextStatement: null,
    colour: 130
  },
  {
    type: 'command_pipe',
    helpUrl: 'https://fr.wikipedia.org/wiki/Tube_(shell)',
    message0: '|',
    previousStatement: null,
    nextStatement: null,
    colour: 200
  },
  {
    type: 'command_cat',
    tooltip: '',
    helpUrl: 'https://fr.wikipedia.org/wiki/Cat_(Unix)',
    message0: '%1 %2 %3',
    args0: [
      {
        type: 'field_label_serializable',
        text: 'cat',
        name: ''
      },
      {
        type: 'field_input',
        name: 'FILENAME',
        text: 'filename'
      },
      {
        type: 'input_dummy',
        name: 'NAME',
        align: 'CENTRE'
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 250
  },
  {
    type: 'command_grep',
    message0: 'grep %1',
    args0: [
      {
        type: 'field_input',
        name: 'PATTERN',
        text: 'pattern'
      }
    ],
    previousStatement: null,
    nextStatement: null,
    mutator: 'grep_mutator',
    colour: 285,
    tooltip: ''
  },
  {
    type: 'command_grep_filename',
    message0: 'grep %1 %2',
    args0: [
      {
        type: 'field_input',
        name: 'PATTERN',
        text: 'pattern'
      },
      {
        type: 'field_input',
        name: 'FILENAME',
        text: 'filename'
      }
    ],
    previousStatement: null,
    nextStatement: null,
    mutator: 'grep_mutator',
    colour: 285,
    tooltip: ''
  },
  {
    type: 'command_sort',
    tooltip: '',
    helpUrl: '',
    message0: 'sort %1',
    args0: [
      {
        type: 'input_dummy',
        name: 'NAME'
      }
    ],
    previousStatement: null,
    nextStatement: null,
    mutator: 'sort_mutator',
    colour: 225
  },
  {
    type: 'option_v',
    tooltip: '',
    helpUrl: '',
    message0: '-v %1',
    args0: [
      {
        type: 'input_dummy',
        name: 'OPTION_V',
        align: 'CENTRE'
      }
    ],
    previousStatement: null,
    colour: 225
  },
  {
    type: 'option_i',
    tooltip: '',
    helpUrl: '',
    message0: '-i %1',
    args0: [
      {
        type: 'input_dummy',
        name: 'OPTION_I',
        align: 'CENTRE'
      }
    ],
    previousStatement: null,
    colour: 15
  },
  {
    type: 'option_n',
    tooltip: '',
    helpUrl: '',
    message0: '-n %1',
    args0: [
      {
        type: 'input_dummy',
        name: 'OPTION_N',
        align: 'CENTRE'
      }
    ],
    previousStatement: null,
    colour: 330
  },
  {
    type: 'option_c',
    tooltip: '',
    helpUrl: '',
    message0: '-c %1',
    args0: [
      {
        type: 'input_dummy',
        name: 'OPTION_C',
        align: 'CENTRE'
      }
    ],
    previousStatement: null,
    colour: 60
  },
  {
    type: 'option_v',
    tooltip: '',
    helpUrl: '',
    message0: '-v %1',
    args0: [
      {
        type: 'input_dummy',
        name: 'OPTION_V',
        align: 'CENTRE'
      }
    ],
    previousStatement: null,
    colour: 225
  },
  {
    type: 'option_r',
    tooltip: '',
    helpUrl: '',
    message0: '-r %1',
    args0: [
      {
        type: 'input_dummy',
        name: 'OPTION_R',
        align: 'CENTRE'
      }
    ],
    previousStatement: null,
    colour: 225
  },
  {
    type: 'option_u',
    tooltip: '',
    helpUrl: '',
    message0: '-u %1',
    args0: [
      {
        type: 'input_dummy',
        name: 'OPTION_U',
        align: 'CENTRE'
      }
    ],
    previousStatement: null,
    colour: 225
  },
  {
    type: 'option_v',
    tooltip: '',
    helpUrl: '',
    message0: '-v %1',
    args0: [
      {
        type: 'input_dummy',
        name: 'OPTION_V',
        align: 'CENTRE'
      }
    ],
    previousStatement: null,
    colour: 225
  },
  {
    type: 'option_k',
    tooltip: '',
    helpUrl: '',
    message0: '-k %1 %2',
    args0: [
      {
        type: 'field_number',
        name: 'COLUMN_INDEX',
        value: 1,
        min: 1,
        max: 100
      },
      {
        type: 'input_dummy',
        name: 'NAME'
      }
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 315
  },

  {
    type: 'grep_mutator_container',
    message0: 'Options grep %1 %2',
    args0: [
      { type: 'input_dummy' },
      {
        type: 'input_statement',
        name: 'OPTIONS',
        check: 'grep_option'
      }
    ],
    colour: 285,
    tooltip: 'Ajouter/supprimer des options pour grep',
    enableContextMenu: false
  },
  {
    type: 'grep_mutator_option',
    message0: 'option',
    nextStatement: 'grep_option',
    previousStatement: 'grep_option',
    colour: 285,
    tooltip: 'Une option (-v, -i,...)',
    enableContextMenu: false
  },
  {
    type: 'sort_mutator_container',
    message0: 'Options sort %1 %2',
    args0: [
      { type: 'input_dummy' },
      {
        type: 'input_statement',
        name: 'OPTIONS',
        check: 'sort_option'
      }
    ],
    colour: 285,
    tooltip: 'Ajouter/supprimer des options pour sort',
    enableContextMenu: false
  },
  {
    type: 'sort_mutator_option',
    message0: 'option',
    nextStatement: 'sort_option',
    previousStatement: 'sort_option',
    colour: 285,
    tooltip: 'Une option (-v, -i,...)',
    enableContextMenu: false
  }
])
