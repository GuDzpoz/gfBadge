<template>
<w-accordion :items="typedDolls">
  <template #item-title="{ item }">{{ item.type }}</template>
  <template #item-content="{ item }">
    <w-tooltip v-for="doll in item.dolls" :key="doll['data-id']" top>
      <template #activator="{ on }">
        <label :for="doll['data-id']" class="avatar-label" v-on="on">
          <input
            v-on:input="select(doll, $event)"
            :checked="modelValue[doll['data-tdoll-class']][doll['data-id']]"
            :id="doll['data-id']" class="avatar" type="checkbox"  />
          <img :src="'http:' + doll['data-avatar']" />
          <span>{{ doll["data-name-ingame"] }}</span>
        </label>
      </template>
      {{ doll["data-name-ingame"] }}
    </w-tooltip>
  </template>
</w-accordion>
</template>

<script>
const dollTypes = ['AR', 'SMG', 'RF', 'HG', 'SG', 'MG', 'Coalition']

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
        this.mutableValue[type.type] = Object.fromEntries(type.dolls.map(doll => [doll['data-id'], false]))
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
      return dollTypes.map(type => { return { type, dolls: this.dolls[type]} })
    }
  },
  methods: {
    select (doll, event) {
      this.mutableValue[doll['data-tdoll-class']][doll['data-id']] = event.target.checked
      this.$emit('update:modelValue', this.mutableValue)
    }
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
