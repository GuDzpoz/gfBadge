<template>
<div class="gf-switch">
  <div v-for="(label, key) in labels" :key="key">
    <input type="radio" :id="id + key" :value="key" v-model="value"/>
    <label :class="key === value ? 'gf-switch-on' : 'gf-switch-off'"
           :for="id + key">
      <span>{{ label }}</span>
    </label>
  </div>
</div>
</template>

<script>
export default {
  name: 'gf-switch',
  props: {
    modelValue: String,
    labels: Object,
  },
  data () {
    return {
      value: this.getDefaultKey(this.modelValue, Object.keys(this.labels)),
      id: ('' + Math.random()).replace('.', ''),
    }
  },
  watch: {
    modelValue (val) {
      this.value = val
    },
    value (val) {
      this.$emit('update:modelValue', val)
    },
    labels (val) {
      this.value = this.getDefaultKey(this.value, Object.keys(val))
    },
  },
  methods: {
    getDefaultKey(key, keys) {
      if(!key) {
        if(keys.length > 0) {
          return keys[0]
        }
      }
      return key
    },
  },
}
</script>

<style>
.gf-switch {
  background-color: #d89d2b;
  color: #323232;
  height: 2em;box-shadow: 1px 1px 4px #606060 inset, 3px 3px 6px #ffc453 inset;
  display: flex;
  margin: 1em;
  padding: 0.2em;
  font-family: "Noto Serif SC", serif;
  font-weight: 900;
}

.gf-switch div {
  min-width: 4.2em;
}

.gf-switch label {
  margin: auto;
  display: inline-block;
  height: 1.6em;
  min-width: 4em;
  display: flex;
}

.gf-switch label.gf-switch-on {
  background-color: #e0e0e0;
  border: 1px solid white;
  box-shadow: 0 0 2px white inset, 1px 1px 2px #606060;
}

.gf-switch label.gf-switch-off {
  color: lightgray;
  border: 1px solid #d89d2b00;
}

.gf-switch span {
  margin: auto;
  padding-left: 0.1em;
  padding-right: 0.1em;
  text-align: center;
}

.gf-switch input {
  display: none;
}
</style>
