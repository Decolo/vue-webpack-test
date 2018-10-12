<template>
  <main-layout> 
      <silde-up  class="chartArea" :sildeUp="showChart" > 
        <div class="flex filterbar">
          <div class="filter-select">
            <v-select :options="topMenuOptList" :selected='selectedIndex' :on-change="switchProduct">
            </v-select> 
          </div>
          <div class="filter-data">
            <div class="cr">
               <ani-num :value="currtproduct.max" class="fd-number"></ani-num> 
               <span class="fd-text">最大值</span>
            </div>
          </div>
          <div class="filter-data align-right">
               <ani-num :value="currtproduct.min" class="fd-number"></ani-num> 
            <span class="fd-text">最小值</span>
          </div> 
          <div class="arrow" ></div>
          <div class="line" ></div> 
        </div>  
        <div :class="{leftActive:dateRange==30,rightActive:dateRange==7}"> 
          <div class="leftswitchbtn" @click="switchDateRange(30)"> <i class="fa fa-angle-left"></i> 近三十日</div>
            <div class="rightswitchbtn" @click="switchDateRange(7)">近七日  <i class="fa fa-angle-right"></i> </div>
          <line-chart  ref="lineChart" :width="width" :height="height" :options="options" v-on:dateChange="switchActiveDate">
          </line-chart> 
        </div>
      </silde-up>
        <div class="dataArea" v-show="selectedIndex<=0">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div>

            <div class="gradientbar"> 
            <div class="datafilterbar date-filter pdrow" ref="datebar">
            <span class="block"></span> 
               <span v-for="(filteritem,fidx) in filterDate" :class="{active:fidx === activeDateIdx}" v-on:click="switchfilterDate(filteritem,fidx)">{{filteritem | timeFormat(fidx === activeDateIdx?'%Y-%m-%d':'%m-%d')}}</span>
            <span class="block"></span> 
            </div>
            </div>
            <div class="dataheader pdrow" >
              <span class="text-l">产品名称</span> 
              <span class="text-r">{{serieName}}</span>
            </div>
            <div class="datarows">
              <div class="datarow pdrow" v-for="(row,i) in topMenuOptList" v-on:click="switchProduct(row,i)">
                <span class="text-l">{{row.value}}</span> 
                <ani-num class="text-r" :value="datarows[activeDateIdx]?datarows[activeDateIdx].productList[row.key]:0"></ani-num>
              </div>
            </div>
        </div>
        <div class="dataArea" v-show="selectedIndex>0">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div>  
            <div class="dataheader pdrow" >
              <span class="text-l">日期 :</span> 
              <span class="text-r">净增长:</span>
            </div>
            <div class="datarows">
               <div class="datarow pdrow" v-for="(row,i) in datarows">
                <span class="text-l">{{row.timestamp | timeFormat('%Y-%m-%d')}}</span> 
                <ani-num class="text-r" :value="row.productList[prokey]"></ani-num>
              </div>
            </div>
        </div>
  </main-layout>
</template>
<script> 
  import MainLayout from '../layouts/Main.vue';   
  import VSelect from '../components/Select.vue';  
  import LineChart from '../components/LineChart.vue'; 
  import Arrow from '../components/reuse/Arrow.vue';
  import SildeUp from '../components/reuse/SildeUp.vue'; 
  import Swiper from '../components/reuse/Swiper.vue'; 
  import AniNum from '../components/AnimationNumber.vue';  
  import xhttp from '../xhttp';
  import config from '../gConfig';
  import mytool from '../mytool'; 

  const S_ALLPRO='all';


  export default {
  	data:function (){ 
  		return {
        showChart:true,
        width:config.chartsize.width,
        height:config.chartsize.height,
        selectedIndex:0, 
        activeDateIdx:0,
        datarows:[],
        currtproduct:{
          max:0,
          min:0
        },  
        dateRange:30,
        prokey:S_ALLPRO,
        options:{inited:false},
        filterDate:[], 
        colors:config.color,
        topMenuOptList:[{key:S_ALLPRO,value:'全部产品'}],
        productDetail:{},
        chartData:[],
        productList:{},
        apiurl:'/wbNewUser',
        serieName:'净增用户'
      }
    } ,
    components: { 
      MainLayout:MainLayout, 
      VSelect:VSelect,
      LineChart:LineChart,
      Arrow:Arrow,
      SildeUp:SildeUp,
      AniNum:AniNum,
      Swiper:Swiper
    },
    created:function() {  
      this.fetchData()
    },
    methods:{
      fetchData:function () {
        var vm=this; 
        xhttp.get(vm.apiurl,
                 {start:mytool.dateformat(mytool.getDate(-30),'yyyy-MM-dd')},
                function(res) { 
                  vm.initData(res);
                  vm.switchProduct(vm.topMenuOptList[0]);
                });
      },
      initData:function(resp){  
        var dataList=this._preFix(resp.net);
        var topMenuOptList=[{key:S_ALLPRO,value:'全部产品'}]; 
        for(var pk in resp.products){
            topMenuOptList.push({key:pk,value:resp.products[pk]});
        };
        var chartData=[];
        for(let datek in dataList){
          var onedayDate=dataList[datek]; 
          for(var pk in resp.products){
            let p=resp.products[pk];
             onedayDate[pk]=onedayDate[pk]?onedayDate[pk]:0; 
          }; 
          chartData.push({date:datek,timestamp:new Date(datek).getTime(),productList:onedayDate});
        };
        chartData.sort(function(i1,i2){
          return i1.timestamp-i2.timestamp;
        }); 
        this.productList=resp.products;
        this.chartData=chartData;
        this.topMenuOptList=topMenuOptList;
      },
      _preFix:function(data){
        var result={};
        for(var key in data){
          if(key!='all'){
            result[key]=data[key];
          }
        }
        for (var key in data.all) {
           result[key].all=data.all[key];
        }
        return result;
      },
      refreshChart:function(){
        var vm=this;
        var data=vm.chartData.slice(-vm.dateRange);  
        var serieData=[]; 
        var filterDate=[];
        data.forEach(function(item){
          filterDate.push(item.timestamp);
          serieData.push({xAxisName:'日期',xAxis:item.timestamp,yAxis:item.productList[vm.prokey]});
        });

        var extent=mytool.extent(data,function(i){
          return i.productList[vm.prokey];
        })
        vm.currtproduct={
          min:extent[0],
          max:extent[1],
        };
        vm.filterDate=filterDate;
        vm.options={ 
          serie:{
            name:vm.serieName,
            data:serieData
          }
        };
        vm.datarows=data;  
      },
      switchActiveDate:function(idx){ 
        this.activeDateIdx=idx; 
        this.$nextTick(function () { 
          let bcw=this.$refs.datebar.clientWidth,
              bsw=this.$refs.datebar.scrollWidth,
              aw=this.$refs.datebar.getElementsByClassName('active')[0].clientWidth,
              pw=(bsw-aw)/(this.filterDate.length-1);
          this.$refs.datebar.scrollLeft=idx*pw-(bcw-aw)/2;
        });
      },
      switchProduct:function(product,idx){
        this.prokey=product.key;
        if(product.key=='all'){  
            this.selectedIndex=0;
        }else{  
            this.selectedIndex=idx; 
        }
        this.refreshChart();  
      },
      switchChart:function(){
        this.showChart=!this.showChart;
      },
      switchDateRange:function(range){ 
        this.dateRange=range;
        this.refreshChart();
      },
      switchfilterDate:function(item,index){ 
        this.switchActiveDate(index);
        this.$refs.lineChart.$emit('$lineChart:switchdate',index);
      },
      switchfilterKey:function(key){ 
      }
    }
  }
</script>  
