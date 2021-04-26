<template>
  <div id="app">
    <RenderPane ref="render_pane" v-on:code_updated="code_updated"/>
    <div class="flex flex-row">
      <MarkupPane v-on:code_updated="code_updated" ref="markup_pane"/>
    </div>
  </div>
</template>

<script>
import RenderPane from './components/RenderPane/RenderPane.vue'
import MarkupPane from './components/MarkupPane.vue'
import './styles.css'

export default {
  name: 'App',
  components: {
    RenderPane,
    MarkupPane
  },
  methods: {
    code_updated: function(code, source) {
      if (source != this.$refs.render_pane) {
        this.$refs.render_pane.set_code(code);
      }
      if (source != this.$refs.markup_pane) {
        this.$refs.markup_pane.set_code(code);
      }
    }
  }
}
</script>

<style>
  #app {
    position: relative;
  }
</style>
