<template>
  <div class="ice-header">
    <span class="ice-header-brand">ICE - {{ title }}</span>
    <div class="ice-header-links">
      <a href="http://ice.ecosheds.org">ICE Home</a> |
      <a href="http://ecosheds.org">SHEDS Home</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'iceHeader',
  props: ['title']
}
</script>

<style scope>
.ice-header {
  position: fixed;
  width: 100%;
  height: 60px;
  top: 68px;
  left: 0;
  background: rgba(40, 40, 40, 0.5);
  color: white;
  padding: 10px;
  font-family: 'Open Sans', "proxima-nova-alt", Helvetica, Arial, sans-serif;
  z-index: 2000;
}

.ice-header-brand {
  font-variant: small-caps;
  font-size: 24pt;
}

.ice-header-links {
  float: right;
}

.ice-header-links a {
  color: white;
  font-weight: bold;
  letter-spacing: 0.1em;
  line-height: 1.5em;
}

.ice-header-links a:visited {
  color: white;
}
</style>
