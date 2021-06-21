<template>
<w-app>
  <w-flex wrap>
    <w-select :items="servers" v-model="server"
              :label="t('selectServer')"
              outline shadow class="title3 xs5 ma3"
              label-position="inside"
              inner-icon-left="mdi mdi-server title4" />
    <w-select :items="langs" v-model="$i18n.locale"
              :label="t('selectLang')"
              outline shadow class="title3 xs5 ma3"
              label-position="inside"
              inner-icon-left="mdi mdi-translate title4" />
    <h1 class="xs12 ma5">{{ t("title") }}</h1>
    <DollCollection :ui="ui"
                    :dolls="typedAllDolls" :modDolls="typedModDolls"
                    :background="ui.background" :adjutant="ui.adjutant"
                    ref="canvas"
                    :thumbnail="thumbnail" :mod="mod"
                    class="xs12" />
    <w-switch v-model="mod" thin :label="t('tabMod.title')" />
    <w-switch v-model="thumbnail" thin :label="t('thumbnail')" />
    <w-button @click="saveToLocal()"
              bg-color="success" class="ma2" height="1.6rem">
      <w-icon class="mr2">mdi mdi-database-import</w-icon>
      {{ t("btnSaveCfg") }}
    </w-button>
    <w-button @click="loadFromLocal()"
              bg-color="success" class="ma2" height="1.6rem">
      <w-icon class="mr2">mdi mdi-database-export</w-icon>
      {{ t("btnLoadCfg") }}
    </w-button>
    <w-button @click="saveToFile"
              bg-color="info" class="ma2" height="1.6rem">
      <w-icon class="mr2">mdi mdi-download</w-icon>
      {{ t("btnSaveCfgJSON") }}
    </w-button>
    <w-button @click="loadFromFile"
              bg-color="info" class="ma2" height="1.6rem">
      <w-icon class="mr2">mdi mdi-upload</w-icon>
      {{ t("btnLoadCfgJSON") }}
    </w-button>
    <w-button @click="saveToImage"
              disabled
              bg-color="warning" class="ma2" height="1.6rem">
      <w-icon class="mr2">mdi mdi-image-move</w-icon>
      {{ t("btnExportPNG") + ' (' + t("rightClickToSave") + ')' }}
    </w-button>
    <w-tabs :items="[{}, {}, {}, {}, {}, {}, {}]"
            card class="xs12 ma2 mb6">
      <template v-slot:[`item-title.1`]>
        <w-icon class="mr2">mdi mdi-face-woman</w-icon>
        {{ t('tabPoster.title') }}
      </template>
      <template v-slot:[`item-content.1`]>
        <DollSelector v-model="ui.collection" :dolls="typedAllDolls" />
      </template>
      <template v-slot:[`item-title.2`]>
        <w-icon class="mr2">mdi mdi-face-woman-shimmer</w-icon>
        {{ t("tabMod.title") }}
      </template>
      <template v-slot:[`item-content.2`]>
        <DollSelector v-model="ui.modCollection" :dolls="typedModDolls" />
      </template>
      <template v-slot:[`item-title.3`]>
        <w-icon class="mr2">mdi mdi-account-alert</w-icon>
        {{ t("tabTeam.title") }}
      </template>
      <template v-slot:[`item-content.3`]>
        <AdjutantSelector v-model="ui.adjutant.url" :dolls="typedDolls" />
      </template>
      <template v-slot:[`item-title.4`]>
        <w-icon class="mr2">mdi mdi-camera-image</w-icon>
        {{ t('tabBackground.title') }}
      </template>
      <template v-slot:[`item-content.4`]>
        <w-radios :items="backgrounds" v-model="ui.background.url" inline />
      </template>
      <template v-slot:[`item-title.5`]>
        <w-icon class="mr2">mdi mdi-information</w-icon>
        {{ t('tabGeneral.title') }}
      </template>
      <template v-slot:[`item-content.5`]>
        <PlayerInfo v-model="ui.info" />
      </template>
      <template v-slot:[`item-title.6`]>
        <w-icon class="mr2">mdi mdi-tune</w-icon>
        {{ t("tabAdjust.title") }}
      </template>
      <template v-slot:[`item-content.6`]>
        <ParameterDashboard v-model="ui" />
      </template>
      <template v-slot:[`item-title.7`]>
        <w-icon class="mr2">mdi mdi-license</w-icon>
      </template>
      <template v-slot:[`item-content.7`]>
        <License />
      </template>
    </w-tabs>
    <div class="placeholderDiv"></div>
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
import { fileOpen, fileSave } from 'browser-fs-access'
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
          x: -70,
          y: -230,
          scale: 1,
          opacity: 1,
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
    saveToFile () {
      var blob = new Blob([JSON.stringify(this.ui)],
                           {type: "application/json;charset=utf-8"})
      fileSave(blob, {
        fileName: 'gfBadgeConfig.json',
        extensions: ['.json']
      })
    },
    loadFromLocal () {
      if(localStorage.config) {
        this.ui = this.deepMerge(this.ui, JSON.parse(localStorage.config))
      }
    },
    loadFromFile () {
      fileOpen({
        mimeTypes: ['application/json']
      }).then(blob => blob.text())
        .then(text => {
          this.ui = this.deepMerge(this.ui, JSON.parse(text))
        })
    },
    // not until GFWiki allows CORS uses
    // or we store the images locally
    saveToImage () {
      this.$refs.canvas.getCanvas().toBlob(blob => {
        fileSave(blob, {
          fileName: 'gfBadge.png',
          extensions: ['.png'],
        })
      }, 'image/png')
    },
    // keep the normal (current config) structured as always
    deepMerge (normal, residue) {
      if(normal === undefined
         || normal === null
         || typeof(normal) === 'number'
         || typeof(normal) === 'boolean'
         || typeof(normal) === 'bigint'
         || typeof(normal) === 'string'
         || Array.isArray(normal)) {
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
      var dolls = this.shallowCopyArray(this.dolls.filter(doll =>
        doll['data-tdoll-class'] === type && doll['data-mod'] === '1'
      ))
      dolls.forEach(doll => {
        doll['data-avatar'] = doll['data-avatar-mod']
        doll['data-rarity'] = doll['data-mod-rarity']
      })
      return dolls
    },
    shallowCopyArray (value) {
      var copy = []
      for(var entry of value) {
        copy.push(Object.assign({}, entry))
      }
      return copy
    }
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

div.placeholderDiv {
  height: 80vh;
  content: "";
}
</style>
