<template>
  <div  :style="{height:height+'px'}" class="commonChart barChart">
    <div class="tooltipsbox" v-show="showTooltip" :style="{top:tbp.top+'px',left:tbp.left+'px'}">
      <div class="closeicon iconfont icon-close" v-on:click="closeTooltip"></div>
      <span class="tooltip" v-for="(tooltip,i ) in tooltips">
        <i class="fa fa-circle colorpoint" :style="{color:color(i)}" ></i> {{tooltip.name}}:{{tooltip.data}}
      </span>
    </div>
    <svg :width="width" :height="svgHeight" :id="domId">
      <g :transform="transform(grid)">
        <g v-for="(serie,index ) in series" :key="index" :fill="index | gcolor" v-if='serie.show'> 
          <chart-rect :y="item.y" :x="item.x" :height="barwidth" :width="item.width"   v-for="(item,itemidx) in serie.rectList" :key="itemidx" v-on:click.native="toShowTooltip(itemidx)"></chart-rect>
        </g>
      </g>
      <g class="axis axis-y" :transform="transform(grid)" > 
          <text y="0" x="0" dy="12px"  class="tick" v-for="(axis,index ) in xAxis.data" :transform="transform({'left':0,'top':(barwidth+margin) * index+0.5*margin})" >{{axis}}</text> 
      </g>
    </svg>
    <slot></slot>
  </div>
</template>

<script>   
  import ChartRect from './ChartRect.vue';
  import mytool from '../mytool';
  import config from '../gConfig';
  export default {
    data() { 
      return {
        xAxis:{
          data:[]
        },
        series:[],
        max:0,
        showTooltip:false,
        tbp:{x:0,y:0},
        tooltips:[],
        color:config.color,
        grid:config.chartsize.bargrid,
        barwidth:config.chartsize.barwidth,
        barMargin:config.chartsize.barmargin,
        margin:config.chartsize.barmargin,
        svgHeight:400,
        barLength:this.width * 0.7,
        selected:[]
      };
    },
    props:{
      domId: {
        type: String,
        require: true
      },
      width: {
        type: Number,
        default: 360
      },
      height: {
        type: Number,
        default: 400
      },
      options:{
        type:Object,
        required: true
      }
    },
    components: {
      ChartRect:ChartRect
    },
    mounted:function() { 
      this._initChart()
    },
    updated:function(){
      this._calcgrid();
    },
    methods:{
      barHeight:function(barData){
        return barData/this.max * this.barLength
      },
      transform:function(grid){
        return 'translate('+grid.left+','+grid.top+')';
      },
      _initChart: function() {
        this._renderChart(); 
        this.$watch('options', this._refreshChart,{deep:true});  
      },
      _refreshChart:function(){
        this._renderChart();
        this.closeTooltip();
      },
      _renderChart: function() { 
          var vm=this;
          if (vm.options.series){  
            vm.xAxis = vm.options.xAxis;  
            vm.selected=vm.options.selected; 
            var length=vm.xAxis.data.length;
            var series = vm.options.series;
            var max = 0;
            for (var i = 0; i < length; i++) {
                var barMax = mytool.sum(series, function(item) {
                    return item.show?item.data[i]:0;
                });
                max = barMax > max ? barMax : max;
            };
            vm.max = max;
            vm.svgHeight= length * (vm.barwidth+vm.barMargin)+vm.grid.top+vm.grid.bottom;
            if((vm.height-vm.svgHeight)>length){
              var margin=Math.ceil((vm.height-vm.svgHeight)/length);
              vm.margin=vm.barMargin+margin;
              vm.svgHeight=vm.height;
            }else{
              vm.margin=vm.barMargin;
            }
            for (var i = 0; i < series.length; i++) {
                var serie = series[i]; 
                serie.rectList = [];
                for (var idx = 0; idx < serie.data.length; idx++) {
                    var data = serie.data[idx];
                    var rect={
                        y: (vm.barwidth+vm.margin) * idx+0.5*vm.margin,
                        x: i > 0 ? series[i-1].rectList[idx].endX : 0,
                        width:Math.ceil(vm.barHeight(data)) 
                    };
                    rect.endX=serie.show?rect.x+rect.width:rect.x;
                    serie.rectList.push(rect);
                }  
            }; 
            vm.series=series; 
          }
      },
      _calcgrid:function(){
        var svg=document.getElementById(this.domId);
        var ticks=svg.getElementsByClassName('tick'); 
        var maxtick=mytool.max(mytool.makeArray(ticks),function(tick){ 
            return tick.getBBox().width;
        });
        var padding=(this.width-this.barLength-maxtick-10)/2;
        this.grid.left=maxtick+padding; 
      },
      toShowTooltip:function(idx){ 
        var tooltips=[]; 
        var y=event.offsetY;
        var lastrect=this.series[0].rectList[idx]; 
        this.series.map(function(serie,i){
          tooltips.push({name:serie.name,data:serie.data[idx]});
        }); 
        this.tbp={top:lastrect.y,left:this.grid.left+10}; 
        this.showTooltip=true;
        this.tooltips=tooltips;
      },
      closeTooltip:function(){
        this.showTooltip=false;
      }
    }
  }
</script>
<style scoped>
.tooltipsbox{
    position: absolute;
    display: flex;
    flex-direction: column;
    background-color: rgba( 24,19 ,33, .7);
    color: #FFF;
    padding: 4px 6px;
    border-radius: 4px; 
    z-index: 999;
    text-align: left;
}
.tooltipsbox .tooltip{
  padding: 2px 0;
}
.tooltipsbox .closeicon{
  position: absolute;
  top: -7px;
  right: -7px;
  width: 14px;
  height: 14px;
  background-color: rgb( 216,216,216); 
  border-radius: 7px;
  font-size: 7px;
  line-height: 16px;
  text-align: center;
  color: #000;
}
</style>