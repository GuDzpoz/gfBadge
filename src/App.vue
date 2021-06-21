<template>
<w-app>
  <w-flex wrap>
    <w-select :items="servers" v-model="server" :label="t('selectServer')" class="title4 xs6" />
    <w-select :items="langs" v-model="$i18n.locale" :label="t('selectLang')" class="title4 xs6" />
    <h1 class="xs12 ma5">{{ t("title") }}</h1>
    <DollCollection :ui="ui"
                    :dolls="typedAllDolls" :modDolls="typedModDolls"
                    :background="ui.background" :adjutant="ui.adjutant"
                    :thumbnail="thumbnail" :mod="mod"
                    class="xs12" />
    <w-switch v-model="mod" thin :label="t('tabMod.title')" />
    <w-switch v-model="thumbnail" thin :label="t('thumbnail')" />
    <w-button @click="saveToLocal()" class="ma2">{{ t("btnSaveCfg") }}</w-button>
    <w-button @click="loadFromLocal()" class="ma2">{{ t("btnLoadCfg") }}</w-button>
    <w-tabs :items="[{}, {}, {}, {}, {}, {}, {}]" class="xs12 ma2 mb6">
      <template v-slot:[`item-title.1`]>
        {{ t('tabPoster.title') }}
      </template>
      <template v-slot:[`item-content.1`]>
        <DollSelector v-model="ui.collection" :dolls="typedAllDolls" />
      </template>
      <template v-slot:[`item-title.2`]>
        {{ t('tabBackground.title') }}
      </template>
      <template v-slot:[`item-content.2`]>
        <w-radios :items="backgrounds" v-model="ui.background.url" inline />
      </template>
      <template v-slot:[`item-title.3`]>
        {{ t('tabGeneral.title') }}
      </template>
      <template v-slot:[`item-content.3`]>
        <PlayerInfo v-model="ui.info" />
      </template>
      <template v-slot:[`item-title.4`]>
        *
      </template>
      <template v-slot:[`item-content.4`]>
        <License />
      </template>
      <template v-slot:[`item-title.5`]>
        {{ t("tabTeam.title") }}
      </template>
      <template v-slot:[`item-content.5`]>
        <AdjutantSelector v-model="ui.adjutant.url" :dolls="typedDolls" />
      </template>
      <template v-slot:[`item-title.6`]>
        {{ t("tabAdjust.title") }}
      </template>
      <template v-slot:[`item-content.6`]>
        <ParameterDashboard v-model="ui" />
      </template>
      <template v-slot:[`item-title.7`]>
        {{ t("tabMod.title") }}
      </template>
      <template v-slot:[`item-content.7`]>
        <DollSelector v-model="ui.modCollection" :dolls="typedModDolls" />
      </template>
    </w-tabs>
  </w-flex>
</w-app>
</template>

<script>
import AdjutantSelector from './components/AdjutantSelector'
import DollSelector from './components/DollSelector'
import DollCollection from './components/DollCollection'
import License from './components/License'
import ParameterDashboard from './components/ParameterDashboard'
import PlayerInfo from './components/PlayerInfo'
import { useI18n } from 'vue-i18n'
import { jsonTexts } from './assets/langs.js'
import { dolls } from './assets/dolls.js'
import { coalitionDolls } from './assets/coalition.js'
import { backgrounds } from './assets/backgrounds.js'

const dollTypes = ['AR', 'SMG', 'RF', 'HG', 'SG', 'MG']

export default {
  name: 'App',
  components: {
    AdjutantSelector,
    DollSelector,
    DollCollection,
    License,
    ParameterDashboard,
    PlayerInfo
  },
  setup() {
    const { t, locale } = useI18n()
    return { t, locale }
  },
  data () {
    return {
      server: jsonTexts.servers[0],
      dolls: dolls,
      thumbnail: false,
      mod: false,
      ui: {
        collection: {},
        modCollection: {},
        info: {
          name: '',
          uid: 0,
          level: 0,
          server: '',
          avatar: '',
        },
        background: {
          url: '',
          x: 50,
          y: -230,
          scale: 1,
          opacity: 0.7
        },
        adjutant: {
          url: '',
          x: 300,
          y: 100,
          scale: 0.45,
          opacity: 0.9
        }
      }
    }
  },
  created () {
  },
  computed: {
    backgrounds () {
      return Object.keys(backgrounds).map(name => {
        return { 'label': name, 'value': backgrounds[name] }
      })
    },
    langs () {
      return Object.keys(jsonTexts.langs).map((locale) => {
        return { 'label': jsonTexts.langs[locale], 'value': locale }
      })
    },
    servers () {
      return Object.keys(jsonTexts.servers).map((server) => {
        return { 'label': jsonTexts.servers[server], 'value': server }
      })
    },
    typedDolls () {
      var typed = {}
      if(this.dolls) {
        dollTypes.forEach(type => typed[type] = this.filterDolls(type))
      }
      return typed
    },
    typedAllDolls () {
      var dolls = this.typedDolls
      dolls['Coalition'] = coalitionDolls
      return dolls
    },
    typedModDolls () {
      var typed = {}
      if(this.dolls) {
        dollTypes.forEach(type => {
          typed[type] = this.filterModDolls(type)
        })
      }
      return typed
    },
  },
  methods: {
    saveToLocal () {
      localStorage.config = JSON.stringify(this.ui)
    },
    loadFromLocal () {
      if(localStorage.config) {
        this.ui = this.deepMerge(this.ui, JSON.parse(localStorage.config))
        console.log(this.ui.info)
      }
    },
    // keep the normal (current config) structured as always
    deepMerge (normal, residue) {
      if(Array.isArray(residue) || Array.isArray(normal)) {
        return residue
      } else if(
        normal === null
        || typeof(normal) === 'number'
        || typeof(normal) === 'boolean'
        || typeof(normal) === 'bigint'
        || typeof(normal) === 'string'
      ) {
        return residue
      } else {
        for(var key in residue) {
          normal[key] = this.deepMerge(normal[key], residue[key])
        }
        return normal
      }
    },
    filterDolls (type) {
      return this.dolls.filter(doll => doll['data-tdoll-class'] === type)
    },
    filterModDolls (type) {
      var dolls = this.dolls.filter(doll =>
        doll['data-tdoll-class'] === type && doll['data-mod'] === '1'
      )
      dolls.forEach(doll => doll['data-avatar'] = doll['data-avatar-mod'])
      return dolls
    },
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 1em;
}

h1 {
  text-align: center;
}
</style>
