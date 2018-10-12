<template>
  <rect :y="y" :x="10+x" :height="height" :width="tweeningValue" :fill="fill" class="barRect"></rect>
</template>

<script> 
  import TWEEN from 'tween';
  export default {
    props:{
            y: {
                type: Number,
                default: 0
            },
            x: {
                type: Number,
                default: 0
            },
            height: {
                type: Number,
                default: ''
            },
            width: {
                type: Number,
                default: 0
            },
            fill: {
                type: String,
                default: ''
            }
    },
    data: function () {
      return {
        tweeningValue: 0
      }
    },
    watch:{
      width: function (newValue, oldValue) {
        this.tween(0, newValue)
      }
    },
    mounted: function () { 
      this.tween(0, this.width)
    },
    methods:{
      tween: function (startValue, endValue) {
        var vm = this; 
        function animate () {
          if(vm.tweeningValue!=endValue){
            requestAnimationFrame(animate);
            TWEEN.update()
          } 
        }
        new TWEEN.Tween({ tweeningValue: startValue })
          .to({ tweeningValue: endValue }, 600)
          .onUpdate(function () { 
            vm.tweeningValue = this.tweeningValue.toFixed(0);
          })
          .start()
        animate()
      },
    }
  }
</script>

