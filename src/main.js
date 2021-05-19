import Vue from 'vue';
import Vuex from "vuex";
import App from './App.vue';

import codemirror from 'vue-codemirror';
// require styles
import 'codemirror/lib/codemirror.css';
// require more codemirror resource...
import 'codemirror/mode/htmlmixed/htmlmixed.js';
import 'codemirror/mode/css/css.js';
import 'codemirror/theme/base16-light.css';

Vue.use(Vuex)
Vue.use(codemirror, { 
  options: {
    mode: 'htmlmixed',
    theme: 'base16-light',
    lineNumbers: true,
    lineWrapping: true
  }
});

const store = new Vuex.Store({
  state: {
    // Dragging
    drag_view: null,
    drag_context: {},
    drag_event: null,
    // Components
    components: [
      {
        name: 'modal',
        html: '<div class="example modal"><p>This is a modal component</p></div>'
      },
      {
        name: 'button',
        html: '<button class="example btn">This is a button component</button>'
      }
    ]
  },
  mutations: {
    mount_drag_view(state, payload) {
      state.drag_view = payload;
    },
    drag_event(state, event) {
      state.drag_event = event;
    },
    push_drag_context(state, payload) {
      state.drag_context = payload;
    }
  }
});

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
