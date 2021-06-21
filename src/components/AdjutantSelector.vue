<template>
<w-accordion :items="typedDolls">
  <template #item-title="{ item }">{{ item.type }}</template>
  <template #item-content="{ item }">
    <w-menu v-for="doll in item.dolls" :key="doll['data-id']"
      custom hide-on-menu-click shadow>
      <template #activator="{ on }">
        <w-button v-on="on" outline class="ma1">
          {{ doll["data-name-ingame"] }}
        </w-button>
      </template>
      <w-list :items="skinItems(skins[doll['data-id']])"
              v-on:item-select="select"
              :model-value="firstSkinItem(skins[doll['data-id']])"
              class="white--bg" />
    </w-menu>
  </template>
</w-accordion>
</template>

<script>
const dollTypes = ['AR', 'SMG', 'RF', 'HG', 'SG', 'MG']
import { skins } from '../assets/skins.js'
import { npcs } from '../assets/npcs.js'
import { coalitionSkins } from '../assets/coalitionSkins.js'
import { coalitionDolls } from '../assets/coalition.js'

export default {
  name: 'AdjutantSelector',
  props: {
    dolls: Object,
    modelValue: String,
  },
  created () {
    console.log(this.typedDolls)
  },
  data () {
    return {
      mutableValue: {},
      urls: [],
      npcs: npcs
    }
  },
  watch: {
    modelValue: {
      handler () {
        this.mutableValue = this.modelValue
      },
      deep: true
    }
  },
  computed: {
    skins () {
      return { ...skins, ...this.npcs, ...coalitionSkins }
    },
    typedDolls () {
      var typedNPCDolls = dollTypes.map(type => { return { type, dolls: this.dolls[type]} })
      typedNPCDolls.push({
        type: 'Coalition',
        dolls: Object.keys(coalitionSkins).map(name => { return {
          'data-name-ingame': this.getCoalitionName(name),
          'data-id': name
        }})
      })
      typedNPCDolls.push({
        type: 'NPC',
        dolls: Object.keys(this.npcs).map(name => { return {
          'data-name-ingame': name,
          'data-id': name
        }})
      })
      return typedNPCDolls
    },
    coalitionNames () {
      return Object.fromEntries(coalitionDolls.map(doll => [
        doll['data-id'], doll['data-name-ingame']
      ]))
    }
  },
  methods: {
    getCoalitionName (id) {
      return this.coalitionNames[id]
    },
    skinItems (skins) {
      return Object.keys(skins).map(name => {
        return { label: name, value: skins[name] }
      })
    },
    firstSkinItem (skins) {
      return [Object.values(skins)[0]]
    },
    select (skin) {
      this.$emit('update:modelValue', 'http://www.gfwiki.org/images' + skin.value)
    }
  }
}
</script>

<style scoped>
</style>
