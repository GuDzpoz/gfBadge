<template>
  <App />
</template>

<script>
import { defineAsyncComponent } from 'vue'
import BoxLoadingSpinner from './components/BoxLoadingSpinner'
const App = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "app" */
    './App'),
  loadingComponent: BoxLoadingSpinner,
  delay: 0,
})
 
export default {
  name: 'LoadingSpinner',
  components: {
    App,
  },
}
</script>
