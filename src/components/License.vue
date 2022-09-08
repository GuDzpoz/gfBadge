<template>
<div class="gf-dashboard">
  <h3>License</h3>
  <p>
    The code part of this project is licensed under <a href="https://github.com/GuDzpoz/gfBadge/blob/main/LICENSE">GNU Affero General Public License v3.0</a>.
    <br>
    The source code is available at <a href="https://github.com/GuDzpoz/gfBadge">https://github.com/GuDzpoz/gfBadge</a>. You are currently using version <a :href="commitUrl">{{ commit }}</a>. Last update: {{ commitTime }}.
  </p>
  <h3>Media files</h3>
  <p>
    This project utilizes icons from <a href="https://github.com/Templarian/MaterialDesign">Material Design Icons</a>.
    <br>
    The doll data (rarity, code names, etc.) mostly comes from <a href="http://gfwiki.org/">GFWiki</a>. The icon frame comes from one of its style sheets, which seems to be of <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC-BY-NC-SA</a>.
    <br>
    SUNBORN Network Technology Co. holds the copyright on all other media files.
    <br>
  </p>
  <blockquote style="border-left: 0.2rem solid grey; padding-left: 1em">
    上海暗冬网络科技有限公司 版权所有
    <br>
    SUNBORN Network Technology Co., Ltd. All Rights Reserved.
  </blockquote>
  <h3>Libraries</h3>
  <w-accordion :items="[{}]">
    <template #item-title>Libraries ({{ Object.keys(licenses).length }})</template>
    <template #item-content>
      <p>
        <ul>
          <li v-for="library in Object.keys(licenses)" :key="library">
            <b>{{ library }}</b><br>
            <div>
              License:
              <a href="{{ licenses[library].licenseUrl }}">
                {{ licenses[library].licenses }}
              </a>
              <br>
              Repo:
              <a href="{{ licenses[library].repository }}">
                {{ licenses[library].repository }}
              </a>
              <br>
            </div>
        </li>
      </ul>
    </p>
  </template>
</w-accordion>
</div>
</template>

<script>
import licenses from '../assets/licenses.json'

const commitBaseUrl = 'https://github.com/GuDzpoz/gfBadge/commit/'

export default {
  name: 'License',
  data () {
    return {
      licenses,
      commit: process.env.VUE_APP_COMMIT_HASH,
      commitTimestamp: process.env.VUE_APP_COMMIT_TIME * 1000,
    }
  },
  computed: {
    commitUrl () {
      return commitBaseUrl + this.commit
    },
    commitTime() {
      return new Date(this.commitTimestamp).toLocaleDateString()
    },
  },
}
</script>

<style scoped>
* {
  padding-top: 0.5em;
}

div, li {
  margin-left: 1em;
}
</style>
