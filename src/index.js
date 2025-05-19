import './index.css'
import { switchExercise } from './views/exercisePage'

async function loadExerciseFromHash () {
  const hash = window.location.hash.replace(/^#\/?/, '')
  if (!hash) return

  try {
    const configPath = `/exercises/${hash}/config.json`
    const fakeButton = document.createElement('button')

    await switchExercise(configPath, hash, fakeButton)
  } catch (err) {
    console.log('erreur', err)
    document.getElementById('output').textContent =
      `Erreur : l'exercice ${hash} est introuvable`
  }
}

window.addEventListener('load', loadExerciseFromHash)
window.addEventListener('hashchange', loadExerciseFromHash)
