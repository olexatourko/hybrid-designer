<template>
    <div class="render_pane flex flex-col">
      <div class="flex flex-row flex-1">

        <div v-html="code" ref="content" v-on:mousedown="mousedown" v-on:keypress="keypress" class="content flex-1" tabindex="0"></div>
        <div class="tools">
          <div class="section">
            <h3 class="font-bold">Macros</h3>
            <ul>
              <li v-on:click="align_left" class="button">Align Top Left</li>
              <li v-on:click="align_center_v" class="button">Align Top Center</li>
              <li v-on:click="align_right" class="button">Align Top Right</li>
              <li v-on:click="align_right" class="button">Set Margins</li>
            </ul>
          </div>

          <div class="section" v-if="selected_element">
            <h3 class="font-bold text-base">Inline Styles</h3>
            <StylesPane ref="inline_styles_pane" v-bind:css="selected_element_inline_style" v-on:updated="update_selected_element_css"/>
          </div>
          <div class="section" v-if="selected_element">
            <h3 class="font-bold text-base">Element Content</h3>
            <codemirror ref="cmEditor" :value="selected_element_innerHTML" :options="HTMLcmOptions" v-on:changes="selected_element.innerHTML=$event.doc.getValue()"/>
          </div>
          <div class="section" v-if="selected_element">
            <h3 class="font-bold text-base">Classes</h3>
            <ClassEditor v-bind:classes="this.selected_element_classes"/>
          </div>
          <div class="section">
            <h3 class="font-bold text-base">Components</h3>
            <ComponentList/>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import StylesPane from './StylesPane.vue';
import ClassEditor from './ClassEditor.vue';
import ComponentList from './ComponentList/List.vue';
import interact from 'interactjs'
import { find_closest_element_to_point } from '@/js/utils';

export default {
  name: 'RenderPane',
  components: {
    StylesPane,
    ClassEditor,
    ComponentList
  },
  data () {
    return {
      code: null,
      selected_element: null,
      align_target: null,
      drop_target: null,
      HTMLcmOptions: {
        mode: 'htmlmixed',
        theme: 'base16-light',
        lineNumbers: true,
        line: true,
      }
    }
  },
  computed: {
    elements: function() {
      let nodes = [];
      const nodeIterator = document.createNodeIterator(
          this.$refs.content,
          NodeFilter.SHOW_ELEMENT,
          (node) => {
            return node != this.$refs.content;
          }
      );
      for (let e = nodeIterator.nextNode(); e != null; e=nodeIterator.nextNode()) {
        nodes.push(e);
      }
      return nodes;
    },
    is_align_target_in_range: function() {
      if (this.align_target) {
        return this.align_target.magnitude < 10;
      }
      return false;
    },
    selected_element_inline_style: function() {
      if (this.selected_element) {
        return this.selected_element.style.cssText;
      }
      return null;
    },
    selected_element_innerHTML: function() {
      if (this.selected_element) {
        return this.selected_element.innerHTML;
      }
      return null;
    },
    selected_element_classes: function() {
      if (this.selected_element) {
        return this.selected_element.classList;
      }
      return null;
    }
  },
  watch: {
    code: function() {
      this.$nextTick(() => {
        this.register_node_listeners(this.$refs.content);
      });
    },
    selected_element: function(new_val, old_val) {
      if (old_val) { old_val.classList.remove("selected"); }
      if (new_val) { new_val.classList.add("selected"); }
    },
    align_target: {
      handler: function(new_val, old_val) {
        if (old_val) {
          old_val.element.classList.remove('align_to_left');
          old_val.element.classList.remove('align_to_right');
          old_val.element.classList.remove('align_to_top');
          old_val.element.classList.remove('align_to_bottom');
          if (old_val.element.parentElement) {
            old_val.element.parentElement.classList.remove('drop');
          }
        }
        this.update_highlighting()
      },
      deep: true
    },
    drop_target: function(new_val, old_val) {
      if (old_val) {
        old_val.classList.remove('drop');
      }
      this.update_highlighting();
    }
  },
  methods: {
    flag_recompute: function(properties = []) {
      for (let watcher of this._watchers) {
        if (properties.includes(watcher.getter.name)) {
          watcher.dirty = true;
        }
      }
    },
    mousedown: function(event) {
      this.select_element(event.target);
    },
    keypress: function(event) {
      if (this.selected_element) {
        if (event.code == 'KeyA') {
          let new_node = this.selected_element.cloneNode(true);
          this.selected_element.parentElement.insertBefore(new_node, this.selected_element);
          new_node.focus();
          this.select_element(new_node);
          this.flag_recompute(['elements']); // Because $this.code is binded with v-html, changes to it are not detected by the reactivity system.
          this.register_node_listeners(new_node);
        }
        else if (event.code == 'KeyB') {
          let new_node = this.selected_element.cloneNode(true);
          this.selected_element.parentElement.insertBefore(new_node, this.selected_element.nextSibling);
          new_node.focus();
          this.select_element(new_node);
          this.flag_recompute(['elements']);
          this.register_node_listeners(new_node);
        }
        else if (event.code == 'Delete' || event.code == 'KeyD') {
          this.selected_element.parentNode.removeChild(this.selected_element);
          this.deselect_element();
          this.flag_recompute(['elements']);
        }
      }
    },
    select_element: function(el) {
      if (el != this.$refs.content) {
        this.deselect_element();
        this.selected_element = el;
        this.$emit('selected_element', this.selected_element)
      }
    },
    deselect_element: function() {
      if (this.selected_element) {
        this.selected_element = null;
        this.nearest_element = null;
      }
    },
    update_highlighting() {
      if (this.drop_target && !this.is_align_target_in_range) {
        this.drop_target.classList.add('drop');
      } else if (this.drop_target) {
        this.drop_target.classList.remove('drop');
      }

      if (this.align_target) {
        let align_to = this.align_target.element;
        let direction = this.align_target.direction;
        if (this.is_align_target_in_range) {
          if (direction == 'left') {
            align_to.classList.add('align_to_left');
          } else if (direction == 'right') {
            align_to.classList.add('align_to_right');
          } else if (direction == 'top') {
            align_to.classList.add('align_to_top');
          } else if (direction == 'bottom') {
            align_to.classList.add('align_to_bottom');
          }
          if (align_to.parentElement) { align_to.parentElement.classList.add('drop'); }

        } else {
          align_to.classList.remove('align_to_left');
          align_to.classList.remove('align_to_right');
          align_to.classList.remove('align_to_top');
          align_to.classList.remove('align_to_bottom');
          if (align_to.parentElement) { align_to.parentElement.classList.remove('drop'); }
        }
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
    align_left: function() {
      if (this.selected_element) {
        if (this.selected_element.parentNode.style.display == "flex") {
          let previous_sibling = this.selected_element.previousElementSibling;
          if (previous_sibling) {
            previous_sibling.style.marginLeft = (previous_sibling.style.marginLeft == 'auto' ? 0 : previous_sibling.style.marginLeft);
            previous_sibling.style.marginRight = (previous_sibling.style.marginRight == 'auto' ? 0 : previous_sibling.style.marginRight);
          }
          this.selected_element.style.marginLeft = 0;
          this.selected_element.style.marginRight = 'auto';
          this.selected_element.style.transform = null;
          this.code_updated();
          this.$refs.styles_pane.update();
        }
      }
    },
    align_right: function() {
      if (this.selected_element) {
        let next_sibling = this.selected_element.nextElementSibling;
        if (next_sibling) {
          next_sibling.style.marginLeft = (next_sibling.style.marginLeft == 'auto' ? 0 : next_sibling.style.marginLeft);
          next_sibling.style.marginRight = (next_sibling.style.marginRight == 'auto' ? 0 : next_sibling.style.marginRight);
        }
        if (this.selected_element.parentNode.style.display == "flex") {
          this.selected_element.style.marginLeft = 'auto';
          this.selected_element.style.marginRight = 0;
          this.selected_element.style.transform = null;
          this.code_updated();
          this.$refs.styles_pane.update();
        }
      }
    },
    align_center_v: function() {
      if (this.selected_element) {
        if (this.selected_element.parentNode.style.display != "flex") {
          let parent_node = this.selected_element.parentNode;
          let new_container = document.createElement("div");
          new_container.style.display = 'flex';
          parent_node.insertBefore(new_container, this.selected_element);
          parent_node.removeChild(this.selected_element);
          new_container.appendChild(this.selected_element);
        }
        this.selected_element.style.marginLeft = 'auto';
        this.selected_element.style.marginRight = 'auto';
        this.selected_element.style.transform = null;
        this.code_updated();
        this.$refs.styles_pane.update();       
      }
    },
    set_code: function(code) {
      this.$data.code = code;
    },
    register_node_listeners(node, deep=true) {
      let nodes = [node];
      if (deep) {
        const nodeIterator = document.createNodeIterator(
            this.$refs.content,
            NodeFilter.SHOW_ELEMENT,
            (node) => {
              return node != this.$refs.content;
            }
        );
        for (let e = nodeIterator.nextNode(); e != null; e=nodeIterator.nextNode()) {
          nodes.push(e);
        }
      }

      for (node of nodes) {
        interact(node).unset(); // Remove any actions and event listeners already set on the node
        interact(node).draggable({
            onstart: (event) => {
              this.$nextTick(() => {
                this.$store.commit('drag_event', event);
                this.$store.commit('push_drag_context', {
                    name: 'element',
                    el: event.target.outerHTML
                });
              });
            },
            onmove: (event) => {
              this.$store.commit('drag_event', event);
              this.code_updated();
            },
            onend: (event) => {
              this.$store.commit('drag_event', event);
              this.$store.commit('push_drag_context', {});
              this.align_target = null;
            }
          },
        );

        interact(node).dropzone({}).on('dragenter', (event) => {
          let dragged_element = this.$store.state.drag_view.$el;
          if (!this.selected_element || (dragged_element != this.selected_element.parentElement)) {
            this.drop_target = event.target;
          }
        }).on('dragleave', (event) => {
          this.drop_target = null;
        }).on('drop', (event) => {
          var dragged_element = this.$store.state.drag_view.$el.children[0].cloneNode(true);
          if (this.elements.includes(event.relatedTarget)) {
            dragged_element = event.relatedTarget;
            event.relatedTarget.parentNode.removeChild(event.relatedTarget);
          }

          if (this.align_target && this.is_align_target_in_range) {
            if (this.align_target.direction == 'top' || this.align_target.direction == 'left') {
              this.align_target.element.parentElement.insertBefore(dragged_element, this.align_target.element.nextSibling);
            } else {
              this.align_target.element.parentElement.insertBefore(dragged_element, this.align_target.element);
            }
          } else {
            event.target.appendChild(dragged_element);
          }
          this.align_target = null;
          this.drop_target = null;
          this.selected_element = null;
          this.$nextTick(() => {
            this.flag_recompute(['elements']); // Because $this.code is binded with v-html, changes to it are not detected by the reactivity system.
            this.register_node_listeners(dragged_element, true);
          });
        }).on('dropmove', (event) => {
          // Highlight nearby elements - find nearest coords
          let dragged_element = this.$store.state.drag_view.$el;
          if (!dragged_element.innerHTML) { return; }

          let point = {
            x: dragged_element.getBoundingClientRect().x,
            y: dragged_element.getBoundingClientRect().y
          }
          let nearest_element = find_closest_element_to_point(point, this.elements);
          if (nearest_element) {
            this.align_target = nearest_element;
          }
          else {
            this.align_target = null;
          }
        });
      }
    }
  }
}
</script>

<style scoped>
    .render_pane {
        width: 100%;
    }
    .render_pane >>> .content:focus {
      outline: none;
    }
    .render_pane >>> .selected {
      outline: 2px dashed rgb(180, 200, 255);
      z-index: 99999;
    }
    .render_pane >>> .dragging {
      opacity: 0.8;
    }

    .render_pane >>> .drop {
      outline: 2px dashed rgb(255, 200, 180);
      z-index: 99999;
    }
    .render_pane >>> .align_to_left {
      box-shadow: -2px 0 rgb(180, 200, 255);
     }
    .render_pane >>> .align_to_right {
      box-shadow: 2px 0 rgb(180, 200, 255);
    }
    .render_pane >>> .align_to_top {
      box-shadow: 0 -2px rgb(180, 200, 255);
    }
    .render_pane >>> .align_to_bottom {
      box-shadow: 0 2px rgb(180, 200, 255);
    }

    .render_pane >>> .styles_pane {
      order: 2;
      width: 25rem;
    }
    .render_pane >>> .CodeMirror {
      height: auto;
    }

    .render_pane >>> .tools {
      font-family: 'Courier New', Courier, monospace;
      color: rgb(50, 50, 50);
      border-left: 1px solid rgb(200, 200, 200);
      padding: 1rem;
    }
    .render_pane >>> .tools .section {
      border-bottom: 1px solid rgb(200, 200, 200);
      padding-bottom: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .render_pane >>> .tools .section:last-child {
      border-bottom: none;
    }
    .render_pane >>> .tools .button {
      box-sizing: content-box;
      padding-right: 1rem;
    }
    .render_pane >>> .tools .button:hover {
      opacity: 0.25;
      cursor: pointer;
    }
    .render_pane >>> .content {
      padding: 1rem;
      overflow: hidden;
    }
</style>
