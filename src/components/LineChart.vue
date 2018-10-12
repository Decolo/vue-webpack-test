<template>
  
  <div  :style="{height:height+'px'}" class="commonChart lineChart">
  <div class="tooltipsbox" :class="positionClass" ref="tooltip" v-show="showTooltip" :style="{top:tooltipStyle.top+'px',left:tooltipStyle.left+'px',marginLeft:-tooltipStyle.marginLeft+'px'}">
      <div class="arrow" :style="{marginLeft:tooltipStyle.marginLeft+'px'}"></div>
      <div class="closeicon iconfont icon-close" v-on:click="closeTooltip"></div>
      <span class="tipname">{{serieName}} : {{tbp.text}}</span>
      <span class="tooltip">日期{{tbp.xAisText}}</span>
    </div>
  <svg ref="linechart" :width="width" :height="height">
      <defs>
        <linearGradient y2="1" x2="0" y1="0" x1="0" id="linearColor">
          <stop stop-color="rgb(214,103,205)"  stop-opacity="0.35" offset="0"/>
          <stop stop-color="rgb(214,103,205)" stop-opacity="0.05" offset="1"/>
        </linearGradient>
      </defs>
      <g ref="panel" :transform="transform({left:0,top:grid.top})"> 
        <g class="axis axis--x"  :transform="transform({left:0,top:svgHeight})" >
          <rect class="axisback" x='0' y='0' height='20' :width='width'></rect>
          <g>
            <g class="tick" opacity="1" :transform="transform({left:xrange(tick.xAxis),top:0})"  v-for="(tick,i) in serieData" v-show="isTickShow(i)" @click="doActive(i)">
              <rect class="tickback" x='-10' y='0' height='20' width='20'></rect>
              <text  class="axistick" y="7" x="0.5" dy="0.71em">{{tick.xAxis | tickFormat}}</text> 
            </g>
          <g class="tick active" :class="{first:activeIdx==0,last:activeIdx==serieData.length-1}" v-if="activeIdx<serieData.length" :transform="transform({left:activePointX(activeIdx),top:0})">
            <rect class="tickback" x='-10' y='0' height='20' width='20'></rect>
            <text  class="axistick" y="7" x="0.5" dy="0.71em">{{serieData[activeIdx].xAxis | tickFormat}}</text>
            <text  class="extratick" y="25" x="0.5" dy="0.71em">{{serieData[activeIdx].xAxis | yearMonth}}</text>
          </g>
          </g>
        </g>
        <g class="serie">
          <path class="area" :d="areaPath" @click="doNearActive()"></path>
          <path class="line" :d="linePath"></path>
        </g> 
        g
        <g class="ticklines" >
          <circle class="tickcircle" :cx="activePointX(activeIdx)" :cy="activePointY(activeIdx)-3" r="2" stroke="white" stroke-width="2" fill="none"></circle>
          <line class="tickline" v-for="(line,i) in serieData" 
          :x1="xrange(line.xAxis)" :y1="yrange(line.yAxis)" :x2="xrange(line.xAxis)" :y2="svgHeight"
          @click="doActive(i)" :class="{active:isActive(i)}"></line>
          <line class="tickline active"
          :x1="activePointX(activeIdx)" :y1="activePointY(activeIdx)" :x2="activePointX(activeIdx)" :y2="svgHeight"></line>
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
                svgWidth:this.width - grid.left - grid.right,
                svgHeight:this.height - grid.top - grid.bottom,
                serieData:[],
                serieName:'',
                activeIdx:0,
                linePath:'',
                areaPath:'',
                showTooltip:false,
                tbp:{x:0,y:0,text:''},
                tooltipStyle:{top:0,left:0},
                tooltipwidth:0,
                tpm:grid.tooltipMargin,
                oppsTooltip:false,
                tweeningIdx:0,
                maxY:0,
                positionClass:'',
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
          serieData: function (serieData) {
            this.tweenLine(serieData);
            if(this.lockMax){
              this.lockMaxActive();
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
        filters:{
          tickFormat:d3.timeFormat('%d'),
          yearMonth:d3.timeFormat('%Y-%m'),
          ymdformat:d3.timeFormat('%Y-%m-%d')
        },
        methods: { 
            tweenLine:function(serieData){
                var vm = this;  
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
                    var tempdata=vm.serieData.slice(0,vm.tweeningIdx);
                    vm.areaPath=d3.area()
                      .x(function(d) { return vm.xrange(d.xAxis); })
                      .y1(function(d) { return vm.yrange(d.yAxis); }).y0(vm.yrange(0))(tempdata);

                    vm.linePath=d3.line()
                      .x(function(d) {return vm.xrange(d.xAxis); })
                      .y(function(d) {return vm.yrange(d.yAxis); })(tempdata);
                  })
                  .start()
                animate()
            },
            activePointX:function(i){
              return this.serieData.length && this.serieData[i]?this.xrange(this.serieData[i].xAxis):0;
            },
            activePointY:function(i){
              return this.serieData.length && this.serieData[i]?this.yrange(this.serieData[i].yAxis):0;
            },
            _refreshChart:function(){ 
              this._renderChart(); 
              if(this.activeIdx>this.serieData.length){
                this.doActive(0)
              };
              this.closeTooltip();
            },
            isTickShow:function(i){
              var tickstep= 20<=this.serieData.length?2:1; 
              return i % tickstep==0 
            },
            isActive:function(i){
              return this.activeIdx==i;
            }, 
            doNearActive:function(){
              var format=d3.timeFormat('%Y-%m-%d');
              var clickDate=format(this.xrange.invert(event.offsetX));
              for (var i = 0; i < this.serieData.length; i++) {
                var areadate=format(this.serieData[i].xAxis);
                if(areadate===clickDate){
                  return this.doActive(i);
                }
              }
            },
            lockMaxActive:function(i){
              var vm=this;
              vm.serieData.forEach(function(m,i){
                if(m.yAxis==vm.maxY){
                  vm.activeIdx=i;
                  vm.$emit('dateChange',i);
                }
              })
            },
            doActive:function(i){
              this.activeIdx=i;
              this.$emit('dateChange',i);
              this.toShowTooltip();
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
              if (vm.options.serie){   
                var svg=d3.select(vm.$refs.linechart),
                g = d3.select(vm.$refs.panel);
                vm.serieName=this.options.serie.name;
                var serieData=vm.serieData=this.options.serie.data; 
                var x =vm.xrange = d3.scaleTime()
                .domain([serieData[0].xAxis, serieData[serieData.length - 1].xAxis])
                .range([vm.grid.left, vm.svgWidth+vm.grid.left]);
                var min=d3.min(serieData, function(s) { return s.yAxis; });
                min=min>0?0:min;
                var my=vm.maxY=d3.max(serieData, function(s) { return s.yAxis; })
                var y =vm.yrange = d3.scaleLinear()
                          .domain([min,my])
                          .range([vm.svgHeight,0]);  
              }
            },
            toShowTooltip:function(){
              var idx=this.activeIdx;
              if(idx>=0){
                var format=d3.timeFormat('%Y-%m-%d'),
                    d=this.serieData[idx],
                    text= d.yAxis,
                    xAisText=format(d.xAxis);
                this.tbp={text:text,xAisText:xAisText}; 
                this.showTooltip=true;  
                this.$nextTick(function () { 
                  var tooltipwidth=this.tooltipwidth=this.$refs.tooltip.clientWidth,
                      tooltipHeight=this.$refs.tooltip.clientHeight,
                      xdomain=this.xrange(d.xAxis),
                      ydomain=this.yrange(d.yAxis)+this.grid.top-2,
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
.tick.first .extratick{
  text-anchor: start;
}
.tick.last .extratick{
  text-anchor: end;
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
  fill: url(#linearColor);
  stroke-width: 1.5px;
}
.line{
  fill:none;
  stroke:rgb(214,103,205);
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
    display: flex;
    flex-direction: column;
    background-color: rgba( 24,19 ,33,1);
    font-size: 1rem;
    color: rgb(153,150,163);
    padding: 4px 6px;
    border-radius: 4px; 
    z-index: 999;
    text-align: left;
    white-space: nowrap;
    transform: translateY(-50%);
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
  right: 2px;
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
