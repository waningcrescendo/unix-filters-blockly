import * as Blockly from 'blockly';

export const jsonGenerator = new Blockly.Generator('JSON');
  
jsonGenerator.forBlock['filter_grep'] = function (block) {
    const pattern = block.getFieldValue('PATTERN');
    const option = block.getFieldValue('OPTION');
    console.log(pattern);
    console.log(option);
    const code = `grep ${option} "${pattern}"`;
    return code;
};
  
jsonGenerator.forBlock['command_cat'] = function (block) {
    const filename = block.getFieldValue('FILENAME');
    console.log(filename);
    const code = `cat ${filename}`;
    return code;
};

// jsonGenerator.forBlock['command_pipe'] = function (block) {
//     const left = jsonGenerator.valueToCode(block, 'LEFT', jsonGenerator.ORDER_NONE);
//     const right = jsonGenerator.valueToCode(block, 'RIGHT', jsonGenerator.ORDER_NONE);

//     if (!left || !right) {
//       return '';
//     }

//     const code = `${left} | ${right}`;
//     return [code, jsonGenerator.ORDER_ATOMIC];
// };


jsonGenerator.scrub_ = function(block, code, thisOnly) {
    const nextBlock =
        block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
      return code + ',\n' + jsonGenerator.blockToCode(nextBlock);
    }
    return code;
  };