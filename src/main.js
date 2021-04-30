import Vue from 'vue'
import App from './App.vue'

import codemirror from 'vue-codemirror'
// require styles
import 'codemirror/lib/codemirror.css'
// require more codemirror resource...
import 'codemirror/mode/htmlmixed/htmlmixed.js'
import 'codemirror/mode/css/css.js'
import 'codemirror/theme/base16-light.css'

// you can set default global options and events when use
Vue.use(codemirror, { 
  value: "function myScript(){return 100;}\n",
  options: {
    mode: 'htmlmixed',
    theme: 'base16-light',
    lineNumbers: true,
    lineWrapping: true
  }
});

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
