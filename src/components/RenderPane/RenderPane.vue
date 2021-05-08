<template>
    <div class="render_pane flex flex-col">
      <div class="flex flex-row flex-1">

        <div v-html="code" ref="content" v-on:mousedown="mousedown" class="content flex-1"></div>
        <div class="tools">
          <div class="section">
            <h3 class="font-bold">Alignment</h3>
            <div class="flex flex-row">
              <div v-on:click="align_left" class="button">ATL</div>
              <div v-on:click="align_center_v" class="button">ATC</div>
              <div v-on:click="align_right" class="button">ATR</div>
            </div>
          </div>

          <div class="section">
            <h3 class="font-bold text-base">Inline Styles</h3>
            <StylesPane ref="styles_pane" v-bind:element="selected_element" v-on:css_updated="update_selected_element_css"/>
          </div>
          <div class="section">
            <h3 class="font-bold text-base">Classes</h3>
            <ClassEditor v-bind:classes="this.selected_element_classes"/>
          </div>
          <div class="section">
            <h3 class="font-bold text-base">Components</h3>
          </div>
        </div>
      </div>
    </div>
</template>

<script>

import StylesPane from './StylesPane.vue'
import ClassEditor from './ClassEditor.vue'
import interact from 'interactjs'
import find_closest_element from '@/js/utils';

export default {
  name: 'RenderPane',
  components: {
    StylesPane,
    ClassEditor
  },
  data () {
    return {
      code: null,
      selected_element: null,
      align_target: null,
      drop_target: null
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
    selected_element_classes: function() {
      if (this.selected_element) {
        return this.selected_element.classList;
      }
      return null;
    }
  },
  mounted: function() {
    // https://www.raymondcamden.com/2019/08/12/working-with-the-keyboard-in-your-vue-app
    // Setting the tabindex on the content div could also work
    window.addEventListener("keypress", e => {
        if (e.code == 'Delete' && this.selected_element) {
          this.selected_element.parentNode.removeChild(this.selected_element);
          this.deselect_element();
        }
    });
  },
  watch: {
    // Update interact.js when html updated
    code: function() {
      this.$nextTick(() => {
        for (const node of this.elements) {
          let component = this;
          interact(node).draggable({
              // modifiers: [
              //   interact.modifiers.restrict({
              //     restriction: 'parent'
              //   })
              // ],
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

                  // Highlight nearby elements - find nearest coords
                  let nearest_element = find_closest_element(event.target, component.elements);
                  if (nearest_element) {
                    component.align_target = nearest_element;
                  }
                  else {
                    component.align_target = null;
                  }
                }
              },
          }).on('dragstart', function(event) {
            event.target.classList.add('dragging');
          })
          .on('dragend', function(event) {
            event.target.classList.remove('dragging');
            component.align_target = null;
          });

          interact(node).dropzone({}).on('dragenter', function (event) {
            component.drop_target = event.target;
          }).on('dragleave', function(event) {
            component.drop_target = null;
          }).on('drop', function(event) {
            component.drop_target = null;
            event.relatedTarget.parentNode.removeChild(event.relatedTarget);
            if (component.align_target) {
              if (component.align_target.direction == 'top' || component.align_target.direction == 'left') {
                component.align_target.element.parentElement.insertBefore(event.relatedTarget, component.align_target.element.nextSibling);
              } else {
                component.align_target.element.parentElement.insertBefore(event.relatedTarget, component.align_target.element);
              }
            } else {
              event.target.appendChild(event.relatedTarget);
            }
            event.relatedTarget.style.transform = null;
          });
        }
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
    mousedown: function(event) {
      this.select_element(event.target);
    },
    keyup: function(key) {
      alert();
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
      if (!this.selected_element) { return; }

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
    }
  }
}

</script>

<style scoped>
    .render_pane {
        width: 100%;
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
      box-shadow: 2px 0 rgb(180, 200, 255);
     }
    .render_pane >>> .align_to_right {
      box-shadow: -2px 0 rgb(180, 200, 255);
    }
    .render_pane >>> .align_to_top {
      box-shadow: 0 2px rgb(180, 200, 255);
    }
    .render_pane >>> .align_to_bottom {
      box-shadow: 0 -2px rgb(180, 200, 255);
    }

    .render_pane >>> .styles_pane {
      order: 2;
      width: 25rem;
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

    /* Temporary Styles */
    .render_pane >>> .content .modal {
      padding: 1rem;
      box-shadow: rgba(0, 0, 0, 0.15) 0px 0.15rem 3rem;
      border-radius: 0.5rem;
      background: rgb(255, 255, 255);
    }
    .render_pane >>> .content .btn {
      background-color: rgb(80, 150, 80);
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      color: rgb(255, 255, 255);
    }
    .render_pane >>> .content .btn.btn_secondary {
      background-color: rgb(80, 80, 80);
    }
</style>
