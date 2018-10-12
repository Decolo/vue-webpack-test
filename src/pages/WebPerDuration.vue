<template>
   <web-layout :apiurl="apiurl" :serieName="serieName"></web-layout>
</template>
<script> 
  import WebLayout from './WebBasicLineChart.vue';  


  export default {
  	data:function (){ 
      return {apiurl:'/webAvgDuration',serieName:'时长(秒)'};
    }, 
    components: { 
      WebLayout:WebLayout 
    }  
  }
</script>  
