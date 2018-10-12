<template>
  <main-layout > 
      <slide-up  class="chartArea" :sildeUp="showChart"> 
        <div class="flex filterbar">
          <div class="filter-select">
           <v-select :options="otherProOptList" :selected='otherProOptIdx' :on-change="switchOtherProduct">
            </v-select> 
          </div>
          <div class="filter-data" > 
            <span class="fd-number">VS</span>
          </div>
          <div class="filter-select" >
            <v-select :options="ownProOptList" :selected='ownProOptIdx' :on-change="switchOwnProduct">
            </v-select> 
          </div>  
          <div class="arrow"></div>
          <div class="line"></div> 
        </div> 
        <line-chart  ref="lineChart" :width="width" :height="height" :options="options"  v-on:dateChange="switchActiveDate">
        </line-chart> 
        <div class="chartlegend"> 
            <span class="legendItem" :class="{active:filterSourceKey==channel.key}" v-for="(channel,index ) in channels" :key="index" @click="filterSource(channel)">
               <i v-if="index>0" class="fa fa-square colorpoint" :style="{color:color(index-1)}" ></i>{{channel.name}}
            </span>
          </div>
      </slide-up>
        <div class="dataArea" v-if="!showProductDetail">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div>
            <div class="datafilterbar">
               <span v-for="(channel,idx) in channels" :class="{active:filterSourceKey==channel.key}" v-on:click="filterSource(channel)">{{channel.name}}</span>
            </div> 
            <div class="dataheader pdrow" >
              <span class="text-l">产品名称</span> 
              <span class="text-r">下载量</span>
            </div>
            <div class="datarows">
              <div class="datarow pdrow" v-for="row in allProducts" @click="switchOtherProduct(row)">
                <span class="text-l">{{row.productName}}</span>
                <span class="text-r">{{downloadOf(chartData[activeDateIdx],row)}}</span> 
              </div>
            </div>
        </div>
        <div class="dataArea" v-if="showProductDetail">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div>  
            <div class="dataheader pdrow" >
              <span class="text-l">渠道</span> 
              <span class="text-r">{{otherProOptList[otherProOptIdx].value}}</span>
              <span class="text-r" v-if="ownProOptIdx>0">{{ownProOptList[ownProOptIdx].value}}</span>
            </div>
            <div class="datarows ">
              <div class="datarow pdrow" v-for="(channel,index) in channels" >
                <span class="text-l"><i v-if="index>0" class="fa fa-square colorpoint" :style="{color:color(index-1)}" ></i>{{channel.name}}</span>
                <ani-num :value="downloadOf(listData[channel.key],currtProduct)" class="text-r"></ani-num>
                <ani-num v-if="ownProOptIdx>0" :value="downloadOf(listData[channel.key],ownProOptList[ownProOptIdx])" class="text-r"></ani-num>   
              </div>
            </div>
        </div>
  </main-layout>
</template>
<script> 
  import MainLayout from '../layouts/Main.vue'; 
  import LineChart from '../components/LineChartII.vue'; 
  import ColorBarChart from '../components/ColorBarChart.vue';
  import VSelect from '../components/Select.vue'; 
  import SlideUp from '../components/reuse/SildeUp.vue';
  import AniNum from '../components/AnimationNumber.vue'; 
  import Arrow from '../components/reuse/Arrow.vue'; 
  import xhttp from '../xhttp';
  import config from '../gConfig';
  import mytool from '../mytool'; 

  const S_ALLCHANNEL='all'; 
  const S_ALLPRODUCT='allproduct'; 

  export default {
    data:function (){ 
      return {
        showChart:true,
        showProductDetail:false,
        width:config.chartsize.width,
        height:config.chartsize.height,
        color:config.color,
        chartData:[],
        listData:{},
        activeDateIdx:0,
        otherProOptList:[{'key':S_ALLPRODUCT,'value':'全部产品'}], 
        otherProOptKey:S_ALLPRODUCT,
        otherProOptIdx:0,
        ownProOptList:[{'key':-1,'value':'无对比项'}],
        ownProOptKey:'-1', 
        ownProOptIdx:0,
        ownproducts:[],
        currtProduct:{}, 
        options:{inited:false},
        datarows:[],
        allProducts:[],
        otherProducts:[],
        channels:[{key:S_ALLCHANNEL,name:'全部渠道'},{key:'360',name:'360手机助手'},{key:'baidu',name:'百度手机助手'},{key:'yyb',name:'应用宝'}],
        source:[ ],
        filterSourceKey:S_ALLCHANNEL
      }
    },
    computed: {
      packageProduct:function(){
        var vm=this;
        var xAxis=[];
        var arr = [];
        var source=vm.source;
        var series=[];
        for (var key in source) { 
            xAxis.push(source[key]);
            arr.push(vm.currtProduct[key]);
        };
        series.push({ 
          type: 'bar',
          stack: 'source',
          data: arr 
        });  
        return {
            xAxis:{data:xAxis},
            series:series 
        }
      }
    },
    components: { 
      MainLayout:MainLayout,
      LineChart:LineChart,
      VSelect:VSelect,
      SlideUp:SlideUp,
      Arrow:Arrow,
      AniNum:AniNum,
      ColorBarChart:ColorBarChart
    },
    created:function() {  
      this.fetchData()
    },
    methods:{
      fetchData:function () {
        var vm=this;
        xhttp.get('/downloadPerDay',
                {source:vm.filterSourceKey==S_ALLCHANNEL?'':vm.filterSourceKey,
                    days:7},
                function(res) {
                    vm._initData(res); 
                    vm._renderChart();
                });
      },
      _initData:function(res) {
             var vm=this;
             var ownproducts=config.ownproducts;
             var products = vm.allProducts = vm._setProductDetails(res.products);
             vm.chartData= res.data.sort(function(d1,d2){
              return d1.timestamp-d2.timestamp;
             }); 
             /*Begin of initlizal Vselect Options*/
             var splicedPros=mytool.spliceArr(products,function(product) {
                 return ownproducts.indexOf(product.productName) < 0;
             }); 
             let otherPros = splicedPros[0];
             let otherProOptList=[{'key':S_ALLPRODUCT,'value':'全部产品'}]; 
             otherPros.forEach(function(p){
                otherProOptList.push({'key':p.key,'value':p.productName});
             })

             let ownPros = splicedPros[1];
             let ownProOptList=[{'key':S_ALLPRODUCT,'value':'无对比项'}]; 
             ownPros.forEach(function(p){
                ownProOptList.push({'key':p.key,'value':p.productName});
             }); 
             vm.otherProOptList=otherProOptList; 
             vm.otherProducts=otherPros;
             vm.ownProOptList=ownProOptList; 
             vm.ownproducts=ownPros;
             /*End of initlizal Vselect Options */
      },
      _renderChart:function(){
            var vm=this;
            var products =  vm._filterProducts();
            var series=[];
            var serieData=[]; 
            var ownserieData=[]; 
            var filterDate=[];
            vm.chartData.forEach(function(item){
              let xAxis=item.timestamp*1000
              let yAxis=0;
              let productsMap= mytool.arr2obj(item.products,function(pro){return pro.app_id});
              filterDate.push(xAxis);
              if(vm.otherProOptKey==S_ALLPRODUCT){
                yAxis=mytool.sum(vm.otherProducts,function(otpro){
                  if(!productsMap[otpro.key]){ 
                    return 0;
                  }else{
                    return productsMap[otpro.key].new_download
                  }
                });
              }else{  
                let p=productsMap[vm.otherProOptKey];
                yAxis=p && p.new_download?p.new_download : 0;
              }
              serieData.push(yAxis);
              if(vm.ownProOptKey >=0){
                ownserieData.push(productsMap[vm.ownProOptKey].new_download)
              }
            });  
            vm.filterDate=filterDate;
            series.push({
                name:vm.otherProOptList[vm.otherProOptIdx].value,
                data:serieData
            });
            if(ownserieData.length){
              series.push({
                name:vm.ownProOptList[vm.ownProOptIdx].value,
                data:ownserieData
              });
            }


            vm.options={ 
              xAxis:{
                name:'日期',
                data:filterDate
              },
              series:series,
              grid:{bottom:90}
            }; 
      },
      fetchProducts:function(){
        var vm=this; 
        var ids=[];
        ids.push(vm.otherProOptKey);
        vm.ownProOptIdx>0?ids.push(vm.ownProOptKey):void(0);
        xhttp.get('/downloadById',
                 {ids:ids.join(',') ,date:mytool.dateformat(vm.filterDate[vm.activeDateIdx],'yyyy-MM-dd')},
                function(res) { 
                   vm.listData={all:{products:ids.map(function(i){return {app_id:i,new_download:0}})}};
                   for(var key in res){
                    vm.listData[key]={products:res[key].map(function(r,i){
                      if(vm.listData.all.products[i]){
                        vm.listData.all.products[i].new_download+=r.downloadTimes;
                      }
                      r.new_download=r.downloadTimes;
                      return r;
                    })};
                   }; 
                });
      },
      doShowProductDetail:function(row){
        var vm=this; 
        vm.currtProduct=row;  
        vm.showProductDetail=true;
        vm.otherProOptList.forEach(function(item,index){
            if(row.key==item.key){
              vm.otherProOptIdx=index;
            }
        });
        vm.fetchProducts();
      },
      switchChart:function(){
        this.showChart=!this.showChart;
      },
      _filterProducts:function(){
             var vm=this;
             var otherPros=vm.otherProducts;
             var ownPros=vm.ownProOptKey<0?[]:vm.ownproducts.filter(function(p){return p.key===vm.ownProOptKey});
             return otherPros.concat(ownPros);
      },
      _setProductDetails:function(products) {
             var pmap={}; 
             for (let key in products) { 
                 pmap[key]={
                     productName: products[key],
                     key: key 
                 };
             }; 
             return mytool.obj2arr(pmap);
      },
      switchOtherProduct:function(product){
        var vm=this;
        vm.otherProOptKey=product.key;
        if(product.key==S_ALLPRODUCT){  
          vm.showProductDetail=false;
        }else{
          vm.allProducts.forEach(function(item,index){
            if(product.key==item.key){
              vm.doShowProductDetail(item)
            }
          })
        };
        vm._renderChart();
      },
      switchOwnProduct:function(product){
        var vm=this;
        vm.ownProOptKey=product.key; 
        vm.ownProOptList.forEach(function(item,index){
            if(product.key==item.key){
              vm.ownProOptIdx=index;
            }
        });
        vm._renderChart();
        if(vm.otherProOptIdx>0){
          vm.fetchProducts();
        }
      },
      filterSource:function(channel){
        this.filterSourceKey=channel.key;
        // this.showProductDetail=false;
        // this.otherProOptIdx=0;
        this.fetchData();
      },
      switchActiveDate:function(idx){ 
        this.activeDateIdx=idx; 
      },
      downloadOf:function(oneday,pro){ 
        if(oneday && oneday.products){
          let vm=this;
          let productsMap= mytool.arr2obj(oneday.products,function(item){return item.app_id});
          if(!productsMap[pro.key]){ 
            return 0;
          }else{
            let result=productsMap[pro.key].new_download; 
            return result;
          }
        }else{
          return 0;
        }
      }
    }
  }
</script>  
