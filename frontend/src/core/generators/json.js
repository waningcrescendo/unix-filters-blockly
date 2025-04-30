import * as Blockly from "blockly";

export const jsonGenerator = new Blockly.Generator("JSON");

jsonGenerator.ORDER_ATOMIC = 0;
jsonGenerator.ORDER_NONE = 0;

jsonGenerator.forBlock["filter_grep"] = function (block) {
  const pattern = block.getFieldValue("PATTERN");
  const option = block.getFieldValue("OPTION");
  const code = `grep ${option} "${pattern}"`;
  return [code, jsonGenerator.ORDER_NONE];
};

jsonGenerator.forBlock["command_cat"] = function (block) {
  const filename = block.getFieldValue("FILENAME");
  const command1 = jsonGenerator.valueToCode(
    block,
    "COMMAND1",
    jsonGenerator.ORDER_NONE
  );
  const code = command1 ? `cat ${filename} | ${command1}` : `cat ${filename}`;
  return [code, jsonGenerator.ORDER_NONE];
};

jsonGenerator.forBlock["command_pipe"] = function (block) {
  // in a nested COMMAND1:
  const cmd = jsonGenerator.valueToCode(
    block,
    "COMMAND1",
    jsonGenerator.ORDER_NONE
  );
  const code = `${cmd}`;
  return [code, jsonGenerator.ORDER_NONE];
};

jsonGenerator.scrub_ = function (block, code, thisOnly) {
  const next = block.nextConnection && block.nextConnection.targetBlock();
  if (next && !thisOnly) {
    const nextCodeTuple = jsonGenerator.blockToCode(next);
    return code + ",\n" + nextCodeTuple[0];
  }
  return code;
};
