import { createApp } from 'vue'
import Loader from './Loader.vue'
import GfCheckbox from './components/ui/gf-checkbox.vue'
import GfSwitch from './components/ui/gf-switch.vue'
import { jsonTexts } from './assets/langs.js'
import { createI18n } from 'vue-i18n'
import WaveUI from 'wave-ui/src/wave-ui'
import '@mdi/font/css/materialdesignicons.min.css'
import './registerServiceWorker'

const i18n = createI18n(jsonTexts)

const app = createApp(Loader)
new WaveUI(app, {})
app.component('gf-checkbox', GfCheckbox)
app.component('gf-switch', GfSwitch)
app.use(i18n)
app.mount('#app')
