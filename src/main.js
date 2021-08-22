import { createApp } from 'vue'
import Loader from './Loader.vue'
import { jsonTexts } from './assets/langs.js'
import { createI18n } from 'vue-i18n'
import WaveUI from 'wave-ui'
import 'wave-ui/dist/wave-ui.css'
import '@mdi/font/css/materialdesignicons.min.css'

const i18n = createI18n(jsonTexts)

const app = createApp(Loader)
new WaveUI(app, {})
app.use(i18n)
app.mount('#app')
