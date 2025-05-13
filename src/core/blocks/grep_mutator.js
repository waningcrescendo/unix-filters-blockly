import * as Blockly from 'blockly'

Blockly.constants.Grep = {}
Blockly.constants.Grep.GREP_MUTATOR_MIXIN = {
  optionCount_: 0,
  mutationToDom: function () {
    const container = document.createElement('mutation')
    container.setAttribute('options', this.optionCount_)
    return container
  },
  domToMutation: function (xmlElement) {
    this.optionCount_ = parseInt(xmlElement.getAttribute('options'), 10)
    this.updateShape_()
  },

  decompose: function (workspace) {
    const containerBlock = workspace.newBlock('grep_mutator_container')
    containerBlock.initSvg()
    let connection = containerBlock.getInput('OPTIONS').connection
    for (let i = 0; i < this.optionCount_; i++) {
      const optionBlock = workspace.newBlock('grep_mutator_option')
      optionBlock.initSvg()
      optionBlock.valueConnection_ = this.getInput(
        'OPTIONS_SLOT' + i
      ).connection.targetConnection
      connection.connect(optionBlock.previousConnection)
      connection = optionBlock.nextConnection
    }
    return containerBlock
  },

  compose: function (containerBlock) {
    let optionBlock = containerBlock.getInputTargetBlock('OPTIONS')
    const connections = []
    while (optionBlock) {
      connections.push(optionBlock.valueConnection_)
      optionBlock =
        optionBlock.nextConnection && optionBlock.nextConnection.targetBlock()
    }
    this.optionCount_ = connections.length
    this.updateShape_()
    for (let i = 0; i < connections.length; i++) {
      if (connections[i]) {
        this.getInput('OPTIONS_SLOT' + i).connection.connect(connections[i])
      }
    }
  },
  updateShape_: function () {
    if (this.getInput('OPTIONS_SLOT0')) {
      let i = 0
      while (this.getInput('OPTIONS_SLOT' + i)) {
        this.removeInput('OPTIONS_SLOT' + i)
        i++
      }
    }
    for (let i = 0; i < this.optionCount_; i++) {
      this.appendStatementInput('OPTIONS_SLOT' + i)
        .setCheck('grep_option')
        .appendField('option')
    }
    if (this.getInput('PATTERN')) {
      this.moveInputBefore('PATTERN', null)
    }
  }
}

Blockly.Extensions.registerMutator(
  'grep_mutator',
  Blockly.constants.Grep.GREP_MUTATOR_MIXIN,
  null,
  ['grep_mutator_option']
)

export default Blockly.constants.Grep.GREP_MUTATOR_MIXIN
