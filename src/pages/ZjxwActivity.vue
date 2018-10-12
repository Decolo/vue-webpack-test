<template>
   <zjxw-layout :detailurl="detailurl"  :idKey="idKey" :listurl="listurl" :seriename="seriename"></zjxw-layout>
</template>
<script> 
  import ZjxwLayout from './ZjxwMultiLineLayout.vue';  


  export default {
  	data:function (){ 
      return { 
        seriename:'活动',
        listurl:'/zjxwActivityInfo',
        detailurl:'/zjxwActivityUnp',
        idKey:'activityId'
      };
    }, 
    components: { 
      ZjxwLayout:ZjxwLayout 
    }  
  }
</script>  
