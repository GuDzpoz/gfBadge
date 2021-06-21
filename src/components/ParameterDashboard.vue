<template>
<div>
  <div class="title3 ma4">{{ $t('tabAdjust.adjutantOffset') }}</div>
  <div class="title4 ma4">{{ $t('tabAdjust.adjutantOffsetX') }}</div>
  <w-slider v-model="ui.adjutant.x" :step="1" :min="0" :max="800"
            thumb-label />
  <div class="title4 ma4">{{ $t('tabAdjust.adjutantOffsetY') }}</div>
  <w-slider v-model="ui.adjutant.y" :step="1" :min="-400" :max="400"
            thumb-label />
  <div class="title4 ma4">{{ $t('tabAdjust.adjutantScaleFactor') }}</div>
  <w-slider v-model="ui.adjutant.scale" :min="0" :max="1"
            thumb-label />
  <div class="title4 ma4">{{ $t('tabAdjust.backgroundAplha') }}</div>
  <w-slider v-model="ui.adjutant.opacity" :min="0" :max="1"
            thumb-label />
  
  <div class="title3 ma4">{{ $t('tabAdjust.background') }}</div>
  <div class="title4 ma4">{{ $t('tabAdjust.backgroundOffsetX') }}</div>
  <w-slider v-model="ui.background.x" :step="1" :min="-800" :max="800"
            thumb-label />
  <div class="title4 ma4">{{ $t('tabAdjust.backgroundOffsetY') }}</div>
  <w-slider v-model="ui.background.y" :step="1" :min="-800" :max="800"
            thumb-label />
  <div class="title4 ma4">{{ $t('tabAdjust.backgroundScaleFactor') }}</div>
  <w-slider v-model="ui.background.scale" :min="0" :max="3"
            thumb-label />
  <div class="title4 ma4">{{ $t('tabAdjust.backgroundAplha') }}</div>
  <w-slider v-model="ui.background.opacity" :min="0" :max="1"
            thumb-label />
  
  <div class="title3 ma4">{{ $t('tabAdjust.other') }}</div>
  <div class="title4 ma4">{{ $t('tabAdjust.gunLiteBackgroundAlpha') }}</div>
  <w-slider v-model="ui.hexagons.opacity" :min="0" :max="1"
            thumb-label />
</div>
</template>

<script>
export default {
  name: 'ParameterDashboard',
  props: {
    modelValue: Object
  },
  data () {
    return {
      ui: {}
    }
  },
  created () {
    this.ui = this.modelValue
  },
}
</script>

<style scoped>
</style>
