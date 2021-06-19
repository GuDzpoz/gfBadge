<template>
<w-app>
  <w-flex wrap>
    <w-select :items="servers" v-model="server" :label="t('selectServer')" class="title4 xs6" />
    <w-select :items="langs" v-model="$i18n.locale" :label="t('selectLang')" class="title4 xs6" />
    <h1 class="xs12 ma5">{{ t("title") }}</h1>
    <DollCollection :ui="ui" :dolls="typedDolls" :background="{ url: ui.backgroundUrl}" class="xs12" />
    <w-button @click="saveToLocal()" class="ma2">{{ t("btnSaveCfg") }}</w-button>
    <w-button @click="loadFromLocal()" class="ma2">{{ t("btnLoadCfg") }}</w-button>
    <w-tabs :items="[{}, {}, {}]" class="xs12 ma2">
      <template v-slot:[`item-title.1`]>
        {{ t('tabPoster.title') }}
      </template>
      <template v-slot:[`item-content.1`]>
        <DollSelector v-model="ui.collection" :dolls="typedDolls" />
      </template>
      <template v-slot:[`item-title.2`]>
        {{ t('tabBackground.title') }}
      </template>
      <template v-slot:[`item-content.2`]>
        <w-radios :items="backgrounds" v-model="ui.backgroundUrl" inline />
      </template>
      <template v-slot:[`item-title.3`]>
        {{ t('tabGeneral.title') }}
      </template>
      <template v-slot:[`item-content.3`]>
        <PlayerInfo v-model="ui.info" />
      </template>
    </w-tabs>
  </w-flex>
</w-app>
</template>

<script>
import DollSelector from './components/DollSelector'
import DollCollection from './components/DollCollection'
import PlayerInfo from './components/PlayerInfo'
import { useI18n } from 'vue-i18n'
import { jsonTexts } from './assets/langs.js'
import { dolls } from './assets/dolls.js'
import { backgrounds } from './assets/backgrounds.js'

const dollTypes = ['AR', 'SMG', 'RF', 'HG', 'SG', 'MG']

export default {
  name: 'App',
  components: {
    DollSelector,
    DollCollection,
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
      ui: {
        collection: {},
        info: {},
        backgroundUrl: '',
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
    }
  },
  methods: {
    saveToLocal () {
      localStorage.config = JSON.stringify(this.ui)
    },
    loadFromLocal () {
      if(localStorage.config) {
        this.ui = JSON.parse(localStorage.config)
      }
    },
    getDolls () {
      fetch("http://www.gfwiki.org/api.php?action=parse&prop=text&page=%E6%88%98%E6%9C%AF%E4%BA%BA%E5%BD%A2%E5%9B%BE%E9%89%B4&format=json")
        .then(response => response.json())
        .then(json => {
          var parser = new DOMParser()
          var dom = parser.parseFromString(json.parse.text['*'], 'text/html')
          var dolls = []
          for(var div of dom.getElementsByClassName('dolldata')) {
            var doll = {}
            for(var attr of div.attributes) {
              if(attr.name.startsWith('data')) {
                doll[attr.name] = attr.value
              }
            }
            dolls.push(doll)
          }
          return dolls
        })
    },
    filterDolls (type) {
      return this.dolls.filter(doll => doll['data-tdoll-class'] === type)
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
