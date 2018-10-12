<template>
  <main-layout> 
      <silde-up  class="chartArea" :sildeUp="showChart" > 
        <div class="flex filterbar">
          <div class="filter-select">
            <v-select :options="topMenuOptList" :selected='selectedIndex+1' :on-change="switchProduct">
            </v-select> 
          </div>
          <div class="filter-data">
            <div class="cr">
               <ani-num :value='currtproduct[key]' class="fd-number"></ani-num> 
               <span class="fd-text">量</span>
            </div>
          </div>
          <div class="filter-data align-right">
            <span class="fd-number">{{currtproduct[key]/sumproducts[key] | percent}}</span>
            <span class="fd-text">占比</span>
          </div> 
          <div class="arrow" ></div>
          <div class="line" ></div> 
        </div> 
        <swiper :on-switch="switchfilterItemIndex" ref="chartswiper">
         

        </swiper>
      </silde-up>
        <div class="dataArea" v-show="selectedIndex<0">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div> 
            <div class="datafilterbar" v-show="!showChart">
               <span v-for="(filteritem,fidx) in filterkeys" :class="{active:filteritem.key === key}" v-on:click="switchfilterItem(filteritem,fidx)">{{filteritem.text}}</span>
            </div>
            <div class="dataheader" >
              <span>网站名称</span>
              <span>访客量</span>
              <span>占比</span>
            </div>
            <div class="datarow" v-for="row in datarows" v-on:click="changeStartAngle(row)">
              <span class="text-l"><i class="fa fa-square colorpoint" :style="{color:colors(row.index)}"></i> {{row.name}}</span>
              <span>{{row[key]}}</span>
              <span>{{row[key]/sumproducts[key] | percent}}</span>
            </div>
        </div>
        <div class="dataArea" v-show="selectedIndex>=0">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div>  
            <div class="dataheader" >
              <span>时间区间</span>
              <span>访客量</span>
              <span>占比</span>
            </div>
            <div class="datarows">
              <div class="datarow" v-for="filteritem in filterkeys">
                <span class="text-l pd-hor-sm">{{filteritem.text}}</span>
                <span>{{dproduct[filteritem.key]}}</span>
                <span>{{dproduct[filteritem.key]/sumproducts[filteritem.key] | percent}}</span>
              </div>
            </div>
        </div>
  </main-layout>
</template>
<script> 
  import MainLayout from '../layouts/Main.vue';   
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
        currtproduct:{
           UV:0,
           UV7:0,
           UV30:0,
           UVALL:0
        }, 
        key:'UVALL',
        filterkeys:[
           {key:'UVALL',text:'历史总访客',options:{inited:false}},
           {key:'UV30',text:'近30日访客',options:{inited:false}},
           {key:'UV7',text:'近7日访客',options:{inited:false}} 
        ], 
        colors:config.color,
        topMenuOptList:[{key:'all',value:'全部产品'}],
        sumproducts:{
           UV:0,
           UV7:0,
           UV30:0,
           UVALL:0
        },
        chartData:[]
      }
    },
    computed: { 
    },
    components: { 
      MainLayout:MainLayout, 
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
        xhttp.get('/webSubscriber',
                null,
                function(res) {   
                });
      }
    }
  }
</script>  
