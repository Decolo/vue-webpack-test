<template>
 <div  :style="{height:height+'px'}" class="commonChart pieChart">
    <slot></slot>
    <div class="chart-legend" ref="chartlegend" v-if="showlegend"> 
    </div>
    <svg ref="chartsvg"  :width="width" :height="height" class="piechart transtion-tt" :selectedIndex="selectedIndex" :style="'transform:rotate('+rotateDeg+'deg)'" ></svg> 
  </div>
</template>

<script>
import config from '../gConfig';
import * as d3 from "d3";
import mytool from '../mytool';
var piePath;
var DURATION = 1500;
var DELAY = 500;
var color = config.color;
var darkcolor = config.darkcolor;
export default {
    data() {  
            return {
                pie: {},
                rotateDeg: 0,
                pieData: {}
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
            selectedIndex: {
                type: Number,
                default: 0
            },
            showlegend:{
                type:Boolean,
                default:true
            }
        },
        mounted: function() {
            this._initChart()
        },
        methods: {
            _initChart: function() {
                this._renderChart();
                this.$watch('options', this._renderChart);
                this.$watch('selectedIndex', this._transformChart);
            },
            _renderChart: function() {
                var vm = this;
                if (this.options.inited) { 
                    function drawPieChart(element, data) { 
                        var width = vm.width,
                            height = vm.height,
                            radius = Math.min(width, height) / 2,
                            svg = d3.select(element);
                        var pie = svg.append('g')
                            .attr(
                                'transform',
                                'translate(' + width / 2 + ',' + height / 2 + ')'
                            );
                        var twoPi = 2 * Math.PI;
                        var piedata = vm.pieData = d3.pie().sortValues(null)(data);
                        var arc = d3.arc()
                            .outerRadius(radius - 20)
                            .innerRadius(0); 
                        var pieChartPieces = pie.classed("chartshape", true).datum(data)
                            .selectAll('path')
                            .data(piedata)
                            .enter()
                            .append('path')
                            .attr("fill", function(d, i) {
                                return color(i);
                            })
                            .attr('d', arc)
                            .each(function() {
                                this._current = { startAngle: 0, endAngle: 0 };
                            })
                            .transition()
                            .duration(DURATION)
                            .attrTween('d', function(d) {
                                var interpolate = d3.interpolate(this._current, d);
                                this._current = interpolate(0);
                                return function(t) {
                                    return arc(interpolate(t));
                                };
                            });

                        vm._drawChartLenged(data);  
                        drawChartCenter();  

                        function drawChartCenter() {
                            var centerContainer = pie.append('g')
                                .attr('class', 'pieChart--center');
                            // centerContainer.append('circle')
                            //     .attr('class', 'pieChart--center--outerCircle')
                            //     .attr('r', 0)
                            //     .transition()
                            //     .duration(DURATION)
                            //     .delay(DELAY)
                            //     .attr('r', radius - 50);
                            centerContainer.append('circle')
                                .attr('id', 'pieChart-clippy')
                                .attr('class', 'pieChart--center--innerCircle')
                                .attr('r', 0)
                                .transition()
                                .delay(DELAY)
                                .duration(DURATION)
                                .attr('r', radius - Math.floor( height / 5 ))
                                .attr('fill', '#292536');
                        }
                    }
                    drawPieChart(this.$refs.chartsvg, this.options.data);
                }
            },
            _transformChart: function() {
                if(this.selectedIndex>=0){
                    var item = this.pieData[this.selectedIndex];
                    var deg = -(item.endAngle + item.startAngle) / 2 / 2 / Math.PI * 360;
                    this.rotateDeg = deg;
                }else{
                    this.rotateDeg = 0;
                }
                this._drawChartLenged(this.options.data,this.selectedIndex);
                // this._drawChartMask();
            },
            _drawChartMask:function(){
                var selectedIndex=this.selectedIndex; 
                d3.select(this.$refs.chartsvg)
                  .select('.chartshape')
                  .selectAll('path')
                  .attr("fill", function(d, i) {
                        return selectedIndex>=0?i===selectedIndex?color(i):darkcolor(i):color(i);
                  })
            },
            _drawChartLenged:function (data,index){
                if(this.showlegend){
                    var legendbar=d3.select(this.$refs.chartlegend);
                        legendbar.html('');
                        var legend=typeof index === 'number' && index>=0?data[index]:mytool.sum(data);
                        legendbar  
                        .append(function() { 
                            var span=document.createElement("span");
                            span.innerText=legend; 
                            return  span;
                        })  
                        .append(function() { 
                            var span=document.createElement("p");
                            span.innerText=legend; 
                            return  span;
                        })
                        .attr('style', 'opacity:0')
                        .transition()
                        .delay(1000)
                        .duration(DELAY)
                        .ease(d3.easeBounce)
                        .attrTween('style', function(d) { 
                            return function(t) {
                                return 'opacity:'+t;
                            };
                        })
                }
            } 
        }
}
</script>
<style>
  
.pieChart--center--innerCircle {
  fill: #292536;
}  
.pieChart--center--outerCircle {
  fill: rgba( 0, 0, 0, 0.25 );
} 
.hidden {
  display: none;
}

</style>
