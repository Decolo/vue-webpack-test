<template>
   <zjxw-layout :apiurl="apiurl"></zjxw-layout>
</template>
<script> 
  import ZjxwLayout from './ZjxwChannelLayout.vue';  


  export default {
  	data:function (){ 
      return {apiurl:'/zjxwCityChannel'};
    }, 
    components: { 
      ZjxwLayout:ZjxwLayout 
    }  
  }
</script>  
