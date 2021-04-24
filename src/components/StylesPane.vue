<template>
    <div class="styles_pane">
        <h3>Inline CSS</h3>
        <codemirror ref="cmEditor" :options="cmOptions" v-on:changes="on_code_update"/>
    </div>
</template>

<script>
export default {
  name: 'StylesPane',
  props: {
    element: HTMLElement
  },
  watch: {
    element: function(new_val, old_val) {
      console.log(new_val, old_val);
      let css = new_val.style.cssText.replaceAll("; ", ";");
      css = css.replaceAll(";", ";\n");
      this.$refs.cmEditor.codemirror.doc.setValue(css);
    }
  },
  data () {
    return {
      cmOptions: {
        mode: 'css',
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      }
    }
  },
  methods: {
    on_code_update: function() {
      this.$emit('css_updated', this.$refs.cmEditor.codemirror.doc.getValue());
    },
    update: function() {
      if(this.element) {
        let css = this.element.style.cssText.replaceAll("; ", ";");
        css = css.replaceAll(";", ";\n");
        this.$refs.cmEditor.codemirror.doc.setValue(css);
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .styles_pane {
        background-color: rgb(255, 249, 223);
        padding: 1rem;
    }

    .styles_pane >>> .CodeMirror,
    .styles_pane >>> .CodeMirror .CodeMirror-gutters {
      background: rgb(255, 249, 223);
    }
</style>
