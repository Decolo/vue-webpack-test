<template>
   <div class="fixapp appcontainer"> 
     <div class="vxbackdrop" v-if="showoptions" @click="cancelselect"></div> 
     <transition name="fade"> 
     <div class="vxbackdrop" v-if="openMenu"  @click="switchMenu"></div>
     </transition>
     <div class="sidebar" :class="{sidebarOpen:openMenu}">  
            <div class="returnbtn" @click="returnParentMenu">
              <span><i class="fa fa-angle-left"  v-show="topmenu.hasreturn" ></i></span>
              <span>{{topmenu.title}}</span>
              <span></span>
            </div>
            <ul class="sidebar-toplist">
                <li class="siderbar-topitem" :class="{active:menu.showChildMenu}" @click="openSubMenu(menu)" v-for="menu in menus"><span >{{menu.title}}</span> 
                </li>  
            </ul> 
            <ul class="sidebar-list ">
                <li class="sidebar-li" v-for="menu in menus">
                <transition name="fade">
                    <submenu v-show="menu.haschild" :menu="menu" :showReturn="false" v-on:openmenu="switchOpenedMenu"></submenu> 
                </transition>
                </li>  
            </ul> 
     </div>
     <div class="container fixapp" :class="{sidebarShown:openMenu}">
       <nav class="dp-nav"> 
          <div class="flex header">
              <div class="menubtn" @click="switchMenu">
                  <span class="sr-only">菜单</span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
              </div>
              <div class="headertitle menuselect" v-if="!showusername">
                  <span class="navbar-brand" @click="toselect"> 
                   {{title}}<i class="fa fa-angle-down"></i>
                  </span>
                  <transition name="fade"> 
                    <div class='menuoptArea' v-show="showoptions"> 
                      <div class="arrow" ></div>
                      <div class='menuoptlist'>
                        <div class="menuopt" v-for="(menu,idx) in topmenus" @click.stop="doselect(menu)" :key="idx">
                          <span>
                            {{menu.title}}
                          </span>
                        </div>
                      </div>
                    </div>
                  </transition>
              </div>
              <div class="headertitle" v-if="showusername">
                  <span class="navbar-brand"> 
                      {{username}}
                  </span>
              </div>
              <v-link :href="rootPath">
              <div class="username"> 
                  <!-- <span class="iconfont icon-user"></span> -->
              </div>
              </v-link>
          </div> 
        </nav>
        <div class="mainbody">
          <slot></slot>
        </div>
      </div>

      <slot name="footer"></slot>
      <notifications position="center center"/>
    </div>
</template> 

<script>  
  import VLink from '../components/VLink.vue'
  import Submenu from '../components/Submenu.vue'
  import routes from '../routes'
  import mt from '../mytool'
  import config from '../gConfig';
  import xhttp from '../xhttp';
  export default {
    data () { 
      return {   
        rootPath:routes.rootPath,
        openMenu:false,
        menus:[],
        showoptions:false,  
        topmenu:{title:'数决化决策'},
        title:'数决化决策',
        topmenus:[],
        username:mt.decode(config.username()),
        auths:mt.getCookie('auth').split(',')
        }
    },
    props: {
      showusername: Boolean,
      default: false
    },
    components: {
      VLink:VLink,
      Submenu:Submenu
    },
    mounted:function(){
      if (this.auths == null) {
        window.location.href = '/login';
      };
      this.addAuth();
      var currRoute =this.$root.currentRoute.replace(routes.rootPath,'')=='/'?'/productscale':this.$root.currentRoute.replace(routes.rootPath,''); 
      this.menus=mt.copy(routes.menus);  
      this.getTopmenus(this.menus,currRoute);  
    },
    methods:{
      getTopmenus:function(menus,route,parentMenu){
        var vm=this;
        var getCurrtMenu=false;
        for (var i = 0; i < menus.length; i++) {
              var menu=menus[i];
              vm.checkAuth(menu);
              if(route === menu.route && !getCurrtMenu){
                vm.topmenu=parentMenu;
                vm.title=menu.title;
                vm.topmenus=menus;
                getCurrtMenu=true;
                vm.setMenuOpen(parentMenu); 
              }else if(menu.haschild){
                menu.parentMenu=parentMenu;
                vm.getTopmenus(menu.children,route,menu)
              }
        };
      },
      addAuth:function () {
        var vm=this;
        if(!vm.$root.authChecked){
        xhttp.get('/addAuth',
                { account:mt.decode(config.account())},
                function(res) {
                  if (res.auth) {
                    vm.$root.authChecked=true;
                    mt.setCookie('auth',res.auth);
                  }else{
                    window.location.href = routes.rootPath+'/login';  
                  };
                });
        }
      },
      checkAuth:function(menu){
        var vm=this;
        menu.noauth=menu.needauth?vm.auths.indexOf(menu.auth)>=0?false:true:false; 
        if(menu.parentMenu){this.setMenuOpen(menu.parentMenu);}
      },
      setMenuOpen:function(menu){
        menu.showChildMenu=true; 
        if(menu.parentMenu){this.setMenuOpen(menu.parentMenu);}
      },
      switchMenu:function () {
          this.openMenu=!this.openMenu;
      },
      openSubMenu:function (menu) { 
          this.menus.forEach(function(m){m.showChildMenu=false;});
          menu.showChildMenu=true; 
          menu.children.forEach(function(m){
            m.showChildMenu=false;
          })
          this.topmenu=menu;
      },
      switchOpenedMenu:function(menu){ 
        this.topmenu=menu;
      },
      returnParentMenu:function(){ 
        if(this.topmenu.hasreturn){
          this.topmenu.showChildMenu=false; 
          this.topmenu=this.topmenu.parentMenu;
        }
      },
      toselect: function () {
        this.showoptions=true; 
      },
      cancelselect: function () {
        this.showoptions=false; 
      },
      doselect: function (option,event) { 
        var menu; 
        menu=option.haschild?option.children[0]:option;  
        this.showoptions=false; 
        this.$root.currentRoute = routes.rootPath+menu.route; 
        window.history.pushState(
            null,
            null,
            routes.rootPath+menu.route
          );
      }
    }
  } 
</script>  