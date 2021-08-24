<template>
<w-toolbar class="gf-title">
  <img src="/images/assets/Title_back.png" class="gf-title-back ml12 mr4" />
  <div class="gf-title-box"></div>
  <img src="/images/assets/Title_station.png" class="gf-title-station ml1" />
  <img src="/images/assets/Title_squad.png" class="gf-title-squad ml3" />
  <h1 class="ma5 title2">{{ title }}</h1>
</w-toolbar>
</template>


<script>
export default {
  name: 'Title',
  props: {
    title: String,
  },
  watch: {
    title (val) {
      document.title = val
    }
  }
}
</script>

<style lang="scss" scoped>
$h1-size: 1.5rem;
$caption-size: 0.4rem;
.w-app h1.title2 {
    font-family: "Noto Serif SC", serif;
    font-weight: 900;
    font-size: $h1-size;
    margin: 0 0 $caption-size 0;
    white-space: nowrap;
}

.w-app h1.title2::before {
    content: "SIGNATURE IMAGE GENERATOR";
    font-family: "Michroma", sans serif;
    position: absolute;
    top: $h1-size + $caption-size;
    font-size: $caption-size;
}

.gf-title.w-toolbar {
    margin: 0;
    padding: 0;
    background-color: #2f2f2f;
    color: #a4a4a4;
    border-bottom: 1px solid #9a9b9b;
    box-shadow: 0 -0.5em 0.5em #6a6d6c inset;
    overflow: clip;
}

$img-height: 1.3em;
.gf-title-back {
    height: 1.3em;
}

.gf-title-box {
    background-color: white;
    width: 0.2rem;
    height: $h1-size + $caption-size;
}

.gf-title-station {
    height: $h1-size + $caption-size;
}

.gf-title-squad {
    height: $h1-size + $caption-size;
}
</style>
