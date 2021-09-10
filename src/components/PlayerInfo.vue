<template>
<w-flex wrap class="row player-info">
  <w-flex wrap class="column inputs">
    <w-flex wrap class="row">
      <w-input :label="$t('tabGeneral.name')" :placeholder="$t('tabGeneral.nameDefault')" v-model="info.name"
               shadow class="ma2"/>
      <w-input :label="$t('tabGeneral.uid')" v-model="info.uid" type="number"
               shadow class="ma2"/>
      <w-input :label="$t('tabGeneral.level')" v-model="info.level" type="number"
               shadow class="ma2"/>
    </w-flex>
    <w-select :items="serverInfo"
              :label="$t('tabGeneral.server.name')"
              v-model="server"
              shadow class="ma2" />
    <w-input type="text" v-model="customServer" :label="$t('tabGeneral.server.customServer')"
             shadow class="ma2" />
  </w-flex>
  <w-flex class="column avatar-wrapper">
    <span class="ma2">
      {{ $t("tabGeneral.avatar.name") }}
    </span>
    <img ref="avatar" />
    <input type="file" v-on:change="changeAvatar"
           ref="avatarInput" id="avatarInput" class="ma2" />
    <w-button @click="clearAvatar" class="ma2">
      {{ $t("tabGeneral.avatar.clear") }}
    </w-button>
  </w-flex>
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
      this.$refs.avatar.src = this.info.avatar
    },
    clearAvatar () {
      this.$refs.avatarInput.value = null
      this.info.avatar = ''
      this.$refs.avatar.src = ''
    }
  }
}
</script>

<style scoped lang="scss">
div {
  text-align: center;
}

$avatar-width: 8em;
.avatar-wrapper {
    max-width: $avatar-width;
}

.avatar-wrapper img {
    border: 1px solid black;
    width: $avatar-width;
    height: $avatar-width;
}
</style>

<style>
.player-info .inputs input, .player-info .inputs .w-input__input-wrap {
    height: 2.4em;
}
</style>
