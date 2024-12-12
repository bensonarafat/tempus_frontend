import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { setupAuthPlugin } from '@/stores/modules/auth'

const pinia = createPinia()
const app = createApp(App)

app.use(router)
app.use(pinia)

// define your options
const globalOptions = {
  // debug: 'info',
  modules: {
    toolbar: ['bold', 'italic', 'underline'],
  },
  placeholder: 'Type out the story here...',
  theme: 'snow',
}
// set default globalOptions prop
QuillEditor.props.globalOptions.default = () => globalOptions
// register QuillEditor component

// Set up auth plugin
setupAuthPlugin(app)

app.component('QuillEditor', QuillEditor)
app.mount('#app')
