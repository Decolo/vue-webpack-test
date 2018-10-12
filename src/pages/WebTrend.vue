<template>
   <web-layout :apiurl="apiurl" :serieName="serieName"></web-layout>
</template>
<script> 
  import WebLayout from './WebBasicLineChart.vue';  


  export default {
  	data:function (){ 
      return {apiurl:'/webUvTrend',serieName:'访客数'};
    }, 
    components: { 
      WebLayout:WebLayout 
    }  
  }
</script>  
