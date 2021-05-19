<template>
  <div id="app" class="flex flex-col">
    <div class="toolbar">
      <button class="btn" v-bind:class="{ active: mode=='visual' }" v-on:click="mode='visual'">Visual</button>
      <button class="btn" v-bind:class="{ active: mode=='code' }" v-on:click="mode='code'">Code</button>
    </div>
    <RenderPane v-bind:class="{ hidden: mode!='visual' }" ref="render_pane" v-on:code_updated="code_updated" class="flex-1"/>
    <MarkupPane v-bind:class="{ hidden: mode!='code' }" v-on:code_updated="code_updated" ref="markup_pane" class="flex-1"/>
    <DragView/>
  </div>
</template>

<script>
import RenderPane from './components/RenderPane/RenderPane.vue';
import MarkupPane from './components/MarkupPane.vue';
import DragView from './components/DragView.vue';
import './styles.css'

export default {
  name: 'App',
  data () {
    return {
      mode: "visual"
    }
  },
  components: {
    RenderPane,
    MarkupPane,
    DragView
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
  html, body { height: 100vh; }

  #app {
    min-height: 100%;
  }
  
  #app > .toolbar {
    background-color: #443f5f;
    color: rgb(255, 255, 255);
    font-family: 'Courier New', Courier, monospace;
  }
  #app > .toolbar .btn {
    padding: 0.1rem 1rem;
    outline: none;
  }
  #app > .toolbar .btn.active { background-color: #7b72ab; }
  #app > .toolbar .btn:hover {
    background-color: #7b72ab;
  }
</style>
