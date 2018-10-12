<template>
   <zjxw-layout :detailurl="detailurl"  :idKey="idKey" :listurl="listurl" :seriename="seriename"></zjxw-layout>
</template>
<script> 
  import ZjxwLayout from './ZjxwMultiLineLayout.vue';  


  export default {
  	data:function (){ 
      return { 
        seriename:'新闻',
        listurl:'/zjxwNewsInfo',
        detailurl:'/zjxwNewsUnp',
        idKey:'newsId'
      };
    }, 
    components: { 
      ZjxwLayout:ZjxwLayout 
    }  
  }
</script>  
