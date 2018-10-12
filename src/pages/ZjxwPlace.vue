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
          <div class="filter-btn text-c"  >
           <div class="btn" @click="openModal" v-show="dateIds.length>0">
             <span >选择{{seriename}}</span>
            </div>
            <span v-show="dateIds.length==0">- -</span>
          </div> 
          <div class="arrow" ></div>
          <div class="line" ></div> 
        </div> 

        <div class="abscenter" :style="{width:width+'px',height:height+'px'}" v-show="dateIds.length==0" >
            <div class="noDataBtn btn" @click="openModal">
              选择{{seriename}} <i class="fa fa-plus-circle"></i>
            </div>
        </div> 
        <div :class="{leftActive:dateRange==30,rightActive:dateRange==7}" v-show="dateIds.length>0" > 
          <div class="leftswitchbtn" @click="switchDateRange(30)"> <i class="fa fa-angle-left"></i> 近三十日</div>
            <div class="rightswitchbtn" @click="switchDateRange(7)">近七日  <i class="fa fa-angle-right"></i> </div>
        <line-chart  ref="lineChart"   :width="width" :height="height" :options="options"  v-on:dateChange="switchActiveDate">
        </line-chart>  
        </div>
      </silde-up> 
      <div class="dataArea"  v-show="dateIds.length>0">
            <div class="uparrow" @click="switchChart">
               <arrow :angleup="showChart"> </arrow>
            </div> 
            <div class="gradientbar" > 
              <div class="datafilterbar date-filter pdrow" ref="datebar">
                <span class="block"></span>
               <span v-for="(filteritem,fidx) in filterDate" :class="{active:fidx === activeDateIdx}" v-on:click="switchfilterDate(fidx)">{{filteritem | timeFormat(fidx === activeDateIdx?'%Y-%m-%d':'%m-%d')}}</span>
                <span class="block"></span>
               </div> 
            </div>
            <div class="dataheader pdrow" >
              <span class="text-l">{{seriename}} :</span> 
              <span class="text-r">{{prokey | upper}} :</span>
            </div>
            <div class="datarows">
              <div class="datarow pdrow" v-for="(row,i) in datarows" v-if="i>0">
                <span class="text-l fullname">{{row.title}}</span> 
                <ani-num class="text-r" :value="row.tempDate[activeDateIdx] ||0"></ani-num>
              </div>
            </div>
        </div>
      <div class="modal" slot="footer" v-show="showModal">
        <div class="modal-title flex">
          <div @click="closeModal">
            <i class="fu-lg fa fa-angle-left"></i>
          </div>
          <div class="text-c">
            <span>选择{{seriename}}</span>
          </div>
          <div class="flex flex-reverse" @click="submitNews">
             <div class="btn" >确定</div>
          </div>
        </div>
        <div class="modal-body"> 
              <div class="newsitem" v-for="item in itemList" @click="switchItemCheck(item)">
                  <div class="flex newsinfo">
                    <div class="tt">
                      <span>{{item.title}}</span>
                    </div>
                    <div class="text-c">
                      {{item.id}}
                    </div>
                    <div class="flex flex-reverse">
                      <i class="checkbox" :class="{'checked':item.checked,'disabled':dateIds.length>=10}">
                        
                      </i>
                    </div>
                  </div>
                  <span class="text-purpleyGrey">{{item.create_date}}</span>
              </div> 
            <infinite-load  ref="Infiniteload" :on-infinite="loadItems">
            </infinite-load>
        </div>
        <div class="modal-footer"></div>
      </div>
  </main-layout>
</template>
<script> 
  import MainLayout from '../layouts/Main.vue';   
  import VSelect from '../components/Select.vue';  
  import LineChart from '../components/LineChartII.vue'; 
  import Arrow from '../components/reuse/Arrow.vue';
  import SildeUp from '../components/reuse/SildeUp.vue';  
  import AniNum from '../components/AnimationNumber.vue'; 
  import InfiniteLoad from '../components/InfiniteLoading.vue'; 
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
        dateRange:7,
        prokey:'uv',
        options:{inited:false},
        filterDate:[], 
        colors:config.color,
        topMenuOptList:[{key:'uv',value:'UV'},{key:'nuv',value:'NUV'}], 
        proOptList:[{key:S_ALLPRO,value:'总UV'}],
        chartData:[],
        productList:{},
        dateIds:[],
        pageParams:{
          pageNo:1,
          pageSize:10,
          days:30
        },
        showModal:false,
        itemList:[],
        seriename:'位置',
        listurl:'/zjxwPlaceInfo',
        detailurl:'/zjxwPlaceUnp',
        idKey:'placeId' 
      }
    },
    components: { 
      MainLayout:MainLayout, 
      VSelect:VSelect,
      LineChart:LineChart,
      Arrow:Arrow,
      SildeUp:SildeUp,
      AniNum:AniNum,
      InfiniteLoad:InfiniteLoad
    },
    created:function() {  
      // this.fetchData()
    },
    methods:{
      loadItems:function () {
        var vm=this; 
        xhttp.get(vm.listurl,
                 vm.pageParams,
                function(res) { 
                   vm.itemList=vm.itemList.concat(res.data.map(function(i){i.title=i.name;i.id=i[vm.idKey];i.checked=false;return i})); 
                   vm.pageParams.pageNo+=1;
                   if(vm.pageParams.pageNo>res.paginationtotalPage){
                    vm.$refs.Infiniteload.$emit('$InfiniteLoading:complete'); 
                   }else{
                     vm.$refs.Infiniteload.$emit('$InfiniteLoading:loaded'); 
                   }
                });
      },
      fetchData:function () {
        var vm=this; 
        var params={placeIds:vm.dateIds.join(','),dataType:vm.prokey,days:30}; 
        xhttp.get(vm.detailurl,
                 params,
                function(res) { 
                  vm.initData(res); 
                  vm.refreshChart(); 
                });
      },
      initData:function(resp){
        this.chartData=this._prefix(resp); 
        var proOptList=[];
        this.chartData.forEach(function(d,i){ 
          proOptList.push({key:i,value:d.title})
        })
        this.proOptList=proOptList;
      },
      _prefix:function(products){
        products.forEach(function(i){
          i.title=i.name;
        }) 
        var vm=this;
        var sumPro={data:[],title:'总'+vm.prokey.toUpperCase(),serie:[]}
        for (var i = 0; i < 30; i++) {
           var count_date=mytool.dateformat(mytool.getDate(i-30),'yyyy-MM-dd');
           var oneDay={count_date:count_date};
           products.forEach(function(p,pi){
            let serie=p.serie; 
            if(typeof serie == 'undefined'){ 
                serie=p.serie=new Array(30);
            }; 
            let value=0; 
            p.data.forEach(function(d){
              value=d.count_date==count_date?d[vm.prokey]:value;
            });  
            serie[i]=value;
           })
           oneDay[vm.prokey]=mytool.sum(products,function(item){ 
            let value=0; 
            item.data.forEach(function(d){
              value=d.count_date==count_date?d[vm.prokey]:value;
            })
            return value;
           });
           sumPro.serie.push(oneDay[vm.prokey]);
           sumPro.data.push(oneDay);
        }
        return [sumPro].concat(products);
      },
      refreshChart:function(){
        var vm=this; 
        var sumproduct=vm.chartData[0];
        var data=vm.chartData.slice(1);  
        var series=[]; 
        var filterDate=[];
        sumproduct.data.slice(-vm.dateRange).forEach(function(oneday){
          let timestamp=new Date(oneday.count_date).getTime();
          let count_date=oneday.count_date;
          filterDate.push(timestamp);
        });
        data.forEach(function(item,i){  
            series.push({
                    name:mytool.limitLength(item.title,8),
                    data:item.serie.slice(-vm.dateRange)
                });  
        }); 
        vm.filterDate=filterDate; 
        vm.options={ 
              xAxis:{
                name:'日期',
                data:filterDate
              },
              series:series
        };  
        vm.datarows=vm.chartData.map(function(item){ 
          item.tempDate=item.serie.slice(-vm.dateRange)
          return item;
        });    
        vm.switchfilterDate(0) 
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
      },
      switchItemCheck:function(item){
        var vm=this;
        if(vm.dateIds.length<10){
          item.checked=!item.checked; 
          vm.dateIds=vm.itemList.filter(function(i){return i.checked==true}).map(function(i){return i[vm.idKey]}); 
        }
        if(vm.dateIds.length==10 && !item.checked){
          vm.$toast.warn('最多选择10个');
        }
      },
      openModal:function(){ 
        this.showModal=true;
      },
      closeModal:function(){ 
        this.showModal=false;
      },
      submitNews:function(){
        var vm=this;
        if(vm.dateIds.length==0){ 
          vm.$toast.warn('至少选择一个项目');
        }else{
          vm.closeModal();
          vm.fetchData();
        }
      }
    }
  }
</script> 
