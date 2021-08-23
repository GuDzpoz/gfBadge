<template>
<div class="gf-checkbox">
  <input type="checkbox" v-model="value" :id="id" />
  <label :for="id">
    <img :src="value ? '/images/assets/Icon_yes.png' : '/images/assets/Icon_no.png'" />
  </label>
  <span>{{ label }}</span>
</div>
</template>

<script>
export default {
  name: 'gf-checkbox',
  props: {
    modelValue: Boolean,
    label: String,
  },
  data () {
    return {
      value: this.modelValue,
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
  },
}
</script>

<style>
.gf-checkbox {
  background-color: #323232;
  color: white;
  height: 2em;
  box-shadow: 0 -1px 2px black;
  display: flex;
  margin: 1em;
  width: max-content;
}

.gf-checkbox img {
  height: 2em;
}

.gf-checkbox input {
  display: none;
}
.gf-checkbox span {
  margin: auto 1em auto 1em;
}
</style>
