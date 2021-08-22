<template>
  <App />
</template>

<script>
import { defineAsyncComponent } from 'vue'
import LoadingSpinner from './components/LoadingSpinner'
const App = defineAsyncComponent({
  loader: () => import(/* webpackChunkName: "app" */
    './App'),
  loadingComponent: LoadingSpinner,
  delay: 0,
})
 
export default {
  name: 'LoadingSpinner',
  components: {
    App,
  },
}
</script>
