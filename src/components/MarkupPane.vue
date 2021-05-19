<template>
    <div class="markup_pane">
        <codemirror v-on:changes="code_updated" :value="code" v-on:focus="focused = true" v-on:blur="focused = false" :options="cmOptions" ref="cmEditor"/>
    </div>
</template>

<script>

export default {
  name: 'MarkupPane',
  emits: ['markup_updated'],
  data () {
    return {
      code:
`<div class="example modal">
  <h2 class="font-bold">My App</h2>
  <p>Paragraph A</p>
  <p>Paragraph B</p>
  <h2 class="font-bold" style="margin-top: 1rem;">Action</h2>
  <div style="margin-top: 0.5rem;">
    <button class="example btn">Continue</button>
    <button class="example btn btn_secondary">Cancel</button>
  </div>
</div>`,
      cmOptions: {
        tabSize: 4,
        mode: 'htmlmixed',
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      },
      focused: false
    }
  },
  methods: {
    code_updated: function(event) {
      if (this.$data.focused) {
        this.$emit('code_updated', event.doc.getValue(), this);
      }
    },
    set_code: function(code) {
      this.$refs.cmEditor.codemirror.doc.setValue(code);
    }
  },
  mounted() {
    this.$emit('code_updated', this.$refs.cmEditor.codemirror.doc.getValue(), this);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .markup_pane {
      width: 100%;
      height: 25rem;
      background-color: rgb(255, 249, 223);
    }
    .vue-codemirror >>> .CodeMirror {
      height: auto;
      background-color: rgb(255, 249, 223);
    }
    .markup_pane >>> .CodeMirror .CodeMirror-gutters {
      background-color: rgb(255, 249, 223);
    }
</style>
