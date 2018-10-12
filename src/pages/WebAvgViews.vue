<template>
   <web-layout :apiurl="apiurl" :serieName="serieName"></web-layout>
</template>
<script> 
  import WebLayout from './WebBasicLineChart.vue';  


  export default {
  	data:function (){ 
      return {apiurl:'/webAvgViews', serieName:'浏览页数'};
    }, 
    components: { 
      WebLayout:WebLayout 
    }  
  }
</script>  
