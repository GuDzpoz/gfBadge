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
              bg-color="warning" class="ma2" height="1.6rem">
      <w-icon class="mr2">mdi mdi-image-move</w-icon>
      {{ t("btnExportPNG") }}
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
        <AdjutantSelector v-model="ui.adjutant.url" :dolls="typedDolls" :urlbase="skinBase" />
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
    <w-notification v-model="showNotice" :timeout="noticeTimeout"
                    warning plain round shadow>
      {{ notice }}
    </w-notification>
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
import { icons } from './assets/icons.js'
import { backgrounds } from './assets/backgrounds.js'

const dollTypes = ['AR', 'SMG', 'RF', 'HG', 'SG', 'MG', 'SF']

const uiVersion = '20210625'

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
      dolls: icons,
      iconBase: '',
      skinBase: '',
      thumbnail: false,
      mod: false,
      showNotice: false,
      notice: '',
      noticeTimeout: 5000,
      ui: {
        version: uiVersion,
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
        },
        hexagons: {
          opacity: 0.7,
        },
      }
    }
  },
  created () {
    this.iconBase = this.dolls['_']
    this.skinBase = this.dolls['__']
    delete this.dolls['_']
    delete this.dolls['__']
    Object.values(this.dolls).forEach(doll => {
      doll.icon = this.iconBase + '/' + doll.icon
      doll.moddedIcon = this.iconBase + '/' + doll.moddedIcon
    })
  },
  computed: {
    backgrounds () {
      return Object.keys(backgrounds).filter(name => name !== '_').map(name => {
        return { 'label': name, 'value': backgrounds['_'] + '/' + backgrounds[name] }
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
        var config = JSON.parse(localStorage.config)
        this.loadConfig(config)
      }
    },
    loadFromFile () {
      fileOpen({
        mimeTypes: ['application/json']
      }).then(blob => blob.text())
        .then(text => {
          this.loadConfig(JSON.parse(text))
        })
    },
    loadConfig (config) {
      var incompatibility = false
      // unversioned configurations
      if(config.background?.url?.indexOf('gfwiki.org') !== -1) {
        delete config.background.url
        incompatibility = true
      }
      if(config.adjutant?.url?.indexOf('gfwiki.org') !== -1) {
        delete config.adjutant.url
        incompatibility = true
      }
      if(config.collection.Coalition) {
        config.collection.SF = config.collection.Coalition
        delete config.collection.Coalition
        incompatibility =true
      }

      // versioned configurations
      if(config.version === '20210625') {
        incompatibility = false
      }

      if(incompatibility) {
        this.notify(this.t('versionChanged'))
      }
      this.ui = this.deepMerge(this.ui, config)
      this.ui.version = uiVersion
    },
    notify (message) {
      this.notice = message
      this.showNotice = true
    },
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
      return Object.values(this.dolls).filter(doll => doll.type === type)
    },
    filterModDolls (type) {
      var dolls = this.shallowCopyArray(Object.values(this.dolls).filter(doll =>
        doll.type === type && doll.modded
      ))
      dolls.forEach(doll => {
        doll.icon = doll.moddedIcon
        doll.rarity = doll.modRarity
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
