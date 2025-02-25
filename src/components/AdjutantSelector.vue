<template>
<div>
  <gf-checkbox v-model="adjutantOn" :label="$t('tabTeam.showAdjutant')"
               class="ma3" />
  <w-accordion :items="typedDolls" shadow v-model="keepAliveCache[keepAlive]">
    <template #item-title="{ item }">
      <div class="typeIconWrapper">
        <img :src="typeIcons[item.type]" :alt="item.type" class="typeIcon"/>
      </div>
    </template>
    <template #item-content="{ item }">
      <w-flex wrap class="row">
        <w-tooltip v-for="skin in allSkins(item.dolls)" :key="skin.cn"
                   :detach-to="true" top>
          <template #activator="{ on }">
            <div class="avatar-group">
              <button class="avatar-label" v-on="on">
                <div :class="'avatar ' + iconClass(skin)" @click="select(skin)">
                  <img :src="getIcon(skin)" />
                </div>
                <span>{{ getLocalizedName(skin) }}</span>
              </button>
              <button @click="select(skin, true)" class="damaged">
                {{ isSF(skin) ? '★★★★★' : $t('tabTeam.damaged') }}
              </button>
            </div>
          </template>
          {{ getLocalizedName(skin) }}
        </w-tooltip>
      </w-flex>
    </template>
    <template v-slot:[`item-content.npc`]>
      <w-menu v-for="doll in npcItem.dolls" :key="doll.id"
              custom hide-on-menu-click shadow>
        <template #activator="{ on }">
          <w-button v-on="on" outline class="ma1">
            {{ getLocalizedName(doll) }}
          </w-button>
        </template>
        <w-list :items="skinItems(doll.skins)"
                v-on:item-select="select"
                :model-value="firstSkinItem(doll.skins)"
                class="white--bg" />
      </w-menu>
    </template>
  </w-accordion>
</div>
</template>

<script>
const dollTypes = ['AR', 'SMG', 'RF', 'HG', 'SG', 'MG', 'SF']
import { typeIcons } from '../assets/typeIcons.js'
import { npcs } from '../assets/npcs.js'

var keepAliveCache = {}

export default {
  name: 'AdjutantSelector',
  props: {
    dolls: Object,
    urlbase: String,
    modelValue: String,
    keepAlive: String,
    iconurlbase: String,
  },
  created () {
    this.currentSkin = this.modelValue.replace(this.urlbase + '/', '')
  },
  data () {
    return {
      mutableValue: {},
      adjutantOn: true,
      urls: [],
      currentSkin: '',
      npcs,
      typeIcons,
      keepAliveCache,
    }
  },
  watch: {
    modelValue: {
      handler () {
        this.mutableValue = this.modelValue.replace(this.urlbase + '/', '')
      },
      deep: true
    },
    adjutantOn (value) {
      if(value) {
        if(this.currentSkin !== '') {
          this.$emit('update:modelValue', this.urlbase + '/' + this.currentSkin)
        }
      } else {
        this.$emit('update:modelValue', '')
      }
    }
  },
  computed: {
    npcItem () {
      return {
        id: 'npc',
        type: 'NPC',
        dolls: Object.keys(this.npcs).map(name => { return {
          cn: name,
          id: name,
          skins: Object.fromEntries(Object.keys(this.npcs[name]).map(skin =>
            [ this.npcs[name][skin], { cn: skin,}, ]
          ))
        }})
      }
    },
    typedDolls () {
      var typedNPCDolls = dollTypes.map(type => { return { type, dolls: this.dolls[type]} })
      typedNPCDolls.push(this.npcItem)
      return typedNPCDolls
    },
  },
  methods: {
    skinItems (skins) {
      return Object.keys(skins ? skins : {}).map(filename => {
        return {
          label: this.getLocalizedName(skins[filename]),
          value: filename,
        }
      })
    },
    isSF (skin) {
      return skin.parent.id?.startsWith('c')
    },
    iconClass (skin) {
      if(skin.icon === 'mod') {
        return 'rare' + skin.parent.modRarity
      } else if(this.isSF(skin)) {
        return 'rareSF'
      } else {
        return 'rare' + skin.parent.rarity
      }
    },
    allSkins (skins) {
      return [].concat(...skins.map(doll => {
        return Object.keys(doll.skins).map(file =>
          Object.assign({ value: file, parent: doll }, doll.skins[file])
        )
      }))
    },
    getIcon (skin) {
      if('icon' in skin) {
        if(skin['icon'] === 'mod') {
          return skin.parent.moddedIcon
        } else {
          return this.iconurlbase + '/' + skin.icon
        }
      } else {
        return skin.parent.icon
      }
    },
    firstSkinItem (skins) {
      return skins ? [Object.keys(skins)[0]] : ''
    },
    select (skin, damaged) {
      console.log(skin)
      this.currentSkin = skin.value
      if(this.adjutantOn) {
        var value
        if(damaged) {
          value = skin.alt
        } else {
          value = skin.value
        }
        this.$emit('update:modelValue', this.urlbase + '/' + value)
      } else {
        this.$emit('update:modelValue', '')
      }
    },
    getLocalizedName(doll) {
      var lang = this.$i18n.locale
      if(lang in doll) {
        if(doll[lang] !== '') {
          return doll[lang]
        }
      }
      return doll['cn']
    },
  }
}
</script>

<style lang="scss">
@import "@/scss/avatar";
</style>

<style scoped lang="scss">
$avatar-width: 4.5em;
$avatar-margin: 0.25rem;

.typeIconWrapper {
    display: flex;
    filter: drop-shadow(0 0 2px black);
    justify-content: center;
    width: 3.23em;
}

.typeIcon {
    height: 1.6em;
    line-height: 1.6em;
    clip-path: polygon(0 0, 100% 0, 100% 75%, 84% 100%, 0 100%);
}

.avatar-label .avatar {
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: $avatar-width;
    height: $avatar-width;
    background-color: rgba(255, 255, 255, 0);
    display: inline-block;
    position: relative;
}

.avatar-label .avatar::after {
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    z-index: 1;
    pointer-events: none;
    position: absolute;
    content: "";
}

.avatar-label {
    display: inline-flex;
    flex-flow: column;
    margin: 0 $avatar-margin $avatar-margin 0;
    height: 1.35 * $avatar-width;
    max-width: $avatar-width;
    line-break: anywhere;
    cursor: pointer;
    border: 1px dotted gray;
    text-align: center;
}

.avatar-label img {
    padding: 10%;
    width: 100%;
    height: 100%;
}

.avatar-label span {
    overflow: clip;
    white-space: nowrap;
    font-size: 0.7rem;
}

.damaged {
    border: 1px dashed black;
    text-aligh: center;
    margin: 0 $avatar-margin $avatar-margin $avatar-margin;
    padding: 2px;
    color: black;
    cursor: pointer;
    font-size: 0.6rem;
    color: #000000b0;
    line-height: 0.8rem;
    max-width: 1.29 * $avatar-width;
    overflow: clip;
}

.damaged:hover, .damaged:focus {
    background-color: #dc322f;
    color: white;
}

.damaged:active:focus {
    background-color: #d21411;
}

.avatar-label:hover {
    box-shadow: 3px 3px 0px #268bd2;
}

.avatar-label:hover {
    box-shadow: 3px 3px 0px #268bd2;
}

.avatar-label:focus {
    background-color: #dc322f;
    box-shadow: $avatar-margin 0 0 #dc322f;
    color: white;
}

.avatar-label:active:focus {
    background-color: #d21411;
    box-shadow: $avatar-margin 0 0 #d21411;
    color: white;
}

.avatar-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;
    margin-right: $avatar-margin;
    box-shadow: 1px 1px 5px gray;
}
</style>
