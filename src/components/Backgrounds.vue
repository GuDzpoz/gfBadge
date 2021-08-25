<template>
<w-flex class="column">
  <input type="file" v-on:change="customizeBackground"
         ref="backgroundInput" class="ma2" />
  <w-flex wrap class="row justify-center">
    <div v-for="img in backgrounds.bg" :key="img" class="bg-preview">
      <input type="radio" :id="img" :value="img" v-model="value" />
      <label :for="img">
        <img :src="backgrounds['__'] + '/' + img" />
      </label>
    </div>
  </w-flex>
</w-flex>
</template>

<script>
import { backgrounds } from '../assets/backgrounds.js'

export default {
  name: 'Backgrounds',
  props: {
    modelValue: String,
  },
  data () {
    return {
      value: '',
      backgrounds: backgrounds,
    }
  },
  watch: {
    value (val) {
      this.$emit('update:modelValue', backgrounds['_'] + '/' + val)
    },
  },
  methods: {
    customizeBackground () {
      this.$emit('update:modelValue',
                 URL.createObjectURL(event.target.files[0]))
    },
  },
}
</script>

<style scoped>
.bg-preview {
    margin: 0.2em;
    padding: 0 0.5em 0 0.5em;
    background-color: #24252d;
    border: 1px solid white;
    box-shadow: 0 0 4px #3c3c3c;
    scale: 1;
    transition: scale .2s;
}

.bg-preview:hover {
    scale: 1.2;
    z-index: 1;
}

.bg-preview img {
    object-fit: cover;
    width: 128px;
    height: 76.8px;
    display: block;
}

.bg-preview input {
    display: none;
}

.bg-preview input:checked+label::before {
    margin: auto;
    content: "★";
    position: absolute;
    color: #6e460d;
    background: linear-gradient(-30deg, #ffd701, #ffd701 50%, #feba00 50%);
    clip-path: polygon(0 0, 0 80%, 50% 100%, 100% 80%, 100% 0);
}
</style>
