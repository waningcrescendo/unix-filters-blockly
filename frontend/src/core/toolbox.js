/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/*
This toolbox contains nearly every single built-in block that Blockly offers,
in addition to the custom block 'add_text' this sample app adds.
You probably don't need every single block, and should consider either rewriting
your toolbox from scratch, or carefully choosing whether you need each block
listed here.
*/

export const toolbox = {
  kind: "flyoutToolbox",
  contents: [
    {
      kind: "block",
      type: "command_pipe2",
    },
    {
      kind: "block",
      type: "command_cat2",
    },
    {
      kind: "block",
      type: "filter_grep2",
    },
    {
      kind: "block",
      type: "option_v",
    },
    {
      kind: "block",
      type: "option_i",
    },
  ],
};
