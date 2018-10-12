<template>
  <i class="fa breath" :class="angleup?'fa-angle-up':'fa-angle-down'"></i>
</template>
<script> 
  export default {
    props: {
      angleup: Boolean,
      required: true
    } 
  }
</script>
