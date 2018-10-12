<template>
  <span>{{ tweeningValue }}</span>
</template>

<script> 
  import TWEEN from 'tween'

  export default {
    props: {
        value: {
          type: Number,
          required: true
        },
        formatNumber: {
          type: Boolean,
          default: true
        }
    },
    data: function () {
      return {
        tweeningValue: 0,
        animationStop:false
      }
    },
    watch:{
      value: function (newValue, oldValue) {
        this.tween(oldValue, newValue)
      }
    },
    mounted: function () {
      this.tween(0, this.value)
    },
    methods:{
      tween: function (startValue, endValue) {
        var vm = this; 
        function animate () {
          if(vm.tweeningValue!=vm.value){ 
            requestAnimationFrame(animate);
            TWEEN.update()
          } 
        }
        new TWEEN.Tween({ tweeningValue: startValue })
          .to({ tweeningValue: endValue }, 500)
          .onUpdate(function () {
            vm.tweeningValue = this.tweeningValue?vm.formatNumber?vm.format(this.tweeningValue.toFixed(0)):this.tweeningValue.toFixed(0):'--';
          }).start()
        animate()
      },
      format:function(value){
        var w=10000;
        var kw=100000000;
        return value>w?value>kw?Math.round((value /kw) * 100) / 100 +'亿':Math.round((value /w) * 100) / 100 +'万':value;
      }
    }
  }
</script>

