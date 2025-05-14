<template>
  <div id="app">
    <h1 id="message">{{ message }}</h1>
    <p id="guideline">{{ guideline }}</p>
    <h3 id="filename">{{ filename }}</h3>
    <pre id="fileContent">{{ fileContent }}</pre>
  </div>
</template>

<script>
export default {
  name: "app",
  props: ["message", "guideline", "filename", "fileContent"],
};
</script>
