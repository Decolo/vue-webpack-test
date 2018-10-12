<template>
  <div class="swiper"  ref="swiper" >
       <div class="swiper-btn swiper-btn-left" @click="switchIndex(--index)" v-if="showBtn" v-show="index>0"><i class="slider-icon slider-icon-left"></i></div>
       <div class="swiper-btn swiper-btn-right" @click="switchIndex(++index)" v-if="showBtn" v-show="index<maxidx"><i class="slider-icon slider-icon-right"></i></div>
       <div class="swiper-items"  :style="{transform:'translateX(-'+index * 100 +'%)'}">
       		<slot> </slot>
       </div>
  </div>
</template>
<script> 
  export default {
    data: function () {
      return {
        index: 0,
        length:0,
        maxidx:9
      }
    },
    props:{ 
        onSwitch:{
              type:Function,
              required: false
        },
        showBtn:{
              type:Boolean,
              default: true
        }
    },
    mounted:function(){
      this.length=this.$refs.swiper.getElementsByClassName('swiper-item').length;
      this.maxidx=this.length-1;
      this.$on('$Swiper:switch', function(index){
         this.index=index;
      });
    },
    methods:{
    	switchIndex:function(index){
    		this.index=parseInt(index>this.maxidx?this.maxidx:index<0?0:index);
    		if(this.onSwitch && this.onSwitch instanceof Function){ 
	          this.onSwitch(this.index);
	        }
    	}
    } 
  }
</script> 