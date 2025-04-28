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

jsonGenerator.forBlock['command_pipe'] = function (block) {
    const command1 = jsonGenerator.statementToCode(block, 'COMMAND1');  
    const command2 = jsonGenerator.statementToCode(block, 'COMMAND2'); 

    let code = command1;
    if (command2) {
        code += ` | ${command2}`;  
    }

    return code;  
};


jsonGenerator.scrub_ = function(block, code, thisOnly) {
    const nextBlock =
        block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
      return code + ',\n' + jsonGenerator.blockToCode(nextBlock);
    }
    return code;
  };