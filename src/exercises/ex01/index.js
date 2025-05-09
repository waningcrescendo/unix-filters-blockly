export function initExercise (core, config) {
  core.loadToolbox(config.toolbox)
  core.loadStartWorkspace(config.startXml)
  document.querySelector('#run').addEventListener('click', () => {
    const code = core.generateCode()
    const result = runUserCode(code, config.tests)
    showResult(result)
  })
}
