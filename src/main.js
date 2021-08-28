import { createApp } from 'vue'
import Loader from './Loader.vue'
import GfCheckbox from './components/ui/gf-checkbox.vue'
import GfSwitch from './components/ui/gf-switch.vue'
import { jsonTexts } from './assets/langs.js'
import { createI18n } from 'vue-i18n'
import '@mdi/font/css/materialdesignicons.min.css'
import workbox from './registerServiceWorker'
import WaveUI from 'wave-ui/src/wave-ui/core'
import {
  WApp,
  WAccordion,
  WAlert,
  WButton,
  WCard,
  WDialog,
  WFlex,
  WIcon,
  WInput,
  WList,
  WMenu,
  WNotification,
  WOverlay,
  WProgress,
  WSelect,
  WSlider,
  WSpinner,
  WTabs,
  WToolbar,
  WTooltip,
  WTransitionExpand,
} from 'wave-ui/src/wave-ui/components'

const i18n = createI18n(jsonTexts)

const app = createApp(Loader)

app.component('gf-checkbox', GfCheckbox)
app.component('gf-switch', GfSwitch)
app.use(WaveUI, {
  components: {
    WApp,
    WAccordion,
    WAlert,
    WButton,
    WCard,
    WDialog,
    WFlex,
    WIcon,
    WInput,
    WList,
    WMenu,
    WNotification,
    WOverlay,
    WProgress,
    WSelect,
    WSlider,
    WSpinner,
    WTabs,
    WToolbar,
    WTooltip,
    WTransitionExpand,
  }
})
new WaveUI(app, {})
app.provide('$workbox', workbox)
app.use(i18n)
app.mount('#app')
