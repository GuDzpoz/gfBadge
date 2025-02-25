<template>
<n-config-provider :theme-overrides="themeOverrides">
  <n-collapse :items="typedDolls" display-directive="show">
    <n-collapse-item v-for="item in typedDolls" :key="item.type"
                     class="collapse-item">
      <template #header>
        <div class="typeIconWrapper mr3 ml2">
          <img :src="typeIcons[item.type]" :alt="item.type"
               class="typeIcon"/>
        </div>
        <w-button @click="selectAll(item.dolls, $event)" outline class="ma2 gf-tag">
          <w-icon class="mr2">mdi mdi-select-all</w-icon>
          {{ $t('ui.selectTypeAll') }}
        </w-button>
        <w-button @click="deselectAll(item.dolls, $event)" outline class="gf-tag">
          <w-icon class="mr2">mdi mdi-selection-off</w-icon>
          {{ $t('ui.deselectTypeAll') }}
        </w-button>
      </template>
      <w-tooltip v-for="doll in item.dolls" :key="doll.id" top>
        <template #activator="{ on }">
          <label :for="doll.id" class="avatar-label" v-on="on">
            <input
              v-on:input="select(doll, $event.target.checked)"
              :checked="modelValue[doll.type][doll.id]"
              :id="doll.id" class="avatar" type="checkbox"  />
            <div :class="iconClass(doll)">
              <img :src="doll.icon" />
            </div>
            <span>{{ getLocalizedName(doll) }}</span>
          </label>
        </template>
        {{ getLocalizedName(doll) }}
      </w-tooltip>
    </n-collapse-item>
  </n-collapse>
</n-config-provider>
</template>

<script>
const dollTypes = ['AR', 'SMG', 'RF', 'HG', 'MG', 'SG', 'SF']
import { NCollapse, NCollapseItem, NConfigProvider } from 'naive-ui'
import { typeIcons } from '../assets/typeIcons.js'

const themeOverrides = {
  Collapse: {
    fontSize: '17px',
    titleFontSize: '17px',
  },
}

export default {
  name: 'DollSelector',
  components: {
    NCollapse,
    NCollapseItem,
    NConfigProvider,
  },
  props: {
    dolls: Object,
    modelValue: Object,
    multiple: {
      type: Boolean,
      default: true
    },
  },
  created () {
    var typedDolls = this.typedDolls
    this.mutableValue = this.modelValue
    for(var type of typedDolls) {
      if(this.mutableValue[type.type] == null) {
        this.mutableValue[type.type] = Object.fromEntries(type.dolls.map(doll => [doll.id, false]))
      }
    }
    this.$emit('update:modelValue', this.mutableValue)
  },
  data () {
    return {
      mutableValue: {},
      typeIcons,
      themeOverrides,
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
    accordions () {
      return dollTypes.map(type => { return { title: type, type: type } })
    },
    typedDolls () {
      return dollTypes
        .filter(type => this.dolls[type])
        .map(type => { return { type, dolls: this.dolls[type]} })
    },
  },
  methods: {
    select (doll, isSelected) {
      this.mutableValue[doll.type][doll.id] = isSelected
      this.$emit('update:modelValue', this.mutableValue)
    },
    selectAll (dolls, event) {
      event.stopPropagation()
      for(var doll of dolls) {
        this.select(doll, true)
      }
    },
    deselectAll (dolls, event) {
      event.stopPropagation()
      for(var doll of dolls) {
        this.select(doll, false)
      }
    },
    iconClass (doll) {
      return doll.id?.startsWith('c') ? 'rareSF' : 'rare' + doll.rarity
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

<style>
.gf-tabs .collapse-item {
    margin: 0 1em 0 1em;
}

.gf-tabs .n-collapse .collapse-item > * {
    padding: 0;
}
</style>

<style scoped>
input.avatar {
    display: inline;
    display: none;
}

input.avatar:checked+div {
    box-shadow: 1px 3px 0px #dc322f, 1px 1.45rem 0px #dc322f, 0px calc(1.45rem - 3px) 0px #dc322f;
    background-color: #dc322f80;
}

input.avatar+div {
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 4em;
    height: 4em;
    background-color: rgba(255, 255, 255, 0);
    display: inline-block;
    position: relative;
}

input.avatar+div::after {
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

input.avatar+div img {
    padding: 10%;
}

input.avatar:checked~span {
    z-index: 1;
    color: white;
}

.avatar-label {
    display: inline-flex;
    flex-flow: column;
    margin: 0.25rem;
    height: 5.4em;
    max-width: 4em;
    line-break: anywhere;
    cursor: pointer;
    border: 1px dotted gray;
    text-align: center;
}

.avatar-label img {
    width: 100%;
    height: 100%;
}

.avatar-label span {
    overflow: clip;
    white-space: nowrap;
    font-size: 0.7rem;
}

.avatar-label:hover {
    box-shadow: 3px 3px 0px #268bd2;
}

.typeIconWrapper {
    display: flex;
    filter: drop-shadow(0 0 2px black);
}

.typeIcon {
    height: 1.6em;
    clip-path: polygon(0 0, 100% 0, 100% 75%, 84% 100%, 0 100%);
}

button.w-button.gf-tag {
  box-shadow: 0 0 2px black;
  border-radius: 0;
  color: #323232;
  background-color: white;
  font-family: serif;
  font-weight: bold;
  border: none;
}
</style>
