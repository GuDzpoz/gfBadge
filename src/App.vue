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
    <Title :title="t('title')"></Title>
    <DollCollection :ui="ui"
                    :dolls="typedAllDolls" :modDolls="typedModDolls"
                    :background="ui.background" :adjutant="ui.adjutant"
                    ref="canvas"
                    :thumbnail="thumbnail" :mod="mod"
                    class="xs12" />
    <div class="buttonSwitch">
      <w-button :color="mod ? 'info-dark2' : 'white'"
                :bg-color="mod ? 'info-light1' : 'info-dark2'"
                :height="mod ? '1.6em' : '3em'"
                :z-index="mod ? '0' : '1'"
                outline
                v-on:click="mod = !mod">
        {{ canvasSwitch[1].text }}
      </w-button>
      <w-button :bg-color="mod ? 'info-dark2' : 'info-light1'"
                :color="mod ? 'white' : 'info-dark2'"
                :height="mod ? '3em' : '1.6em'"
                :z-index="mod ? '1' : '0'"
                outline
                v-on:click="mod = !mod">
        {{ canvasSwitch[0].text }}
      </w-button>
    </div>
    <w-switch v-model="thumbnail"
              thin :label="t('thumbnail')" label-on-left class="ml5 mr3" />
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
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { fileOpen, fileSave } from 'browser-fs-access'
import Title from './components/Title'
const AdjutantSelector = defineAsyncComponent(() =>
  import(/* webpackChunkName: "adjutant" */
    './components/AdjutantSelector'))
const DollSelector = defineAsyncComponent(() =>
  import(/* webpackChunkName: "dolls" */
    './components/DollSelector'))
const DollCollection = defineAsyncComponent(() =>
  import(/* webpackChunkName: "canvas" */
    './components/DollCollection'))
const License = defineAsyncComponent(() =>
  import(/* webpackChunkName: "license" */
    './components/License'))
const ParameterDashboard = defineAsyncComponent(() =>
  import(/* webpackChunkName: "dash" */
    './components/ParameterDashboard'))
const PlayerInfo = defineAsyncComponent(() =>
  import(/* webpackChunkName: "info" */
    './components/PlayerInfo'))
import { jsonTexts } from './assets/langs.js'
import { icons } from './assets/icons.js'
import { backgrounds } from './assets/backgrounds.js'

const dollTypes = ['AR', 'SMG', 'RF', 'HG', 'SG', 'MG', 'SF']

const uiVersion = '20210726'

export default {
  name: 'App',
  components: {
    AdjutantSelector,
    DollSelector,
    DollCollection,
    License,
    ParameterDashboard,
    PlayerInfo,
    Title,
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
          statsForEX: true,
          statsForSF: false,
          highResolution: false,
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
          x: 480,
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
    canvasSwitch () {
      return this.$i18n.messages[this.$root.$i18n.locale]
        .canvasSwitch.options
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
          this.loadConfigCompatibly(JSON.parse(text))
        })
    },
    loadConfigCompatibly (config) {
      if('selectedPoster' in config && 'selectedMod' in config) {
        // sodamoe's version
        var localConfig = {
          version: undefined,
          collection: Object.fromEntries(dollTypes.map(type => [type, {}])),
          modCollection: Object.fromEntries(dollTypes.map(type => [type, {}])),
          info: {},
        }
        config.selectedPoster.guns.forEach(id => {
          if(id in icons) {
            localConfig.collection[icons[id].type][id] = true
          }
        })
        config.selectedMod.guns.forEach(id => {
          id = id.replace(/\D/g, '')
          if(id in icons) {
            localConfig.modCollection[icons[id].type][id] = true
          }
        })
        localConfig.info['name'] = config.selectedDebounce.userName
        localConfig.info['level'] = Number(config.selectedDebounce.userLevel).toString()
        localConfig.info['uid'] = config.selectedDebounce.userUid
        if(config.selectedDebounce.userServerCustom === '') {
          localConfig.info['server'] = config.selected.userServer
        } else {
          localConfig.info['server'] = config.selectedDebounce.userServerCustom
        }
        this.loadConfig(localConfig)
      } else {
        this.loadConfig(config)
      }
    },
    loadConfig (config) {
      var incompatibility = false

      switch(config.version) {
      case undefined:
        // unversioned configurations
        if(config.background?.url
           && config.background?.url?.indexOf('gfwiki.org') !== -1) {
          delete config.background.url
          incompatibility = true
        }
        if(config.adjutant?.url
           && config.adjutant?.url?.indexOf('gfwiki.org') !== -1) {
          delete config.adjutant.url
          incompatibility = true
        }
        if(config.collection.Coalition) {
          config.collection.SF = config.collection.Coalition
          delete config.collection.Coalition
          incompatibility =true
        }
        // fall through versioned configurations
      case '20210625':
        // fall through
      case '20210726':
        break
      default:
        incompatibility = true
        break
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

.buttonSwitch {
    display: flex;
    height: 3em;
}

.buttonSwitch .w-button {
  border-radius: 0;
}

.buttonSwitch .w-button:first-child {
  margin-right: -0.6em;
}
</style>
