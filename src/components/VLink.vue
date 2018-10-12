<template>
  <div  v-on:click="go">
    <slot></slot>
  </div>
</template>

<script>
  import routes from '../routes'
  
  export default {
    props: {
      href: String,
      required: true
    },
    methods: {
      go (event) {
        event.preventDefault()
        this.$root.currentRoute = this.href
        window.history.pushState(
          null,
          routes.routeMap[this.href],
          this.href
        )
      }
    }
  }
</script>
