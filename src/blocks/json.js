import * as Blockly from 'blockly';

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
{
  "type": "filter_grep",
  "message0": "grep %1 \"%2\"",
  "args0": [
     {
      "type": "field_input",
      "name": "OPTION",
      "text": "option"
    },
    {
      "type": "field_input",
      "name": "PATTERN",
      "text": "pattern"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  },
  {
  "type": "command_cat",
  "message0": "cat %1",
  "args0": [
     {
      "type": "field_input",
      "name": "FILENAME",
      "text": "nom du fichier"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
  },
  {
    "type": "command_pipe",
    "message0": "%1 | %2",
    "args0": [
      {
        "type": "input_statement",
        "name": "COMMAND1"
      },
      {
        "type": "input_statement",
        "name": "COMMAND2"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230
  }
]);