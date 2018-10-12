<template>
  <div class="scrollBar"  @touchstart="startTouch" @touchmove="moveTouch" ref="scollbar"  >
    <div class="scrollcontent" ref="scrollcontent" :style="{transform:'translateX('+marginleft+'px)'}">
     <slot > </slot>
    </div>
  </div>
</template>
<script> 
  export default {
    data: function () {
      return { 
        eleWidth:0,
        scrollWidth:0,
        marginleft:0,
        startTapX:0,
        nowTapx:0 
      }
    },
    updated:function(){  
        this.scrollWidth=this.$refs.scrollcontent.clientWidth
        this.eleWidth=this.$refs.scollbar.clientWidth;
        this.maxMargin=this.eleWidth-this.scrollWidth;  
    },
    methods:{ 
      startTouch:function(e){
         this.startTapX=e.touches[0].clientX
      },
      moveTouch:function(e){
         this.nowTapx=e.touches[0].clientX;
         var moved=this.nowTapx-this.startTapX;
         var ml=this.marginleft + moved * 0.5;  
         this.marginleft=ml>0?0:ml<(this.maxMargin)?this.maxMargin:ml;
      }
    } 
  }
</script>
<style> 
.scrollcontent{
  transition: transform 100ms ease;
} 


.scrollBar,
.scrollcontent{
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    align-items: center;
    text-align: center;

}
</style>
