<template>
   <zjxw-layout :detailurl="detailurl"  :idKey="idKey" :listurl="listurl" :seriename="seriename"></zjxw-layout>
</template>
<script> 
  import ZjxwLayout from './ZjxwMultiLineLayout.vue';  


  export default {
  	data:function (){ 
      return { 
        seriename:'专题',
        listurl:'/zjxwSubjectInfo',
        detailurl:'/zjxwSubjectUnp',
        idKey:'subjectId'
      };
    }, 
    components: { 
      ZjxwLayout:ZjxwLayout 
    }  
  }
</script>  
