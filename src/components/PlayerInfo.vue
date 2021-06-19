<template>
<w-flex>
  <w-input :label="$t('tabGeneral.name')" :placeholder="$t('tabGeneral.nameDefault')" v-model="info.name" class="xs6 ma2"/>
  <w-input :label="$t('tabGeneral.uid')" v-model="info.uid" type="number" class="xs3 ma2"/>
  <w-input :label="$t('tabGeneral.level')" v-model="info.level" type="number" class="xs3 ma2"/>
</w-flex>
</template>

<script>
export default {
  name: 'PlayerInfo',
  props: {
    modelValue: Object
  },
  data () {
    return {
      info: {
        name: '',
        uid: 0,
        level: 0
      }
    }
  },
  mounted () {
    this.info = { ...this.info, ...this.modelValue }
  },
  watch: {
    info: {
      handler () {
        this.$emit('update:modelValue', this.info)
      },
      deep: true
    }
  }
}
</script>

<style scoped>
div {
  text-align: center;
}
</style>
