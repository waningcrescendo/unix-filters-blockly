<template>
  <div id="app">
    <h1 id="message">{{ message }}</h1>
    <pre id="jsonContent">{{ jsonContent }}</pre>
  </div>
</template>

<script>
export default {
  name: "app",
  props: ["message", "jsonContent"],
};
</script>
