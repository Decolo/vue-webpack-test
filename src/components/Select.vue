<template>
  <div  class="vselect" ref="topele" :class="{'open':showoptions}">
    <span class="voption"  @click.stop="toselect()">{{curropt[valkey] | limitLength(6) }}<i class="fa fa-caret-down"></i></span> 
    <div class="voptioncontainer" v-if="showoptions" >
      <div class='voptionArea' :style="{height:eleHeight+'px'}"> 
        <div class="voption" v-for="(option,idx) in options" @click.stop="doselect(option,idx)" :key="valkey">
          <span>{{option[valkey]  | limitLength(8) }}</span>
          <i class="fa fa-caret-left" v-show="option[optkey]==curropt[optkey]"></i>
        </div>
      </div> 
    </div>   
  </div>
</template>

<script>  
  import TWEEN from 'tween'; 

  export default {
    props:{
            options: {
                type: Array,
                required: true
            },
            valkey: {
                type: String,
                default: 'value'
            },
            optkey:{
                type: String,
                default: 'key'
            },
            label:{
                type: String,
                default: '请选择'
            },
            selected:{
                type: Number,
                default:-1
            },
            onChange:{
              type:Function,
              required: false
            }
    },
    data: function () {
      return {
        eleHeight:0, 
        singleHeight:44,
        curropt: this.label,
        showoptions:false
      }
    },
    filters:{
      limitLength:function(value,l){ 
        return value && value.length > l?value.substr(0,l-1)+'...':value;
      }
    },
    watch:{
      selected:function(val){
        this.curropt=this.options[val];
      },
    },
    mounted:function(){
      if(this.selected>=0){
        this.curropt=this.options[this.selected];
      };
      document.addEventListener("click", this.blurClose);
    },
    destroyed:function(){ 
      document.removeEventListener("click", this.blurClose);
    },
    methods:{
      toselect: function () { 
        var height= this.singleHeight * this.options.length;
        this.showoptions=true;
        this.tween(this.singleHeight,height);
      },
      blurClose:function(){   
        if(event.srcElement==this.$refs.topele || event.srcElement.parentElement==this.$refs.topele)return;
        this.closeEle(); 
      },
      doselect: function (option,idx) {  
        var valkey=this.valkey;
        var vm=this;
        vm.curropt=option;
        vm.closeEle();
        if(vm.onChange && vm.onChange instanceof Function){  
          vm.onChange(option,idx);
        }
      },
      closeEle:function(){
        var vm=this;
        vm.tween(vm.eleHeight,this.singleHeight,function(){vm.showoptions=false;}); 
      },
      tween: function (startValue, endValue,callback) {
        var vm = this;
        var stopAnimation=false 
        function animate () {
          if(!stopAnimation){
            stopAnimation=vm.eleHeight==endValue;
            requestAnimationFrame(animate);
            TWEEN.update()
          }else{ 
            if(callback && callback instanceof Function){
              callback();
            }
          } 
        }
        new TWEEN.Tween({ tweeningValue: startValue })
          .to({ tweeningValue: endValue }, 375)
          .onUpdate(function () {   
            vm.eleHeight = this.tweeningValue; 
          })
          .start()
        animate()
      }
    }
  }
</script>
<style>
</style>
