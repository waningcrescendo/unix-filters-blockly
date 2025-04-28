import * as Blockly from 'blockly';

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([{
  "type": "object",
  "message0": "{ %1 %2 }",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "MEMBERS"
    }
  ],
  "output": null,
  "colour": 230,
},
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
  "type": "member",
  "message0": "%1 %2 %3",
  "args0": [
    {
      "type": "field_input",
      "name": "MEMBER_NAME",
      "text": ""
    },
    {
      "type": "field_label",
      "name": "COLON",
      "text": ":"
    },
    {
      "type": "input_value",
      "name": "MEMBER_VALUE"
    }
  ],
  "previousStatement": null,
  "nextStatement": null,
  "colour": 230,
}]);