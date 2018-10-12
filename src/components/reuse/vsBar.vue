<template>
  <div class="vsBar"  @touchstart="startTouch" @touchmove="moveTouch" @touchend="endTouch"  ref="scollbar"> 
     <slot > </slot> 
  </div>
</template>
<script> 
  var nowTapy=0;
  var finnalyMoved=0;
  export default {
    data: function () {
      return { 
        eleWidth:0,
        parentHeight:0,
        moved:0,
        startTapY:0, 
        maxdistance:0
      }
    },
    methods:{ 
      startTouch:function(e){
         this.startTapY=e.touches[0].clientY
          this.parentHeight=this.$refs.scollbar.parentElement.clientHeight
          this.eleWidth=this.$refs.scollbar.clientHeight;
          this.maxdistance=this.parentHeight-this.eleWidth; 
      },
      moveTouch:function(e){
         nowTapy=e.touches[0].clientY;
         var moved=nowTapy - this.startTapY; 
         var distance =this.moved + moved * 0.8;  
         console.log(moved)
         finnalyMoved=distance>0?0:distance<(this.maxdistance)?this.maxdistance:distance;
         this.$refs.scollbar.style.transform='translateY('+finnalyMoved+'px)';
         this.$refs.scollbar.style.webkitTransform='translateY('+finnalyMoved+'px)'; 
      },
      endTouch:function(e){  
         this.moved=finnalyMoved; 
         alert(this.$refs.scollbar.style.webkitTransform)
      }
    } 
  }
</script>
<style>  
.vsBar{
    -webkit-transition: -webkit-transform .1s ease;
    transition: -webkit-transform .1s ease;
    transition: transform .1s ease;
    transition: transform .1s ease, -webkit-transform .1s ease;
}
</style>
