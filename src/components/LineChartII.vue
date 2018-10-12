<template>
  
  <div  :style="{height:height+'px'}" class="commonChart lineChart">
  <div class="tooltipsbox" :class="positionClass" ref="tooltip" v-show="showTooltip" :style="{top:tooltipStyle.top+'px',left:tooltipStyle.left+'px',marginLeft:-tooltipStyle.marginLeft+'px'}">
      <div class="arrow" :style="{marginLeft:tooltipStyle.marginLeft+'px'}"></div>
      <div class="closeicon iconfont icon-close" v-on:click="closeTooltip"></div>
      <div class="tipsarea">
        <span class="tipname" v-for="(serie,i) in series">
          <i class="fa fa-circle colorpoint" :style="{color:linecolor(i)}" ></i> {{serie.name}}: {{serie.data[activeIdx]}}
        </span>
        <span class="tooltip">日期{{tbp.xAisText}}</span>
      </div>
    </div>
  <svg ref="linechart" :width="width" :height="height">
      <defs>
        <linearGradient y2="1" x2="0" y1="0" x1="0" id="linearColor">
          <stop stop-color="rgb(214,103,205)"  stop-opacity="0.35" offset="0"/>
          <stop stop-color="rgb(214,103,205)" stop-opacity="0.05" offset="1"/>
        </linearGradient> 
      </defs>
      <g class="panel" ref="panel" :transform="transform({left:0,top:grid.top})" > 
        <g class="axis axis--x"  :transform="transform({left:0,top:svgHeight})" >
          <rect class="axisback" x='0' y='0' height='20' :width='width'></rect>
          <g> 
          <g class="tick" opacity="1" :class="{active:isActive(i)}" :transform="transform({left:xrange(tick),top:0})"  v-for="(tick,i) in xAxisData" v-show="isTickShow(i)" @click="doActive(i)">
            <rect class="tickback" x='-10' y='0' height='20' width='20'></rect>
            <text  class="axistick" y="7" x="0.5" dy="0.71em">{{tick | tickFormat}}</text> 
          </g>
          <g class="tick active" :class="{first:activeIdx==0,last:activeIdx==xAxisData.length-1}" v-if="activeIdx<xAxisData.length"  :transform="transform({left:activePointX(activeIdx),top:0})">
            <rect class="tickback" x='-10' y='0' height='20' width='20'></rect>
            <text  class="axistick" y="7" x="0.5" dy="0.71em">{{xAxisData[activeIdx] | tickFormat}}</text>
            <text  class="extratick" y="25" x="0.5" dy="0.71em">{{xAxisData[activeIdx] | yearMonth}}</text>
          </g>
          </g>
        </g>
        <g class="serie" v-for="(serie,i) in series">
          <path class="area" :d="serie.areaPath" :fill="areacolor(i)" @click="doNearActive()" ></path>
          <path class="line" :d="serie.linePath" :stroke="linecolor(i)"></path>
        </g> 
        <g class="ticklines" v-for="serie in series">
          <circle class="tickcircle" :cx="xrange(line)" :cy="yrange(serie.data[i])-3" r="2" stroke="white" stroke-width="1" fill="none" v-for="(line,i) in xAxisData" v-show="isActive(i)"></circle>
          <line class="tickline" v-for="(line,i) in xAxisData" 
          :x1="xrange(line)" :y1="yrange(serie.data[i])" :x2="xrange(line)" :y2="svgHeight"
          @click="doActive(i)" :class="{active:isActive(i)}"></line>
        </g>
      </g>
  </svg>
  <slot></slot>
  </div>
</template>

<script>
  import config from '../gConfig';
  import TWEEN from 'tween';
  import * as d3 from "d3"; 
export default {
    data() {
            var grid=config.chartsize.lineGrid; 
            return { 
                grid:grid,
                color:config.color,
                linecolorList:config.linecolors,
                svgWidth:this.width - grid.left - grid.right,
                svgHeight:this.height - grid.top - grid.bottom,
                series:[],
                xAxisData:[],
                serieName:'',
                activeIdx:0, 
                showTooltip:false,
                tbp:{x:0,y:0,text:''},
                tooltipStyle:{top:0,left:0},
                tooltipwidth:0,
                tpm:grid.tooltipMargin,
                positionClass:'',
                tweeningIdx:0,
                maxY:0
            };
        },
        props: { 
            width: {
                type: Number,
                default: 360
            },
            height: {
                type: Number,
                default: 400
            },
            options: {
                type: Object,
                required: true
            },
            lockMax:{
              type:Boolean,
              default:true
            }
        },
        watch:{
          series: function (series) {
            if(this.lockMax){
              this.lockMaxActive();
            }
            for(let i in series){
               this.tweenLine(series[i]);
            }
          }
        },
        mounted: function() {
            this._renderChart();
            this.$watch('options', this._refreshChart,{deep:true});
            this.$on('$lineChart:switchdate', function(index){
              this.activeIdx=index; 
              this.toShowTooltip();
            });  
        },
        updated:function(){ 
        },
        filters:{
          tickFormat:d3.timeFormat('%d'),
          yearMonth:d3.timeFormat('%Y-%m'),
          ymdformat:d3.timeFormat('%Y-%m-%d')
        },
        methods: { 
            areacolor:function(i){
              var vm=this; 
              return vm.series.length==1?'url(#linearColor)':'transparent';
            },
            linecolor:function(i){
              var vm=this; 
              return 'rgb('+vm.linecolorList[config.ranged(i,vm.linecolorList.length)]+')';
            },
            tweenLine:function(serie){
                var vm = this;   
                var serieData=serie.data; 
                vm.tweeningIdx=0;
                function animate () { 
                  if(vm.tweeningIdx!=serieData.length){
                    requestAnimationFrame(animate);
                    TWEEN.update()
                  } 
                }
                new TWEEN.Tween({ idx: 0 })
                  .to({ idx: serieData.length }, serieData.length*50)
                  .onUpdate(function () { 
                    vm.tweeningIdx=this.idx.toFixed(0);
                    var tempdata=serieData.slice(0,vm.tweeningIdx);
                    vm.$set(serie,'areaPath',d3.area()
                      .x(function(d,i) { return vm.xrange(vm.xAxisData[i]); })
                      .y1(function(d,i) { return vm.yrange(d); }).y0(vm.yrange(0))(tempdata)); 
                    vm.$set(serie,'linePath',d3.line()
                      .x(function(d,i) {return vm.xrange(vm.xAxisData[i]); })
                      .y(function(d,i) {return vm.yrange(d); })(tempdata));
                  })
                  .start()
                animate()
            },
            lockMaxActive:function(i){
              var vm=this;
              var unlocked=true;
              vm.series.forEach(function(serie){
                serie.data.forEach(function(m,i){
                  if(unlocked && m==vm.maxY){
                    vm.activeIdx=i;
                    vm.$emit('dateChange',i);
                    unlocked=false;
                  }
                })
              })
            },
            _refreshChart:function(){ 
              this._renderChart(); 
              if(this.activeIdx>this.xAxisData.length){
                this.doActive(0)
              };
              this.closeTooltip();
            },
            isTickShow:function(i){
              var tickstep= 20<=this.xAxisData.length?2:1; 
              return i % tickstep==0 
            },
            isActive:function(i){
              return this.activeIdx==i;
            }, 
            doNearActive:function(){
              var format=d3.timeFormat('%Y-%m-%d');
              var clickDate=format(this.xrange.invert(event.offsetX));
              for (var i = 0; i < this.xAxisData.length; i++) {
                var areadate=format(this.xAxisData[i]);
                if(areadate===clickDate){
                  return this.doActive(i);
                }
              }
            },
            activePointX:function(i){
              return this.xAxisData.length && this.xAxisData[i]?this.xrange(this.xAxisData[i]):0;
            },
            activePointY:function(i){
              return this.serie.data.length && this.serie.data[i]?this.yrange(this.serie.data[i]):0;
            },
            doActive:function(i){
              this.activeIdx=i;
              this.toShowTooltip();
              this.$emit('dateChange',i);
            },
            transform:function(grid){
              return 'translate('+grid.left+','+grid.top+')';
            },
            xrange:function(){
              return 0;
            },
            yrange:function(){
              return 0;
            },
            _renderChart:function(){
              var vm=this;
              if (vm.options.series){ 
                var grid=vm.grid=Object.assign({}, vm.grid,vm.options.grid);
                vm.svgHeight=this.height - grid.top - grid.bottom;
                var svg=d3.select(vm.$refs.linechart),
                g = d3.select(vm.$refs.panel); 
                var series=vm.series=this.options.series; 
                var xAxisData=vm.xAxisData=this.options.xAxis.data; 
                var x =vm.xrange = d3.scaleTime()
                .domain([xAxisData[0], xAxisData[xAxisData.length - 1]])
                .range([vm.grid.left, vm.svgWidth+vm.grid.left]);

                var my=vm.maxY=d3.max(series, function(s) { return d3.max(s.data, function(d) { return d; }); });
                var y =vm.yrange = d3.scaleLinear()
                          .domain([0,my])
                          .range([vm.svgHeight,0]); 
              }
            },
            toShowTooltip:function(){ 
              var idx=this.activeIdx;
              if(idx>=0){
                var format=d3.timeFormat('%Y-%m-%d'),
                    d=this.series[0].data[idx], 
                    xAisText=format(this.xAxisData[idx]);
                this.tbp={xAisText:xAisText}; 
                this.showTooltip=true;  
                this.$nextTick(function () { 
                  var tooltipwidth=this.tooltipwidth=this.$refs.tooltip.clientWidth,
                      tooltipHeight=this.$refs.tooltip.clientHeight,
                      xdomain=this.xrange(this.xAxisData[idx]),
                      ydomain=this.yrange(d)+this.grid.top-2,
                      top=0,
                      left=0,
                      rightor=xdomain+this.tpm+tooltipwidth>this.svgWidth,
                      leftor=xdomain-this.tpm-tooltipwidth<0,
                      bottomor=ydomain+tooltipHeight/2>this.height;
                  var leftlocal={
                    tipstyle:{
                      left:xdomain-tooltipwidth-this.tpm,
                      top:ydomain,
                      marginLeft:0
                    },
                    positionClass:'opps'
                  },rightlocal={
                    tipstyle:{
                      left:xdomain+this.tpm,
                      top:ydomain,
                      marginLeft:0
                    },
                    positionClass:''
                  },toplocal={
                    tipstyle:{
                      left:xdomain-tooltipwidth/2-this.grid.left,
                      top:ydomain-tooltipHeight/2-this.tpm,
                      marginLeft:0
                    },
                    positionClass:'top'
                  };
 
                  var local=bottomor?toplocal:rightor?leftor?toplocal:leftlocal:rightlocal;

                  if(local.positionClass==='top'){
                      if(xdomain-tooltipwidth/2-this.grid.left<0){
                        local.tipstyle.marginLeft=xdomain-tooltipwidth/2-this.grid.left
                      }else if(xdomain+tooltipwidth/2-this.grid.left>this.width){
                        local.positionClass='top opps';
                        local.tipstyle.marginLeft=xdomain+tooltipwidth/2-this.grid.left-this.width;
                      }
                  }
                  this.positionClass=local.positionClass;
                  this.tooltipStyle=local.tipstyle;
                }) 
              }
            },
            closeTooltip:function(){
              this.showTooltip=false;
            }
        }
}
</script>  
<style scoped> 
.axisback{
  fill:rgb(76,71,95);
  stroke: rgb(76,71,95);
}
.tickback{
  fill:#FFF;;
  stroke:#FFF;
}
.tick .tickback{
  display: none;
}
.tick.active,
.tick.active .tickback{
  display: block !important;
}
.tick.first .extratick{
  text-anchor: start;
}
.tick.last .extratick{
  text-anchor: end;
}
.axis{
  fill:none;
  text-anchor: middle;
}
.axistick{ 
  font-family: sans-serif;
  font-size: 12px;
  stroke: #FFF;
  fill:#FFF;
}
.tick.active .axistick{
  stroke: #000;
  fill: #000;
}
.extratick{
  font-family: sans-serif;
  font-size: 12px;
  stroke: rgb(153,150,163);
}
.axis path,
.axis line {
  fill: none;
  stroke: #FFF;
  shape-rendering: crispEdges;
}

.area { 
  stroke-width: 1.5px;
}
.line{
  fill:none;
  stroke-width: 1.5px;

}
.tickline{
  stroke:rgb(107,105,117);
  text-anchor: start;
  stroke-width:1px;
}
.tickline.active{
  stroke:#FFF; 
  stroke-width:1.5px;

}
.tickcircle{
  fill: #000;
}
.label {
  text-anchor: middle;
}

.label rect {
  fill: white;
}

.label-key {
  font-weight: bold;
}
.tooltipsbox{
    position: absolute;
    background-color: rgba( 24,19 ,33,1);
    font-size: 1rem;
    color: rgb(153,150,163);
    padding: 4px 6px;
    border-radius: 4px; 
    z-index: 999;
    white-space: nowrap;
    transform: translateY(-50%);
}
.tipsarea{
    text-align: left;
    display: flex;
    flex-direction: column;
    max-height: 120px;
    overflow-y: scroll;
    overflow-x: hidden;
}
.tooltipsbox .arrow {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    width: 0;
    height: 0;
    border-top: 8px solid #181321;
    border-right: 8px solid transparent;
}

.tooltipsbox.opps .arrow {
  right: 0;
  left: initial;
  transform: translate(50%, -50%) rotate(135deg);
}
.tooltipsbox.top .arrow {
  top: 100%;
  left: 50%;
  transform: translate(50%, -50%) rotate(225deg);
}
.tooltipsbox .tooltip{
  padding: 2px 0;
}
.tooltipsbox .tipname{
  flex-shrink: 0;
  color: #fff
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
.tooltipsbox.opps .closeicon {
  left: -7px;
  right: initial; 
}
</style>
