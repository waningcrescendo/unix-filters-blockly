import { showFileContent } from "./utils";

export function createHandlers(simulateBlock) {
  return {
    command_cat: (block, _) => {
      const filename = block.getFieldValue("FILENAME");
      return showFileContent(filename);
    },

    command_pipe: (block, lines) => {
      const precedentResult = simulateBlock(block.getPreviousBlock(), lines);
      console.log("precedent result ,", precedentResult);
      const nextBlock = block.getNextBlock();
      const result =
        nextBlock != null && precedentResult != null
          ? simulateBlock(nextBlock, precedentResult)
          : null;
      console.log("result pipe ", result);
      return result;
    },

    command_grep: (block, lines) => {
      console.log("filter_grep");
      const previous = block.getPreviousBlock();
      if (!previous || previous.type !== "command_pipe") {
        console.log("grep must follow pipe");
        return null;
      }
      const pattern = block.getFieldValue("PATTERN");
      const opts = [];
      for (let i = 0; i < block.optionCount_; i++) {
        const optBlock = block.getInputTargetBlock("OPTIONS_SLOT" + i);
        if (!optBlock) continue;
        if (optBlock.type === "option_i") opts.push("i");
        if (optBlock.type === "option_v") opts.push("v");
      }

      const flags = opts.includes("i") ? "i" : "";
      const regex = new RegExp(pattern, flags);

      let result = lines || [];
      if (opts.includes("v")) {
        result = result.filter((line) => !regex.test(line));
      } else {
        result = result.filter((line) => regex.test(line));
      }
      console.log("result grep ", result);
      return result;
    },
  };
}
