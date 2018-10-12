<template>
  <main-layout>  
    <div class="tabs pd-ver-sm flex-stay">
      <div class="tab" @click="switchTab(0)" >
        <div class="tabtile" :class="{active:tabIndex==0}"  @click="openModal(tabIndex==0)">
           <span> WEB文章榜单
                <i class="fa fa-question-circle text-purpleyGrey" v-show="tabIndex==0"></i>
           </span> 
       </div> 
      </div> 
      <div class="tab " @click="switchTab(1)">
        <div class="tabtile" :class="{active:tabIndex==1}"   @click="openModal(tabIndex==1)">
          <span>WEB频道榜单
                <i class="fa fa-question-circle text-purpleyGrey" v-show="tabIndex==1"></i></span>  
        </div>
      </div>
    </div>
    <div class="loading-circles  pd-ver-sm" v-show="loading"></div>
    <swiper class="flex" ref="tabswiper" :showBtn="false"  v-show="!loading">
      <div class="rankArea dataArea swiper-item">
        <div class="dataheader" >
              <span>排名</span>
              <span>文章标题</span>
              <span>指数</span>
              <span>作者</span>
        </div>
        <div class="datarows">
          <div class="datarow " v-for="(row,i) in articlePN">
            <span>{{i+1}}</span>
            <v-clamp class="text-l title">{{row.title}}</v-clamp> 
            <ani-num :value="row.qualityIndex || 0"></ani-num>
            <span>{{row.author}}</span>
          </div>
        </div> 
      </div>
      <div class="rankArea dataArea swiper-item">
        <div class="dataheader" >
              <span>排名</span>
              <span>频道名称</span>
              <span>指数</span>
              <span>发布平台</span>
        </div>
        <div class="datarows">
          <div class="datarow " v-for="(row,i) in channelPN">
            <span>{{i+1}}</span>
            <span>{{row.docChannel }}</span>
            <ani-num :value="row.qualityIndex || 0"></ani-num>
            <span>{{row.mediaName}}</span>
          </div>
        </div> 
      </div>
    </swiper>
    <div class="footer"  slot="footer" >
      <transition name="fade">
        <div class="modal webrankmodal flex-reverse"v-show="showmodal"> 
            <div class="modal-body abscenter pd-hor" v-if="tabIndex==0"> 
              <div class="h3 pd-ver-sm">影响榜单的因素</div>
              <div class="content">{{articleComments}}</div>
            </div>
            <div class="modal-body abscenter pd-hor" v-if="tabIndex==1"> 
              <div class="h3 pd-ver-sm">影响榜单的因素</div>
              <div class="content">{{channelComments}}</div>
            </div>
            <div class="modal-footer flex-static abscenter">
                 <span class="h1" @click="closeModal">&times;</span>
            </div>
          </div>
      </transition>
    </div>
  </main-layout>
</template>
<script> 
  import MainLayout from '../layouts/Main.vue';  
  import Swiper from '../components/reuse/Swiper.vue';   
  import AniNum from '../components/AnimationNumber.vue';
  import VClamp from '../components/reuse/VClamp.vue';  
  import xhttp from '../xhttp';
  import config from '../gConfig';
  import mytool from '../mytool';  

  export default {
    data:function (){ 
      return {
        showChart:true,
        width:config.chartsize.width,
        height:config.chartsize.height,
        tabIndex:0, 
        articlePN:[],
        channelPN:[],
        channelComments:'',
        articleComments:'',
        showmodal:false,
        loading:true
      }
    },
    components: { 
      MainLayout:MainLayout,  
      Swiper:Swiper,
      AniNum:AniNum,
      VClamp:VClamp
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
        vm.loading=true;
        xhttp.get('/webPN',null,
                function(res) { 
                  vm.initData(res); 
                  vm.loading=false;
                });
      },
      initData:function(resp){
        this.articlePN=resp.articlePN;
        this.channelPN=resp.channelPN;
        this.channelComments=resp.channelComments;
        this.articleComments=resp.articleComments;
      },
      switchTab:function(index){
        this.tabIndex=index;
        this.$refs.tabswiper.$emit('$Swiper:switch',index); 
      },
      openModal:function(flag){ 
        if(flag){
          this.showmodal=true;
        }
      },
      closeModal:function(){ 
        this.showmodal=false;
      }
    }
  }
</script> 
<style>
  .webrankmodal{
    background-color: rgba(0,0,0,.75);
    color: #FFF;
  }
  .webrankmodal .modal-body{ 
    font-size: 1rem;
    white-space: pre-line;
  }
  .webrankmodal .content{
    text-indent: 2rem;
  }
</style>