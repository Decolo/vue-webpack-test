<template>
  <main-layout :showusername='true'>  
  <div class="profile fixapp">
      <div class="abscenter flex-stay">
        <div class="btn-group">
          <div class="btn"  :class="{active:range.key==dayrange}" v-for="range in dayRangeArr" @click="switchDaysRange(range)">{{range.text}}</div> 
        </div>
      </div>
      <div class="divison  flex-stay">
        <span class="override">全局数据</span>
        <div class="crossline"></div>
      </div>
    <div class="infopanel">
      <div class="infocard border-info">
        <div class="cardbody">
          <div class="carditem">
              <span class="cardtext">总用户数</span>
              <span class="cardnumber">{{infoData.total.wx+infoData.total.web+infoData.total.app +infoData.total.wb | numfix}}</span>
          </div> 
        </div>
        <div class="cardfooter"> 
            <v-link href="/webvisted" class="carditem">
              <span class="cardnumber">{{infoData.total.web | numfix}}</span>
              <span class="cardtext">网站</span> 
            </v-link>
            <v-link href="/appdown" class="carditem">
              <span class="cardnumber">{{infoData.total.app | numfix}}</span>
              <span class="cardtext">APP</span>
            </v-link>
            <v-link href="/wxscale" class="carditem">
              <span class="cardnumber">{{infoData.total.wx | numfix}}</span>
              <span class="cardtext">微信</span>
            </v-link>
            <v-link href="/wbscale" class="carditem">
              <span class="cardnumber">{{infoData.total.wb | numfix}}</span>
              <span class="cardtext">微博</span>
            </v-link>
        </div>
      </div>
      <div class="infocard border-new">
        <div class="cardbody">
          <div class="carditem">
              <span class="cardtext">新增用户数</span>
              <span class="cardnumber">{{infoData.new.wx +infoData.new.wb | numfix}}</span>
          </div> 
        </div>
        <div class="cardfooter">
            <v-link href="/webnewvisit" class="carditem">
              <span class="cardnumber">{{infoData.new.wx | numfix}}</span>
              <span class="cardtext">网站</span>
          </v-link> 
            <v-link href="/appnewdown" class="carditem">
              <span class="cardnumber">{{infoData.new.wb | numfix}}</span>
              <span class="cardtext">APP</span>
          </v-link> 
        </div>
      </div>
      <div class="infocard border-pruenew">
        <div class="cardbody">
          <div class="carditem">
              <span class="cardtext">净增用户数</span>
              <span class="cardnumber">{{ infoData.pureNew.wx+infoData.pureNew.wb | numfix}}</span>
          </div>  
        </div>
        <div class="cardfooter">
            <v-link href="/wxincrease" class="carditem">
              <span class="cardnumber">{{infoData.pureNew.wx | numfix}}</span>
              <span class="cardtext">微信</span>
          </v-link> 
            <v-link href="/wbincrease" class="carditem">
              <span class="cardnumber">{{infoData.pureNew.wb | numfix}}</span>
              <span class="cardtext">微博</span>
          </v-link>  
        </div>
      </div> 
    </div>
  </div>
  </main-layout>
</template>
<script> 
  import VLink from '../components/VLink.vue'
  import MainLayout from '../layouts/Main.vue';  
  import Swiper from '../components/reuse/Swiper.vue';   
  import AniNum from '../components/AnimationNumber.vue';  
  import xhttp from '../xhttp';
  import config from '../gConfig';
  import mytool from '../mytool';  

  export default {
    data:function (){
      var yesterday = mytool.dateformat(mytool.getDate(-1), "yyyy-MM-dd");
      var pre7day = mytool.dateformat(mytool.getDate(-7), "yyyy-MM-dd");
      var pre30day = mytool.dateformat(mytool.getDate(-30), "yyyy-MM-dd"); 
      return {
        showChart:true,
        width:config.chartsize.width,
        height:config.chartsize.height,
        tabIndex:0,
        newsRank:true,
        activeRank:true,
        dayrange:30,
        topnews:[],
        bottomnews:[],
        topactivities:[],
        bottomactivities:[],
        startDate:pre30day,
        dayRangeArr:[
          {key:1,text:'昨日',start:yesterday},
          {key:7,text:'近一周',start:pre7day},
          {key:30,text:'近一月',start:pre30day}
        ],
        infoData:{
          total:{
            web:0,
            app:0,
            wb:0,
            wx:0 
          },
          new:{
            wb:0,
            wx:0
          },
          pureNew:{
            wb:0,
            wx:0
          }
        }
      }
    },
    components: { 
      MainLayout:MainLayout,  
      Swiper:Swiper,
      AniNum:AniNum,
      VLink:VLink
    },
    created:function() {  
      this.fetchData()
    },
    filters:{
      limitLength:function(value,l){ 
        return value && value.length > l?value.substr(0,l-1)+'...':value;
      }
    },
    methods:{ 
      fetchData:function () {
        var vm=this;   
        xhttp.get('/wxwbNewUserStat',
                {start:vm.startDate},
                function(res) { 
                  vm.infoData.pureNew.wx=res.wx; 
                  vm.infoData.pureNew.wb=res.wb;
                });
      },
      initData:function(resp){
        this.topnews=resp.top_news;
        this.bottomnews=resp.bottom_news;
        this.topactivities=resp.top_activities;
        this.bottomactivities=resp.bottom_activities;
      },
      switchTab:function(index){
        this.tabIndex=index;
        this.$refs.tabswiper.$emit('$Swiper:switch',index); 
      },
      switchNewsRank:function(){
        this.newsRank=!this.newsRank
      },
      switchActiveRank:function(){
        this.activeRank=!this.activeRank
      },
      switchDaysRange:function(range){
        this.dayrange=range.key;  
        this.startDate=range.start;
        this.fetchData()
      }
    }
  }
</script>  
<style>
  .profile{
    padding:10px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }
  .profile .btn-group{
    width: 100%;
  }
  .profile .btn-group .btn{
    flex-grow: 1;
  }

  .divison{
    position: relative;
    font-size: 1.2rem;
    height: 1.5rem;
    line-height: 1.5rem;
    margin: 1rem 0;
    text-align: center; 
  }
  .crossline{
    position: absolute;
    top: 0;
    height: 50%;
    width: 100%;
    border-bottom: 1px solid #e8e8e8;
    z-index: 0;
  }
  .override{
    padding:0 1.5rem;
    position: relative;
    background-color: #FFF;
    z-index: 99;
  }
  .infopanel{
    flex-grow:1;    
    overflow-y: scroll;
  }
  .infocard,
  .cardbody,
  .carditem{
    background-color: #4c475e;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #FFF;
  }
  .infocard{
    margin-top: 6px;
  }
  .infocard.border-info{
    border-left: 6px solid #55d0c0;
  }
  .infocard.border-new{
    border-left: 6px solid #8a8aec;
  }
  .infocard.border-pruenew{
    border-left: 6px solid #d26ccb;
  }
  .infocard.border-common{
    border-left: 6px solid #f3b861;
  }
  .cardbody{
    padding-top: 10px;
    width: 100%;
    border-bottom: 1px solid rgba(232,232,232,0.5);
  }
  .cardbody .carditem .cardtext{
    font-size: 1.2rem;
  }
  .cardbody .carditem .cardnumber{
    font-size: 2.1rem;
  }
  .cardfooter{
    width: 100%;
    padding: 5px 0;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .cardfooter .carditem{
    font-size: 0.8rem;
    padding: 10px;
    border-left: 0.5px solid rgba(232,232,232,0.5);
    flex-grow: 1;
  }
  .cardfooter .carditem:first-child{ 
    border-left: none; 
  }
</style>
