<template>
<w-app>
  <Title :title="t('title')"></Title>
  <w-flex wrap class="column">
    <w-flex class="row justify-end fill-width">
      <w-select :items="servers" v-model="server"
                :label="t('selectServer')"
                outline class="title3 xs5 ma3 gf-select server-later white"
                label-position="left"
                inner-icon-left="mdi mdi-server title4" />
      <w-select :items="langs" v-model="$i18n.locale"
                :label="t('selectLang')"
                outline class="title3 xs5 ma3 gf-select language-later white"
                label-position="left"
                inner-icon-left="mdi mdi-translate title4" />
    </w-flex>
    <DollCollection :ui="ui"
                    :dolls="typedAllDolls" :modDolls="typedModDolls"
                    :background="ui.background" :adjutant="ui.adjutant"
                    ref="canvas"
                    :thumbnail="thumbnail" :mod="mod === 'mod'"
                    class="xs12" />
    
    <w-flex wrap class="row fill-width">
      <w-flex class="row fill-width" wrap>
        <gf-switch :labels="{iop: canvasSwitch[1].text, mod: canvasSwitch[0].text}"
                   v-model="mod"/>
        <gf-checkbox v-model="thumbnail"
                     :label="t('thumbnail')" class="ml5 mr3" />
      </w-flex>
      <w-flex class="shadowDropper row" wrap>
        <w-tooltip top :detach-to="true">
          <template #activator="{ on }">
            <w-button @click="saveToLocal()" lg v-on="on"
                      bg-color="success" class="ma2 gf-button gf-cancel">
              <w-icon class="mr2">mdi mdi-database-import</w-icon>
              {{ t("btnSaveCfg") }}
            </w-button>
          </template>
          {{ $t('ui.saveCfgTip') }}
        </w-tooltip>
        <w-tooltip top :detach-to="true">
          <template #activator="{ on }">
            <w-button @click="loadFromLocal()" lg v-on="on"
                      bg-color="success" class="ma2 gf-button gf-cancel">
              <w-icon class="mr2">mdi mdi-database-export</w-icon>
              {{ t("btnLoadCfg") }}
            </w-button>
          </template>
          {{ $t('ui.loadCfgTip') }}
        </w-tooltip>
        <w-tooltip top :detach-to="true">
          <template #activator="{ on }">
            <w-button @click="saveToFile" lg v-on="on"
                      bg-color="info" class="ma2 gf-button gf-cancel">
              <w-icon class="mr2">mdi mdi-download</w-icon>
              {{ t("btnSaveCfgJSON") }}
            </w-button>
          </template>
          {{ $t('ui.saveCfgJSONTip') }}
        </w-tooltip>
        <w-tooltip top :detach-to="true">
          <template #activator="{ on }">
            <w-button @click="loadFromFile" lg v-on="on"
                      bg-color="info" class="ma2 gf-button gf-cancel">
              <w-icon class="mr2">mdi mdi-upload</w-icon>
              {{ t("btnLoadCfgJSON") }}
            </w-button>
          </template>
          {{ $t('ui.loadCfgJSONTip') }}
        </w-tooltip>
        <w-button @click="saveToImage" lg
                  bg-color="warning" class="ma2 gf-button gf-ok">
          <w-icon class="mr2">mdi mdi-image-move</w-icon>
          {{ t("btnExportPNG") }}
        </w-button>
      </w-flex>
    </w-flex>
    
    <w-tabs :items="[{}, {}, {}, {}, {}, {}, {}]"
            card class="pa4 mb6 gf-tabs white-tabs fill-width">
      <template v-slot:[`item-title.1`]>
        <img src="/images/assets/doll.png" class="gf-icon mr2" />
        {{ t('tabPoster.title') }}
      </template>
      <template v-slot:[`item-content.1`]>
        <DollSelector v-model="ui.collection"
                      :dolls="typedAllDolls"
                      :keepAlive="'doll'" />
        <!-- until w-tabs supports <keep-alive> -->
      </template>
      <template v-slot:[`item-title.2`]>
        <img src="/images/assets/mod3.png" class="gf-icon mr2" />
        {{ t("tabMod.title") }}
      </template>
      <template v-slot:[`item-content.2`]>
        <DollSelector v-model="ui.modCollection"
                      :dolls="typedModDolls"
                      :keepAlive="'mod'" />
        <!-- until w-tabs supports <keep-alive> -->
      </template>
      <template v-slot:[`item-title.3`]>
        <w-icon class="mr2">mdi mdi-face-woman</w-icon>
        {{ t("tabTeam.title") }}
      </template>
      <template v-slot:[`item-content.3`]>
        <AdjutantSelector v-model="ui.adjutant.url"
                          :dolls="typedDolls"
                          :urlbase="skinBase"
                          :iconurlbase="iconBase"
                          :keepAlive="'adjutant'"
                          class="pa4" />
        <!-- until w-tabs supports <keep-alive> -->
      </template>
      <template v-slot:[`item-title.4`]>
        <w-icon class="mr2">mdi mdi-camera-image</w-icon>
        {{ t('tabBackground.title') }}
      </template>
      <template v-slot:[`item-content.4`]>
        <Backgrounds v-model="ui.background.url" class="pa4" />
      </template>
      <template v-slot:[`item-title.5`]>
        <w-icon class="mr2">mdi mdi-information</w-icon>
        {{ t('tabGeneral.title') }}
      </template>
      <template v-slot:[`item-content.5`]>
        <PlayerInfo v-model="ui.info" class="pa4" />
      </template>
      <template v-slot:[`item-title.6`]>
        <w-icon class="mr2">mdi mdi-tune</w-icon>
        {{ t("tabAdjust.title") }}
      </template>
      <template v-slot:[`item-content.6`]>
        <ParameterDashboard v-model="ui" class="pa4" />
      </template>
      <template v-slot:[`item-title.7`]>
        <w-icon class="mr2">mdi mdi-license</w-icon>
      </template>
      <template v-slot:[`item-content.7`]>
        <License class="pa4" />
      </template>
    </w-tabs>
    <w-dialog v-model="workerNotice" persistent persistent-no-animation
              class="gf-dialog" width="50vw">
      发现了签名图生成器的新版本（可能包含新人形或是错漏修复）。是否更新缓存使用新版本？
      <LoadingSpinner v-if="messageSent" />
      <template #actions>
        <w-button @click="workerNotice = false" lg
                  bg-color="info" class="ma2 gf-button gf-cancel">
          <w-icon class="mr2">mdi mdi-close-box</w-icon>
          使用旧版本
        </w-button>
        
        <w-button @click="skipToNewWorker" lg
                  bg-color="sucess" class="ma2 gf-button gf-ok">
          <w-icon class="mr2">mdi mdi-checkbox-marked</w-icon>
          加载新版本
        </w-button>
      </template>
    </w-dialog>
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
import LoadingSpinner from './components/LoadingSpinner'
const AdjutantSelector = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "adjutant" */
    './components/AdjutantSelector'),
  loadingComponent: LoadingSpinner,
  delay: 50,
})
const Backgrounds = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "dolls" */
    './components/Backgrounds'),
  loadingComponent: LoadingSpinner,
  delay: 50,
})
const DollSelector = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "dolls" */
    './components/DollSelector'),
  loadingComponent: LoadingSpinner,
  delay: 50,
})
const DollCollection = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "canvas" */
    './components/DollCollection'),
  loadingComponent: LoadingSpinner,
  delay: 50,
})
const License = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "license" */
    './components/License'),
  loadingComponent: LoadingSpinner,
  delay: 50,
})
const ParameterDashboard = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "dash" */
    './components/ParameterDashboard'),
  loadingComponent: LoadingSpinner,
  delay: 50,
})
const PlayerInfo = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "info" */
    './components/PlayerInfo'),
  loadingComponent: LoadingSpinner,
  delay: 50,
})
import { jsonTexts } from './assets/langs.js'
import { icons } from './assets/icons.js'

const dollTypes = ['AR', 'SMG', 'RF', 'HG', 'MG', 'SG', 'SF']

const uiVersion = '20210726'

export default {
  name: 'App',
  components: {
    AdjutantSelector,
    Backgrounds,
    DollSelector,
    DollCollection,
    License,
    ParameterDashboard,
    PlayerInfo,

    Title,
    LoadingSpinner,
  },
  inject: {
    $workbox: {
      from: '$workbox',
    },
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
      mod: 'iop',
      showNotice: false,
      workerNotice: false,
      messageSent: false,
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
          dateStamp: false,
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
    if(this.$workbox) {
      this.$workbox.addEventListener('waiting', () => {
        this.workerNotice = true
      })
    }
  },
  computed: {
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
    skipToNewWorker () {
      this.messageSent = true
      this.$workbox.messageSW({ type: "SKIP_WAITING" })
    },
    saveToLocal () {
      localStorage.config = JSON.stringify(this.ui)
    },
    saveToFile () {
      var blob = new Blob([JSON.stringify(this.ui)],
                           {type: "application/json"})
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
    keyingId (id) {
      if(id[0] === 'c') {
        return parseInt(id.substring(1))
      } else {
        return parseInt(id)
      }
    },
    filterDolls (type) {
      return Object.values(this.dolls)
        .filter(doll => doll.type === type)
        .sort((a, b) => this.keyingId(a.id) - this.keyingId(b.id))
    },
    filterModDolls (type) {
      var dolls = this.shallowCopyArray(Object.values(this.dolls).filter(doll =>
        doll.type === type && doll.modded
      )).sort((a, b) => this.keyingId(a.id) - this.keyingId(b.id))
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
    },
  }
}
</script>

<style lang="scss">
@import url('https://fonts.proxy.ustclug.org/css2?family=Noto+Serif+SC:wght@700;900&display=swap');
@import url('https://fonts.proxy.ustclug.org/css2?family=Michroma&display=swap');

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    color: #2c3e50;
    margin: 0;
    /* webpackIgnore: true */
    background: url(/images/assets/BG_factory.png);
    background-attachment: fixed;
    background-position: center;
    background-size: cover;
}

h1 {
    text-align: center;
}

div.placeholderDiv {
    height: 80vh;
    content: "";
}

.w-accordion__item-title {
    flex-wrap: wrap;
}

.w-flex.wrap.row-reverse {
    flex-direction: row-reverse;
}

$SimSun: "Noto Serif SC", "SimSun", "宋体", "NSimSun", "STSong", "FangSong", "serif";
.gf-tabs .w-tabs__bar-item {
    font-family: $SimSun;
    font-weight: 900;
    background-color: #8d8d8d;
    border-radius: 3px 3px 0 0;
    margin-right: 0.2em;
    color: #313131;
    box-shadow: 0 -0.5em 0.5em #818183 inset;
    text-shadow: 0 0 3px white;
}

.gf-tabs .w-tabs__bar-item.w-tabs__bar-item--active {
    color: #313131;
    background-color: #f4ab00;
    box-shadow: none;
    text-shadow: none;
}

.gf-tabs .w-tabs__bar {
    border-bottom: 2px solid;
    border-image: linear-gradient(to right,#f4ab00, #f4ab00 50%, #f4ab0000 80%) 1;
}

img.gf-icon {
    height: 1.2em;
}

$gf-button-corner-clip: 0.4em;
button.w-button.gf-button {
    border-radius: 0;
    color: #323232;
    clip-path: #{'polygon(0 0, 0 100%, calc(100% - '}$gf-button-corner-clip#{') 100%, 100% calc(100% - '}$gf-button-corner-clip#{'), 100% 0)'};
    font-family: $SimSun;
    font-weight: 900;
}

button.w-button.gf-ok {
    background: linear-gradient(#ffe31d, #ffc802 50%, #fdb300 50%, #fdb300);
    border: 1px solid #fdb300;
}

button.w-button.gf-cancel {
    background: linear-gradient(#ffffff, #ffffff 50%, #e3e3e3 50%, #e3e3e3);
    border: 1px solid #ffffff;
}

.shadowDropper {
    filter: drop-shadow(0 0 2px black);
}

$gf-slider-height: 2em;
$gf-slider-gap: 0.2em;
.w-slider.gf-slider {
    height: $gf-slider-height;
    background-color: #6c6c6c;
    /* @function divide is from _variables.scss in wave-ui */
    border-left: divide($gf-slider-height, 2) solid #6c6c6c;
    border-right: divide($gf-slider-height, 2) solid #6c6c6c;
}

.w-slider.gf-slider .w-slider__track {
    background-color: #6c6c6c;
}

.w-slider.gf-slider .w-slider__thumb {
    width: $gf-slider-height - $gf-slider-gap*2;
    height: $gf-slider-height - $gf-slider-gap*2;
}

.w-slider.gf-slider .w-slider__thumb button {
    border-radius: 0;
    /* webpackIgnore: true */
    background: url(/images/assets/slider.png);
    background-size: contain;
}

.w-slider.gf-slider .w-slider__range {
    display: none;
}

$bg-arrow-scale: 2.5;
.gf-select.w-select {
    flex-flow: column;
    align-items: flex-start;
    max-width: 8em;
    min-width: 6em;
    box-shadow: 0 0 3px black;
    padding: 0.1em 0.8em 0.4em 0.4em;
    font-family: $SimSun;
    font-weight: 900;
    color: #313231ea;
    /* webpackIgnore: true */
    background-image: url(/images/assets/arrow.png);
    background-repeat: no-repeat;
    background-size: $bg-arrow-scale * 0.97em #{' '} $bg-arrow-scale * 0.86em;
    background-position: right 0 top 0;
}

.gf-select.w-select>label {
    display: block;
    margin: 0 #{' '} $bg-arrow-scale * 0.97em #{' '} 0.3em 0;
}

.gf-select.w-select>label::after {
    font-family: "Michroma", sans-serif;
    font-size: 0.6em;
    display: block;
    white-space: nowrap;
}

.gf-select.w-select.server-later>label::after {
    content: "SERVER HOST";
}

.gf-select.w-select.language-later>label::after {
    content: "LOCALIZATION";
}

.gf-select.w-select, .gf-select.w-select>div {
    box-shadow: 0 0 6px #7f7f7f;
}

.gf-select.w-select .primary,
.gf-select.w-select input,
.w-menu.w-select__menu.w-menu--bottom,
.w-menu.w-select__menu.w-menu--bottom .w-list__item-label.primary {
    color: #313231;
    font-family: $SimSun;
    font-weight: bold;
}

.white, .white-tabs .w-tabs__content>* {
    background-color: white;
    box-shadow: 0 0 6px black;
}

.white-tabs .w-tabs__content {
    background-color: #ffffff7f;
}

.w-tabs .w-tabs__content .gf-dashboard {
    background-color: #c0c0c0;
    /* webpackIgnore: true */
    background-image: url(/images/assets/Panel_GK.png);
    background-repeat: no-repeat;
    background-size: 14em;
    background-position: right 6em top min(50vh, 90%);
}

.gf-dialog .w-card {
    /* webpackIgnore: true */
    background: url(/images/assets/BG_dotted.png);
    color: white;
    background-repeat: repeat;
    background-size: 0.3em 0.3em;
    text-align: center;
    justify-content: center;
    max-width: 500px;
    border: 2px solid #c0c0c0c0;
    overflow: clip;
}

.gf-dialog .w-card * {
    text-align: center;
    justify-content: center;
}
</style>
