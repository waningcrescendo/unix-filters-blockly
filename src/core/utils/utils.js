const sampleInput = `
pêche
pomme
poire
abricot
banane
fraise
kiwi
`.trim();

export function showFileContent(filename) {
  const output = sampleInput.split("\n");
  const filenameDefined = document.getElementById("filename").innerHTML;
  if (filename === filenameDefined) {
    return output;
  } else {
    return null;
  }
}
