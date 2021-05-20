<template>
    <div class="styles_pane">
      <codemirror ref="cmEditor" :value="formatted_css" :options="cmOptions" v-on:changes="updated"/>
    </div>
</template>

<script>
export default {
  name: 'StylesPane',
  props: {
    css: String
  },
  computed: {
    formatted_css: function() {
      if (!this.css) { 
        return "";
      } else {
        let css = this.css.replaceAll("; ", ";");
        css = css.replaceAll(";", ";\n");
        return css;
      }
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
    updated: function() {
      this.$emit('updated', this.$refs.cmEditor.codemirror.doc.getValue());
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
