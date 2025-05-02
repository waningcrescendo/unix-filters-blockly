import * as Blockly from "blockly";

export const blocks = Blockly.common.createBlockDefinitionsFromJsonArray([
  {
    type: "program",
    tooltip: "",
    helpUrl: "",
    message0: "Programme %1",
    args0: [
      {
        type: "input_dummy",
        name: "NAME",
      },
    ],
    nextStatement: null,
    colour: 130,
  },
  {
    type: "command_pipe",
    helpUrl: "https://fr.wikipedia.org/wiki/Tube_(shell)",
    message0: "|",
    previousStatement: null,
    nextStatement: null,
    colour: 200,
  },
  {
    type: "command_cat",
    tooltip: "",
    helpUrl: "https://fr.wikipedia.org/wiki/Cat_(Unix)",
    message0: "%1 %2 %3",
    args0: [
      {
        type: "field_label_serializable",
        text: "cat",
        name: "",
      },
      {
        type: "field_input",
        name: "FILENAME",
        text: "filename",
      },
      {
        type: "input_dummy",
        name: "NAME",
        align: "CENTRE",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    colour: 250,
  },
  {
    type: "command_grep",
    message0: "grep %1",
    args0: [
      {
        type: "field_input",
        name: "PATTERN",
        text: "pattern",
      },
    ],
    previousStatement: null,
    nextStatement: null,
    mutator: "grep_mutator",
    colour: 285,
    tooltip: "",
  },
  {
    type: "option_v",
    tooltip: "",
    helpUrl: "",
    message0: "-v %1",
    args0: [
      {
        type: "input_dummy",
        name: "OPTION_V",
        align: "CENTRE",
      },
    ],
    previousStatement: null,
    colour: 225,
  },
  {
    type: "option_i",
    tooltip: "",
    helpUrl: "",
    message0: "-i %1",
    args0: [
      {
        type: "input_dummy",
        name: "OPTION_I",
        align: "CENTRE",
      },
    ],
    previousStatement: null,
    colour: 15,
  },
  {
    type: "grep_mutator_container",
    message0: "Options grep %1 %2",
    args0: [
      { type: "input_dummy" },
      {
        type: "input_statement",
        name: "OPTIONS",
        check: "grep_option",
      },
    ],
    colour: 285,
    tooltip: "Ajouter/supprimer des options pour grep",
    enableContextMenu: false,
  },
  {
    type: "grep_mutator_option",
    message0: "option",
    nextStatement: "grep_option",
    previousStatement: "grep_option",
    colour: 285,
    tooltip: "Une option (-v, -i,...)",
    enableContextMenu: false,
  },
]);

Blockly.constants.Grep = {};
Blockly.constants.Grep.GREP_MUTATOR_MIXIN = {
  optionCount_: 0,
  mutationToDom: function () {
    const container = document.createElement("mutation");
    container.setAttribute("options", this.optionCount_);
    return container;
  },
  domToMutation: function (xmlElement) {
    this.optionCount_ = parseInt(xmlElement.getAttribute("options"), 10);
    this.updateShape_();
  },

  decompose: function (workspace) {
    console.log();
    const containerBlock = workspace.newBlock("grep_mutator_container");
    containerBlock.initSvg();
    let connection = containerBlock.getInput("OPTIONS").connection;
    for (let i = 0; i < this.optionCount_; i++) {
      const optionBlock = workspace.newBlock("grep_mutator_option");
      optionBlock.initSvg();
      optionBlock.valueConnection_ = this.getInput(
        "OPTIONS_SLOT" + i
      ).connection.targetConnection;
      connection.connect(optionBlock.previousConnection);
      connection = optionBlock.nextConnection;
    }
    return containerBlock;
  },

  compose: function (containerBlock) {
    let optionBlock = containerBlock.getInputTargetBlock("OPTIONS");
    const connections = [];
    while (optionBlock) {
      connections.push(optionBlock.valueConnection_);
      optionBlock =
        optionBlock.nextConnection && optionBlock.nextConnection.targetBlock();
    }
    this.optionCount_ = connections.length;
    this.updateShape_();
    for (let i = 0; i < connections.length; i++) {
      if (connections[i]) {
        this.getInput("OPTIONS_SLOT" + i).connection.connect(connections[i]);
      }
    }
  },
  updateShape_: function () {
    if (this.getInput("OPTIONS_SLOT0")) {
      let i = 0;
      while (this.getInput("OPTIONS_SLOT" + i)) {
        this.removeInput("OPTIONS_SLOT" + i);
        i++;
      }
    }
    for (let i = 0; i < this.optionCount_; i++) {
      this.appendStatementInput("OPTIONS_SLOT" + i)
        .setCheck("grep_option")
        .appendField("option");
    }
    if (this.getInput("PATTERN")) {
      this.moveInputBefore("PATTERN", null);
    }
  },
};

Blockly.Extensions.registerMutator(
  "grep_mutator",
  Blockly.constants.Grep.GREP_MUTATOR_MIXIN,
  null,
  ["grep_mutator_option"]
);
