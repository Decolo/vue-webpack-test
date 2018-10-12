<template>
  <main-layout> 
      <slide-up  class="chartArea" :sildeUp="showChart"> 
        <div class="flex filterbar" :class="{detail:selectedIndex>=0}">
          <div class="filter-select">
            <v-select :options="products" :valkey="'name'" :selected='selectedIndex+1' :on-change="switchProduct">
            </v-select> 
          </div>
          <div class="filter-data">
            <div class="cr">
              <ani-num :value='dproduct.data' class="fd-number"></ani-num> 
              <span class="fd-text">产品数</span>
            </div>
          </div>
          <div class="filter-data align-right">
            <span class="fd-number">{{dproduct.percent | percent}}</span>
            <span class="fd-text">占比</span>
          </div> 
          <div class="arrow" ></div>
          <div class="line" ></div> 
        </div> 
        <pie-chart :width="width" :height="height" :options="options" :selectedIndex="selectedIndex"  :showlegend="false">
          <div class="chart-title" > 
              <h4>{{dproduct.data}}</h4>
              <p>{{products[selectedIndex+1].name}}</p>
          </div>
        </pie-chart> 
      </slide-up> 
        <div class="dataArea">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div> 
            <div class="dataheader" >
              <span>产品名称</span>
              <span>产品数</span>
              <span>占比</span>
            </div>
            <div class="datarows">
              <div class="datarow" v-for="row in datarows" v-on:click="changeStartAngle(row)">
                <span><i class="fa fa-square colorpoint" :style="{color:colors(row.index)}"></i> {{row.name}}</span>
                <span>{{row.data}}</span>
                <span>{{row.percent | percent}}</span>
              </div>
            </div>
        </div>
  </main-layout>
</template>
<script> 
  import MainLayout from '../layouts/Main.vue'; 
  import PieChart from '../components/PieChart.vue'; 
  import VSelect from '../components/Select.vue'; 
  import Arrow from '../components/reuse/Arrow.vue'; 
  import SlideUp from '../components/reuse/SildeUp.vue'; 
  import AniNum from '../components/AnimationNumber.vue'; 
  import xhttp from '../xhttp';
  import config from '../gConfig';

  var products=[
    {key:'weixin',name:'微信'},
    {key:'weibo',name:'微博'},
    {key:'web',name:'网站'},
    {key:'app',name:'APP'} 
  ];
  export default {
  	data:function (){ 
  		return {
        showChart:true,
        width:config.chartsize.width,
        height:config.chartsize.height,
        selectedIndex:-1,
        options:{inited:false},
        datarows:[],
        total:0,
        dproduct:{ 
          data:0,
          percent:1,
          index:0
        },
        products:[{key:'all',name:'全部产品'}].concat(products), 
        colors:config.color
      }
    },
    components: { 
      MainLayout:MainLayout,
      PieChart:PieChart,
      AniNum:AniNum,
      VSelect:VSelect,
      Arrow:Arrow,
      SlideUp:SlideUp
    },
    created:function() {  
      this.fetchData() 
    }, 
    methods:{
      fetchData:function () {
        var that=this;
        xhttp.get('/all',
                null,
                function(res) {

                  var length=products.length,
                      total=0,
                      data=new Array(length);
                      that.datarows=new Array(length);
                  for (var i = 0; i < length; i++) {
                    data[i]=res[products[i].key];
                    total+=parseInt(data[i]);
                    that.datarows[i]=Object.assign(products[i],{
                      index:i,
                      data:data[i],
                      percent:0
                   });
                  };
                  that.total=total;
                  for (var i = 0; i < length; i++) { 
                    that.datarows[i].percent= that.datarows[i].data/total
                  }
                  that.options=Object.assign({},{
                      data:data, 
                      inited:true
                  }); 
                  that.switchProduct(that.products[0])
                });
      },
      switchProduct:function(product){
        var vm=this;
        if(product.key=='all'){ 
            vm.dproduct={
              data:vm.total,
              percent:1
            };
            this.selectedIndex=-1;
        }else{
          vm.datarows.forEach(function(item,index){
            if(product.key==item.key){
              vm.changeStartAngle(item);
            }
          })
        }
      },
      changeStartAngle:function(row){ 
        this.dproduct=row; 
        this.selectedIndex=row.index; 
      },
      switchChart:function(){
        this.showChart=!this.showChart;
      }
    }
  }
</script>  
