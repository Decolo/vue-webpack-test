<template>
   <web-layout :apiurl="apiurl" :serieName="serieName"></web-layout>
</template>
<script> 
  import WebLayout from './WebBasicLineChart.vue';  


  export default {
  	data:function (){ 
      return {apiurl:'/webNUV',serieName:'新增访客'};
    }, 
    components: { 
      WebLayout:WebLayout 
    }  
  }
</script>  
