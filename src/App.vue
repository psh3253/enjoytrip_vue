<template>
  <Header></Header>
  <section>
    <router-view></router-view>
  </section>
  <Footer></Footer>
</template>

<script>

import Footer from "@/components/common/Footer.vue";
import Header from "@/components/common/Header.vue";
export default {
  name: 'App',
  components: {
    Header, Footer
  }
}
</script>

<style>
html, body {
  height: 100%;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

section {
  flex: 1;
  position: relative;
  padding-bottom: 50px;
}

footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 50px;
}
</style>
