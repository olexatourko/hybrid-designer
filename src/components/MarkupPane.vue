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
`<div class="modal">
  <h2 class="font-bold">My App</h2>
  <p>I got a whole California run from 1910 up, and uh... I've even got plates that people would go out and homestead, like in Barstow. They have to build a little house to get the property. You still see them out there. Then they had to make a roof. Well, out of... you know, a company that used to melt the plates down, fact they were in Ontario and then, going out that way on that railroad route, or get or getting plates coming this way, I don't know, then the train derailed, so here's a BIG pile of license plates, and they're all from the 30's, layin' out in the desert.</p>
  <button class="btn" style="margin-top: 1rem;">Continue</button>
  <button class="btn btn_secondary" style="margin-top: 1rem;">Cancel</button>
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
