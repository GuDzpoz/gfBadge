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
      <w-menu v-for="doll in item.dolls" :key="doll.id"
              custom hide-on-menu-click shadow>
        <template #activator="{ on }">
          <w-button v-on="on" outline class="ma1">
            {{ doll.cnname }}
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
    typedDolls () {
      var typedNPCDolls = dollTypes.map(type => { return { type, dolls: this.dolls[type]} })
      typedNPCDolls.push({
        type: 'NPC',
        dolls: Object.keys(this.npcs).map(name => { return {
          cnname: name,
          id: name,
          skins: Object.fromEntries(Object.keys(this.npcs[name]).map(skin =>
            [ skin, this.npcs[name][skin]]
          ))
        }})
      })
      return typedNPCDolls
    },
  },
  methods: {
    skinItems (skins) {
      return Object.keys(skins ? skins : {}).map(name => {
        return { label: name, value: skins[name] }
      })
    },
    firstSkinItem (skins) {
      return skins ? [Object.values(skins)[0]] : ''
    },
    select (skin) {
      this.currentSkin = skin.value
      if(this.adjutantOn) {
        this.$emit('update:modelValue', this.urlbase + '/' + skin.value)
      } else {
        this.$emit('update:modelValue', '')
      }
    }
  }
}
</script>

<style scoped>
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
</style>
