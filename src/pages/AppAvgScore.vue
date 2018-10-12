<template>
  <main-layout> 
      <slide-up  class="chartArea" :sildeUp="showChart"> 
        <div class="flex filterbar">
          <div class="filter-select">
           <v-select :options="otherProOptList" :selected='otherProOptIdx' :on-change="switchOtherProduct">
            </v-select> 
          </div>
          <div class="filter-data" v-show="!showProductDetail"> 
            <span class="fd-number">VS</span>
          </div>
          <div class="filter-select" v-show="!showProductDetail">
            <v-select :options="ownProOptList" :selected='ownProOptIdx' :on-change="switchOwnProduct">
            </v-select> 
          </div> 
          <div class="filter-data align-right" v-show="showProductDetail">
            <span class="fd-number">{{currtProduct.avgScore}}</span>
            <span class="fd-text">平均分</span>
          </div> 

          <div class="arrow"></div>
          <div class="line"></div> 
        </div> 
        <bar-chart v-if="!showProductDetail" :width="width" :height="height" :options="options" domId="appDownChart">
        </bar-chart>
        <div class="chartlegend" v-if="!showProductDetail" > 
            <span class="legendItem" :class="{active:filterSourceKey==channel.key}" v-for="(channel,index ) in channels" :key="index" @click="filterSource(channel)">
               <i v-if="index>0" class="fa fa-square colorpoint" :style="{color:color(index-1)}" ></i>{{channel.name}}
            </span>
          </div>
        <color-bar-chart v-if="showProductDetail" :width="width" :height="height" :options="packageProduct">
        </color-bar-chart>
      </slide-up>
        <div class="dataArea" v-if="!showProductDetail">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div>
            <scoll-bar class="channelBar"> 
                 <div class="scrollItem" v-for="(channel,idx) in channels" :class="{active:filterSourceKey==channel.key}" v-on:click="filterSource(channel)">{{channel.name}}</div> 
            </scoll-bar>
            <div class="dataheader pdrow" >
              <span class="text-l">产品名称</span> 
              <span class="text-r">平均分</span>
            </div>
            <div class="datarows">
              <div class="datarow pdrow" v-for="row in allProducts" v-on:click="doShowProductDetail(row)">
                <span class="text-l">{{row.productName}}</span>
                <span class="text-r"> {{row[filterSourceKey]}}</span> 
              </div>
            </div>
        </div>
        <div class="dataArea" v-if="showProductDetail">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div> 
            <div class="dataheader pdrow" >
              <span class="text-l">{{currtProduct.productName}}</span>  
            </div>
            <div class="dataheader pdrow" >
              <span class="text-l">渠道</span> 
              <span class="text-r">平均分</span>
            </div>
            <div class="datarows ">
              <div class="datarow pdrow" v-for="(channel,index) in channels" >
                <span class="text-l"><i v-if="index>0" class="fa fa-square colorpoint" :style="{color:color(index-1)}" ></i>{{channel.name}}</span>
                <span class="text-r"> {{currtProduct[channel.key]}}</span> 
              </div>
            </div>
        </div>
  </main-layout>
</template>
<script> 
  import MainLayout from '../layouts/Main.vue'; 
  import BarChart from '../components/BarChart.vue'; 
  import ColorBarChart from '../components/ColorBarChart.vue';
  import VSelect from '../components/Select.vue'; 
  import SlideUp from '../components/reuse/SildeUp.vue';
  import ScollBar from '../components/reuse/ScollBar.vue';
  import Arrow from '../components/reuse/Arrow.vue'; 
  import xhttp from '../xhttp';
  import config from '../gConfig';
  import mytool from '../mytool'; 

  const S_ALLCHANNEL='avgScore'; 
  const S_ALLPRODUCT='allproduct'; 

  export default {
  	data:function (){ 
  		return {
        showChart:true,
        showProductDetail:false,
        width:config.chartsize.width,
        height:config.chartsize.height,
        color:config.color,
        currtProduct:{}, 
        options:{inited:false},
        datarows:[],
        otherProOptList:[{'key':S_ALLPRODUCT,'value':'全部产品'}], 
        otherProOptKey:'-1',
        otherProOptIdx:0,
        ownProOptList:[{'key':S_ALLPRODUCT,'value':'无对比项'}],
        ownProOptKey:'-1', 
        ownProOptIdx:0,
        ownproducts:config.ownproducts,
        allProducts:[],
        otherProducts:[],
        channels:[],
        source:[],
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
          name: '平均分',
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
      BarChart:BarChart,
      VSelect:VSelect,
      ScollBar:ScollBar,
      SlideUp:SlideUp,
      Arrow:Arrow,
      ColorBarChart:ColorBarChart
    },
    created:function() {  
      this.fetchData()
    },
    methods:{
      fetchData:function () {
        var vm=this;
        xhttp.get('/avrgScore',
                null,
                function(res) {
                    vm._initData(res); 
                    vm._renderChart();
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
        })
      },
      switchChart:function(){
        this.showChart=!this.showChart;
      },
      _renderChart:function(){
             var vm=this;
             var products =  vm._filterProducts();
             var productNames = [];
             var series = [];
             var lengenddata = [];
             var productList = [];
             var source=vm.source;
             products=products.sort(function(p1,p2){
              return p2.totalDownload-p1.totalDownload;
             })
             for (let j = 0; j < products.length; j++) {
                       var item = products[j];
                       productNames.push(item.productName);
             }
             for (var key in source) { 
                   var arr = [];
                   for (var i = 0; i < products.length; i++) {
                       arr.push(products[i][key] ? products[i][key] : 0);
                   }
                   series.push({
                       name: source[key],
                       type: 'bar',
                       stack: 'source',
                       data: arr,
                       show:vm.filterSourceKey===S_ALLCHANNEL ||  key ===vm.filterSourceKey
                   }); 
             };  
             vm.options={
                  xAxis:{data:productNames},
                  series:series 
             }
      },
      _filterProducts:function(){
             var vm=this;
             var otherPros=vm.otherProOptKey<0?vm.otherProducts:vm.otherProducts.filter(function(p){return p.key===vm.otherProOptKey});
             var ownPros=vm.ownProOptKey<0?[]:vm.ownproducts.filter(function(p){return p.key===vm.ownProOptKey});
             return otherPros.concat(ownPros);
      },
      _initData:function(res) {
             var vm=this;
             var ourproducts=vm.ownproducts;
             var data = res.data;  
             var products = [];
             var channels = [{name:'全部渠道',key:S_ALLCHANNEL}];
             vm.source = res.sourceName; 
             delete vm.source.all; 
             products = vm._setProductDetails(res.products, data); 
             vm.allProducts=products;
             for (var key in vm.source) {
               channels.push({
                  name: vm.source[key],
                  key: key
               }); 
             } 
             vm.channels=channels;
             /*Begin of initlizal Vselect Options*/
             var splicedPros=mytool.spliceArr(products,function(product) {
                 return vm.ownproducts.indexOf(product.productName) < 0;
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
      _setProductDetails:function(products, data) {
             var pmap={}; 
             for (let key in products) { 
                 pmap[key]={
                     productName: products[key],
                     key: key 
                 }; 
                 pmap[key][S_ALLCHANNEL]=0;
             };
             var length=0;
             for (let key in data) {
                 length++;  
                 let platform = data[key];
                 for (let k = 0; k < platform.length; k++) {
                     let app = platform[k];
                     let product=pmap[app.app_id];
                     app.data=parseFloat(app.avrgScore);
                     product[key]= app.data;
                     product[S_ALLCHANNEL] += app.data;  
                 } 
             } 
             return mytool.obj2arr(pmap).map(function(item){ 
              item[S_ALLCHANNEL]= (item[S_ALLCHANNEL]/length).toFixed(1) ;
              return item;
             });
      },
      switchOtherProduct:function(product){
        var vm=this;
        if(product.key==S_ALLPRODUCT){  
          vm.showProductDetail=false;
        }else{
          vm.allProducts.forEach(function(item,index){
            if(product.key==item.key){
              vm.doShowProductDetail(item)
            }
          })
        }
      },
      switchOwnProduct:function(product){
        this.ownProOptKey=product.key; 
        this._renderChart();
      },
      filterSource:function(channel){
        this.filterSourceKey=channel.key;
        this.showProductDetail=false;
        this.otherProOptIdx=0;
        this._renderChart();
      }
    }
  }
</script>  
