import { createApp } from 'vue'
import Loader from './Loader.vue'
import GfCheckbox from './components/ui/gf-checkbox.vue'
import GfSwitch from './components/ui/gf-switch.vue'
import { jsonTexts } from './assets/langs.js'
import { createI18n } from 'vue-i18n'
import '@mdi/font/css/materialdesignicons.min.css'
import workbox from './registerServiceWorker'
import WaveUI from 'wave-ui/src/wave-ui'
import naive from 'naive-ui'

var lang = localStorage.getItem('lang')
if(lang) {
  jsonTexts.locale = lang
}

const i18n = createI18n(jsonTexts)

const app = createApp(Loader)

app.component('gf-checkbox', GfCheckbox)
app.component('gf-switch', GfSwitch)
app.use(WaveUI, {})
app.use(naive)
new WaveUI(app, {})
app.provide('$workbox', workbox)
app.use(i18n)
app.mount('#app')
