<template>
  <main-layout> 
      <silde-up  class="chartArea" :sildeUp="showChart" > 
        <div class="flex filterbar">
          <div class="filter-select">
            <v-select :options="productOptList" :selected='selectedIndex+1' :on-change="switchProduct">
            </v-select> 
          </div>
          <div class="filter-data">
            <div class="cr">
               <ani-num :value='dproduct.data' class="fd-number"></ani-num> 
               <span class="fd-text">{{filterText}}数</span>
            </div>
          </div>
          <div class="filter-data align-right">
            <span class="fd-number">{{dproduct.data/chartData[key].total | percent}}</span>
            <span class="fd-text">占比</span>
          </div> 
          <div class="arrow" ></div>
          <div class="line" ></div> 
        </div> 
        <swiper :on-switch="switchfilterItemIndex" ref="chartswiper">
        <pie-chart class="swiper-item" v-for="filteritem in filterkeys"  :key="filteritem.key" :width="width" :height="height" :options="filteritem.options" :selectedIndex="selectedIndex" :showlegend="false">
                <div class="chart-title" > 
                    <i class="iconfont icon-table"></i>
                    <span>{{filteritem.text}}</span>
                </div>
        </pie-chart>
        </swiper>
      </silde-up>
        <div class="dataArea">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div> 
            <div class="datafilterbar" v-show="!showChart">
               <span v-for="(filteritem,fidx) in filterkeys" :class="{active:filteritem.key === key}" v-on:click="switchfilterItem(filteritem,fidx)">{{filteritem.text}}</span>
            </div>
            <div class="dataheader" >
              <span>产品名称</span>
              <span>访客量</span>
              <span>占比</span>
            </div>
            <div class="datarows">
              <div class="datarow" v-for="(row,index) in chartData[key].datarows" v-on:click="changeStartAngle(row,index)">
                <span class="text-l"><i class="fa fa-square colorpoint" :style="{color:colors(index)}"></i> {{row.name}}</span>
                <span>{{row.data}}</span>
                <span>{{row.data / chartData[key].total | percent}}</span>
              </div>
            </div>
        </div>
        <!-- <div class="dataArea" v-show="selectedIndex>=0">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div>  
            <div class="dataheader" >
              <span>时间区间</span>
              <span>访客量</span>
              <span>占比</span>
            </div>
            <div class="datarow" v-for="filteritem in filterkeys">
              <span class="text-l pd-hor-sm">{{filteritem.text}}</span>
              <span>{{dproduct[filteritem.key]}}</span>
              <span>{{dproduct[filteritem.key]/sumproducts[filteritem.key] | percent}}</span>
            </div>
        </div> -->
  </main-layout>
</template>
<script> 
  import MainLayout from '../layouts/Main.vue'; 
  import PieChart from '../components/PieChart.vue';  
  import VSelect from '../components/Select.vue'; 
  import Arrow from '../components/reuse/Arrow.vue';
  import SildeUp from '../components/reuse/SildeUp.vue'; 
  import Swiper from '../components/reuse/Swiper.vue'; 
  import AniNum from '../components/AnimationNumber.vue';  
  import xhttp from '../xhttp';
  import config from '../gConfig';
  import mytool from '../mytool'; 
  export default {
  	data:function (){ 
  		return {
        showChart:true,
        width:config.chartsize.width,
        height:config.chartsize.height,
        selectedIndex:-1, 
        datarows:[],
        dproduct:{
           data:0,
           key:1 
        },
        total:0,
        key:'history_new',
        filterkeys:[
          {key:'history_new',text:'历史总用户',options:{inited:false}},
           // {key:'thirty_new',text:'近30日新增用户',options:{inited:false}},
           // {key:'seven_new',text:'近7日新增用户',options:{inited:false}},
           // {key:'yesterday_new',text:'昨日新增用户',options:{inited:false}}
        ],
        arrowStyle:{},
        lineStyle:{},
        colors:config.color,
        productOptList:[{key:'all',value:'全部产品'}],
        sumproducts:{
           UV:0,
           UV7:0,
           UV30:0,
           UVALL:0
        },
        chartData:{
          history_new:{},
          seven_new: {},
          thirty_new: {},
          yesterday_new: {}
        }
      }
    },
    computed: {
        filterText:function(){
          var vm=this;
          for(var index in vm.filterkeys){
             if(vm.key==vm.filterkeys[index].key){
              return vm.filterkeys[index].text;
             }
          }
        }
    },
    components: { 
      MainLayout:MainLayout,
      PieChart:PieChart,
      VSelect:VSelect,
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
        var today = mytool.dateformat(mytool.getDate(-1), "yyyy-MM-dd");
        var yesterday = mytool.dateformat(mytool.getDate(-2), "yyyy-MM-dd");
        var pre7day = mytool.dateformat(mytool.getDate(-8), "yyyy-MM-dd");
        var pre30day = mytool.dateformat(mytool.getDate(-31), "yyyy-MM-dd");
        xhttp.get('/wbSubscriber',
                {start:yesterday ,end:today },
                function(res) {    
                  vm.chartData.history_new=res.history; 
                  vm.initData(['history_new']);
                  vm.switchfilterKey('history_new');
                });
        // xhttp.get('/wbSubscriber',
        //         {start:pre7day ,end:today },
        //         function(res) {    
        //           vm.chartData.seven_new=res.history;
        //           vm.initData(['seven_new']);  
        //         });
      },
      initData:function(keys){
        var vm=this;
        keys.forEach(function(key){
          for(var index in vm.filterkeys){
            var filterkey=vm.filterkeys[index].key; 
            if(filterkey===key){
              var result=vm.packagedData(key);
              vm.filterkeys[index].options=result; 
            }
          }
        });    
      },
      refreshPage:function(){
        var vm=this;
        var key=vm.key;
        vm.productOptList=vm.chartData[key].productOptList;  
        vm.switchProduct(vm.productOptList[0]);
      },
      packagedData:function(key){
        var vm=this;
        var chartData=vm.chartData[key];
        var products=chartData.products;
        var productOptList=[{key:'all',value:'全部产品'}];
        var data=chartData.data; 
        var datarows=[];
        var arr=[];
        chartData.total=0;
        for (var pk in products) {
          var product=products[pk]; 
          chartData.total+=parseInt(data[pk]);
          arr.push(data[pk]);
          productOptList.push({key:pk,value:product});
          datarows.push({
              name:product,
              key:pk,
              data:data[pk]
          });
        }; 
        chartData.productOptList=productOptList;
        chartData.datarows=datarows; 
        return Object.assign({},{
            data:arr, 
            inited:true
          }); 
      },
      changeStartAngle:function(row,index){ 
        this.dproduct=row; 
        this.selectedIndex=index;  

      },
      switchProduct:function(product){
        var vm=this;  
        if(product.key=='all'){  
            vm.dproduct={
              data:parseInt(vm.chartData[vm.key].total)
            }; 
            this.selectedIndex=-1;
        }else{
          vm.chartData[vm.key].datarows.map(function(item,idx){
            if(product.key === item.key){
              vm.changeStartAngle(item,idx);
            }
          })
        }
      },
      switchChart:function(){
        this.showChart=!this.showChart;
      },
      switchfilterItemIndex:function(index){
        this.switchfilterKey(this.filterkeys[index].key);
      },
      switchfilterItem:function(item,index){
        this.key=item.key; 
        this.$refs.chartswiper.$emit('$Swiper:switch',index); 
      },
      switchfilterKey:function(key){
        this.key=key; 
        this.refreshPage();
      }
    }
  }
</script>  
