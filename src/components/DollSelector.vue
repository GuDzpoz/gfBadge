<template>
<w-accordion :items="typedDolls" shadow>
  <template #item-title="{ item }">
    <span class="ma2">{{ item.type }}</span>
    <w-button @click="selectAll(item.dolls, $event)" outline class="ma2">
      <w-icon class="mr2">mdi mdi-select-all</w-icon>
      {{ $t('ui.selectTypeAll') }}
    </w-button>
    <w-button @click="deselectAll(item.dolls, $event)" outline>
      <w-icon class="mr2">mdi mdi-selection-off</w-icon>
      {{ $t('ui.deselectTypeAll') }}
    </w-button>
  </template>
  <template #item-content="{ item }">
    <w-tooltip v-for="doll in item.dolls" :key="doll.id" top>
      <template #activator="{ on }">
        <label :for="doll.id" class="avatar-label" v-on="on">
          <input
            v-on:input="select(doll, $event.target.checked)"
            :checked="modelValue[doll.type][doll.id]"
            :id="doll.id" class="avatar" type="checkbox"  />
          <img :src="doll.icon" />
          <span>{{ doll.cnname }}</span>
        </label>
      </template>
      {{ doll.cnname }}
    </w-tooltip>
  </template>
</w-accordion>
</template>

<script>
const dollTypes = ['AR', 'SMG', 'RF', 'HG', 'SG', 'MG', 'SF']

export default {
  name: 'DollSelector',
  props: {
    dolls: Object,
    modelValue: Object,
    multiple: {
      type: Boolean,
      default: true
    }
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
      mutableValue: {}
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
    }
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
  }
}
</script>

<style scoped>
input.avatar {
  display: inline;
  display: none;
}

input.avatar:checked+img {
  box-shadow: 1px 3px 0px #dc322f, 1px 1.05rem 0px #dc322f, 0px calc(1.05rem - 3px) 0px #dc322f;
  border: 1px #dc322f solid;
}

input.avatar:checked~span {
  color: white;
}

.avatar-label {
  display: inline-flex;
  flex-flow: column;
  margin: 0.25rem;
  height: 4rem;
  max-width: 3rem;
  line-break: anywhere;
  cursor: pointer;
  border: 1px dotted gray;
  text-align: center;
}

.avatar-label img {
  width: 3rem;
  height: 3rem;
  background-color: white;
  border: 1px white solid;
}

.avatar-label span {
  font-size: 0.7rem;
}

.avatar-label:hover {
  box-shadow: 3px 3px 0px #268bd2;
}
</style>
