<template>
  <div ref="widget" :style="{height:eleHeight}">
  	<slot></slot>
  </div>
</template>
<script> 
  import TWEEN from 'tween';
  export default {
  	data(){
  		return {
  			orginHeight:0,
  			eleHeight:'auto',
  			tweeningValue:0
  		}
  	},
    props: {
      sildeUp: Boolean,
      required: true
    },
    watch:{
      sildeUp: function (newValue, oldValue) {
         newValue?this.sildedown():this.sildeup();
      }
    },
    mounted:function(){
      this.orginHeight=this.$refs.widget.clientHeight; 
    },
    methods:{
      sildeup: function () { 
      	this.tween(this.orginHeight,0)
      },
      sildedown: function () {
      	this.tween(0,this.orginHeight) 
      },
      tween: function (startValue, endValue) {
        var vm = this;
        vm.tweeningValue=startValue;
        function animate () {
          if(vm.tweeningValue!=endValue){
            requestAnimationFrame(animate);
            TWEEN.update()
          } 
        }
        new TWEEN.Tween({ tweeningValue: startValue })
          .to({ tweeningValue: endValue }, 300)
          .onUpdate(function () { 
            vm.tweeningValue = this.tweeningValue.toFixed(0);
            vm.eleHeight=vm.tweeningValue+'px';
          })
          .start()
        animate()
      }
    }
  }
</script>
