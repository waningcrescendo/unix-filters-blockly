import * as Blockly from "blockly";

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    type: "filter_grep",
    message0: 'grep %1 "%2" %3',
    args0: [
      {
        type: "field_input",
        name: "OPTION",
        text: "option",
      },
      {
        type: "field_input",
        name: "PATTERN",
        text: "pattern",
      },
      {
        type: "input_value",
        name: "COMMAND_IN",
        check: "Command",
      },
    ],
    output: "Command",
    helpUrl: "https://fr.wikipedia.org/wiki/Grep",
    colour: 230,
  },

  {
    type: "command_cat",
    message0: "cat %1 %2",
    args0: [
      {
        type: "field_input",
        name: "FILENAME",
        text: "nom du fichier",
      },
      {
        type: "input_value",
        name: "COMMAND1",
      },
    ],
    output: null,
    helpUrl: "https://fr.wikipedia.org/wiki/Cat_(Unix)",
    colour: 230,
  },
  {
    type: "command_pipe",
    message0: "%2 | %1",
    args0: [
      {
        type: "input_value",
        name: "COMMAND1",
        check: "Command",
      },
      {
        type: "input_value",
        name: "COMMAND2",
        check: "Command",
      },
    ],
    output: null,
    helpUrl: "https://fr.wikipedia.org/wiki/Tube_(shell)",
    colour: 130,
  },
]);
