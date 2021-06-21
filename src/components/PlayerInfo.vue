<template>
<w-flex wrap>
  <w-input :label="$t('tabGeneral.name')" :placeholder="$t('tabGeneral.nameDefault')" v-model="info.name" class="xs6 ma2"/>
  <w-input :label="$t('tabGeneral.uid')" v-model="info.uid" type="number" class="xs2 ma2"/>
  <w-input :label="$t('tabGeneral.level')" v-model="info.level" type="number" class="xs2 ma2"/>
  <w-select :items="serverInfo"
            :label="$t('tabGeneral.server.name')"
            v-model="server"
            class="xs3 ma2" />
  <w-input type="text" v-model="customServer" :label="$t('tabGeneral.server.customServer')" />
  <span class="ma2">
    {{ $t("tabGeneral.avatar.name") }}
  </span>
  <input type="file" v-on:change="changeAvatar"
         id="avatarInput" class="ma2" />
  <w-button @click="clearAvatar" class="ma2">
    {{ $t("tabGeneral.avatar.clear") }}
  </w-button>
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
      customServer: '',
      server: '',
      info: {
        name: '',
        uid: 0,
        level: 0,
        server: ''
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
    },
    customServer (value) {
      if(value === '') {
        this.info.server = this.server
      } else {
        this.info.server = value
      }
    },
    server (value) {
      if(this.customServer === '') {
        this.info.server = value
      }
    }
  },
  computed: {
    serverInfo () {
      var serverInfo = this.$i18n.messages[this.$root.$i18n.locale]
          .tabGeneral.server.options
      return serverInfo.map(info => { return {
        label: info.text,
        value: info.value
      }})
    }
  },
  methods: {
    changeAvatar (event) {
      this.info.avatar = URL.createObjectURL(event.target.files[0])
    },
    clearAvatar () {
      document.getElementById('avatarInput').value = null
      this.info.avatar = ''
    }
  }
}
</script>

<style scoped>
div {
  text-align: center;
}
</style>
