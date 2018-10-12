<template>
  <main-layout> 
      <silde-up  class="chartArea" :sildeUp="showChart" > 
        <div class="flex filterbar">
          <div class="filter-select">
            <v-select :options="topMenuOptList" :selected='selectedIndex' :on-change="switchDataType">
            </v-select> 
          </div>
          <div class="filter-data"> 
          </div>
          <div class="filter-select" >
            <v-select :options="proOptList" :selected='proOptIdx' :on-change="switchProduct">
            </v-select> 
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
      <div class="dataArea" v-show="proOptIdx<=0">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div>  
            <div class="gradientbar">   
              <div class="datafilterbar date-filter pdrow" ref="datebar">
                <span class="block"></span>
               <span v-for="(filteritem,fidx) in filterDate" :class="{active:fidx === activeDateIdx}" v-on:click="switchfilterDate(fidx)">{{filteritem | timeFormat(fidx === activeDateIdx?'%Y-%m-%d':'%m-%d')}}</span>
                <span class="block"></span>
               </div> 
            </div>
            <div class="datarows">
              <div class="datarow pdrow" v-for="(row,i) in chartData" v-on:click="switchProduct(row,i)">
                <span class="text-l">{{row.name}}</span> 
                <ani-num class="text-r" :value="row.data[activeDateIdx][prokey] ||0"></ani-num>
              </div>
            </div>
        </div> 
        <div class="dataArea" v-show="proOptIdx>0">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div>  
            <div class="dataheader pdrow" >
              <span class="text-l">日期 :</span> 
              <span class="text-r">{{prokey | upper}} :</span>
            </div>
            <div class="datarows">
               <div class="datarow pdrow" v-for="(row,i) in datarows">
                <span class="text-l">{{row.count_date}}</span> 
                <ani-num class="text-r" :value="row[prokey] || 0"></ani-num>
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
        proOptIdx:0, 
        activeDateIdx:0,
        datarows:[],
        currtproduct:{
          max:0,
          min:0
        },  
        dateRange:30,
        prokey:'uv',
        options:{inited:false},
        filterDate:[], 
        colors:config.color,
        topMenuOptList:[{key:'uv',value:'UV'},{key:'nuv',value:'NUV'}], 
        proOptList:[{key:S_ALLPRO,value:'总UV'}],
        chartData:[],
        productList:{} 
      }
    },
    props: {
      apiurl: {
        type: String,
        require: true
      } 
    },
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
                 {dataType:vm.prokey,days:30},
                function(res) { 
                  vm.initData(res); 
                  vm.refreshChart(); 
                });
      },
      initData:function(resp){
        this.chartData=this._prefix(resp); 
        var proOptList=[];
        this.chartData.forEach(function(d,i){ 
          proOptList.push({key:i,value:d.name})
        })
        this.proOptList=proOptList;
      },
      _prefix:function(products){
        var vm=this;
        var sumPro={data:[],name:'总'+vm.prokey.toUpperCase()}
        for (var i = 0; i < 30; i++) {
           var count_date=mytool.dateformat(mytool.getDate(i-30),'yyyy-MM-dd');
           var oneDay={count_date:count_date};
           oneDay[vm.prokey]=mytool.sum(products,function(item){ 
            let value=0;
            item.data.forEach(function(d){
              value=d.count_date==count_date?d[vm.prokey]:value;
            })
            return value;
           })
           sumPro.data.push(oneDay);
        }
        return [sumPro].concat(products);
      },
      refreshChart:function(){
        var vm=this; 
        var data=vm.chartData[vm.proOptIdx].data.slice(-vm.dateRange);  
        var serieData=[]; 
        var filterDate=[];
        data.forEach(function(item){
          let timestamp=new Date(item.count_date).getTime();
          filterDate.push(timestamp);
          serieData.push({xAxisName:'日期',xAxis:timestamp,yAxis:item[vm.prokey]});
        });
        var extent=mytool.extent(data,function(i){
          return i[vm.prokey];
        })
        vm.currtproduct={
          min:extent[0],
          max:extent[1],
        };
        vm.filterDate=filterDate;
        vm.options={ 
          serie:{
            name:vm.prokey.toUpperCase(),
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
      switchDataType:function(product,idx){
        this.prokey=product.key; 
        this.fetchData();  
      },
      switchChart:function(){
        this.showChart=!this.showChart;
      },
      switchDateRange:function(range){ 
        this.dateRange=range;
        this.refreshChart();
      },
      switchfilterDate:function(index){ 
        this.switchActiveDate(index);
        this.$refs.lineChart.$emit('$lineChart:switchdate',index);
      },
      switchProduct:function(product,idx){
        this.proOptIdx=idx; 
        this.refreshChart(); 
      }
    }
  }
</script>
