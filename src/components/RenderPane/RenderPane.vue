<template>
    <div class="render_pane flex flex-col">
      <div class="toolbar">
        <select>
          <option>Default</option>
          <option>OpenGraph Image - LinkedIn</option>
          <option>OpenGraph Image - Twitter</option>
        </select>
      </div>
      <div class="flex flex-row flex-1">
        <div class="tools flex flex-col">
          <img class="button" src="./assets/object-alignment-to-the-left.svg">
          <img class="button" src="./assets/object-alignment-horizontal.svg">
          <img class="button" src="./assets/object-alignment-to-the-right.svg">
          <img class="button" src="./assets/object-alignment-to-the-top.svg">
          <img class="button" src="./assets/object-alignment-to-the-center.svg">
          <img class="button" src="./assets/object-alignment-at-the-bottom.svg">
        </div>
        <StylesPane ref="styles_pane" v-bind:element="selected_element" v-on:css_updated="update_selected_element_css"/>
        <div v-html="code" ref="content" v-on:mousedown="mousedown" v-on:mouseup="mouseup" class="content flex-1"></div>
      </div>
    </div>
</template>

<script>

import StylesPane from './StylesPane.vue'
import interact from 'interactjs'

export default {
  name: 'RenderPane',
  components: {
    StylesPane
  },
  data () {
    return {
      code: null,
      selected_element: null,
      action: null
    }
  },
  methods: {
    mousedown: function(event) {
      if (this.selected_element) {
        this.action = 'Select';
      } else {
        this.action = null;
        this.select_element(event.target);
      }
    },
    mouseup: function(event) {
      if (this.$data.action != 'Select') {
        return;
      }
      this.deselect_element();
      if (event.target) {
        this.select_element(event.target);
      }
    },
    select_element: function(el) {
      this.deselect_element();
      this.selected_element = el;
      this.selected_element.classList.add("selected");
      this.$emit('selected_element', this.selected_element)
    },
    deselect_element: function() {
      if (this.selected_element) {
        this.selected_element.classList.remove("selected");
        this.$emit('deselected_element', this.selected_element)
        this.selected_element = null;
      }
    },
    update_selected_element_css: function(css) {
      if (this.selected_element) {
        this.selected_element.style.cssText = css;
        this.code_updated();
      }
    },
    code_updated: function() {
      let innerHtml = this.$refs.content.innerHTML;
      innerHtml = innerHtml.replaceAll("selected", "");
      innerHtml = innerHtml.replaceAll(" class=\"\"", "");
      this.$emit("code_updated", innerHtml, this);
    },
    set_code: function(code) {
      this.$data.code = code;
      // this.$data.selected_element = null;
      // var doc = new DOMParser().parseFromString(code, "text/xml");
      let component = this;
      interact('.render_pane .content *').draggable({
          modifiers: [
            interact.modifiers.restrict({
              restriction: 'parent'
            })
          ],
          listeners: {
            move (event) {
              let position = { x: 0, y: 0 };
              if (event.target.style.transform) {
                let matrix = new DOMMatrixReadOnly(event.target.style.transform)
                position.x = matrix.m41;
                position.y = matrix.m42;
              }
              component.action = null;
              position.y += event.dy;
              position.x += event.dx;
              event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;
              component.code_updated();
              component.$refs.styles_pane.update();
            }
          }
      })
    }
  }
}

</script>

<style scoped>
    .render_pane {
        width: 100%;
    }
    .render_pane >>> .selected {
      content: '';
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      outline: 2px dashed red;
    }
    .render_pane >>> .tools { order: 1; }
    .render_pane >>> .styles_pane { order: 2; }
    .render_pane >>> .tools {
      padding: 0.25rem;
      background-color: #cecece;
    }
    .render_pane >>> .tools .button {
      box-sizing: content-box;
      height: 1rem;
      padding: 0.25rem;
      border: 1px solid rgb(0, 0, 0);
      border-radius: 3px;
    }
    .render_pane >>> .tools .button:hover {
      opacity: 0.25;
      cursor: pointer;
    }
    .render_pane >>> .tools .button:nth-child(n+1) {
      margin-top: 0.25rem;
    }
    .render_pane >>> .content {
      overflow: hidden;
    }
</style>
