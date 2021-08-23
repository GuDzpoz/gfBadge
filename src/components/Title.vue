<template>
  <h1 class="ma5">{{ title }}</h1>
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
