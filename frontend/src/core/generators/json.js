import * as Blockly from "blockly";

export const jsonGenerator = new Blockly.Generator("JSON");

jsonGenerator.ORDER_ATOMIC = 0;
jsonGenerator.ORDER_NONE = 0;

// test avec les séquentiels
jsonGenerator.forBlock["command_cat2"] = function (block) {
  const filename = block.getFieldValue("FILENAME");
  return `cat ${filename}`;
};

jsonGenerator.forBlock["filter_grep2"] = function (block) {
  const pattern = block.getFieldValue("PATTERN");
  const opts = [];
  for (let i = 0; i < block.optionCount_; i++) {
    const opt = block.getInputTargetBlock("OPTIONS_SLOT" + i);
    if (!opt) continue;
    if (opt.type === "option_i") opts.push("-i");
    if (opt.type === "option_v") opts.push("-v");
  }
  const optionString = opts.join(" ");
  return `grep ${optionString} "${pattern}"`;
};

jsonGenerator.forBlock["command_pipe2"] = function (block) {
  return `|`;
};

jsonGenerator.forBlock["option_i"] = function (block) {
  return `-i`;
};
jsonGenerator.forBlock["option_v"] = function (block) {
  return `-v`;
};

jsonGenerator.scrub_ = function (block, code, thisOnly) {
  if (thisOnly) {
    return code;
  }
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (nextBlock) {
    const nextCode = this.blockToCode(nextBlock, false);
    return code + " " + nextCode;
  }
  return code;
};
