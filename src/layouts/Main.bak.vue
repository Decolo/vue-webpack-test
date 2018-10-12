<template>
   <div class="fixapp ">
     <transition name="fade">
     <div class="vxbackdrop" v-show="showoptions" @click="cancelselect"></div>
     </transition>
     <transition name="fade">
     <div class="vxbackdrop" v-show="openMenu"  @click="switchMenu"></div>
     </transition>
     <div class="sidebar" :class="{sidebarOpen:openMenu}">  
            <ul class="sidebar-list ">
                <li class="siderbar-topitem" :class="{active:menu.showChildMenu}" @click="openSubMenu(menu)" v-for="menu in menus"><span >{{menu.title}}</span>
                <transition name="fade">
                    <submenu v-if="menu.haschild" v-show="menu.showChildMenu" :menu="menu" :showReturn="false"></submenu> 
                </transition>
                </li>  
            </ul> 
     </div>
     <div class="container fixapp" :class="{sidebarShown:openMenu}">
       <nav class="dp-nav"> 
          <div class="flex header">
              <button type="button" class="menubtn" @click="switchMenu">
                  <span class="sr-only">菜单</span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
                  <span class="icon-bar"></span>
              </button>
              <div class="headertitle menuselect">
                  <span class="navbar-brand" @click="toselect"> 
                   {{title}}<i class="fa fa-angle-down"></i>
                  </span>
                  <div class='menuoptArea' v-show="showoptions"> 
                    <div class="arrow" ></div>
                    <div class="menuopt" v-for="(menu,idx) in topmenus" @click.stop="doselect(menu)" :key="idx">
                      <span>
                        {{menu.title}}
                      </span>
                    </div>
                  </div>
              </div>
              <div class="username"> 
                  <span class="iconfont icon-user"></span>
              </div>
          </div> 
        </nav>
        <div class="mainbody">
          <slot></slot>
        </div>
      </div>
    </div>
</template> 

<script>  
  import VLink from '../components/VLink.vue'
  import Submenu from '../components/Submenu.vue'
  import routes from '../routes'
  export default {
    data () {
      return {   
        openMenu:false,
        menus:routes.menus,
        showoptions:false, 
        title:this.$root.title,
        topmenu:{},
        topmenus:[] 
        }
    },
    components: {
      VLink:VLink,
      Submenu:Submenu
    },
    created:function(){
      var currRoute = this.$root.currentRoute;
      var menus=this.menus;
      this.getTopmenus(menus,currRoute);  
    },
    methods:{
      getTopmenus:function(menus,route,parentMenu){
        var vm=this;
        for (var i = 0; i < menus.length; i++) {
              var menu=menus[i];
              if(route === menu.route){
                vm.topmenu=parentMenu;
                vm.title=menu.title;
                vm.topmenus=menus; 
                vm.setMenuOpen(parentMenu);
                break;
              }else if(menu.haschild){
                menu.parentMenu=parentMenu;
                vm.getTopmenus(menu.children,route,menu)
              }
        } 
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
        this.$root.currentRoute = menu.route; 
        window.history.pushState(
            null,
            null,
            menu.route
          );
      }
    }
  } 
</script> 
<style>
.menuselect {
    position: relative; 
} 

.menuoptArea {
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 200px; 
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 7px;
    background-color: #FFF;
    color: #000;
    z-index: 9999;
}
.menuoptArea .arrow {
    position: absolute;
    left: 50%;
    top: 0px;
    transform: translate(-50%, -50%) rotate(45deg);
    width: 0;
    height: 0;
    border-top: 14px solid #fff;
    border-right: 14px solid transparent;
}
.vxbackdrop{
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(1, 1, 1, 0.5);
    z-index: 999;
} 

.menuopt {
    position: relative;
    line-height: 24px;
    font-size: 21px;
    padding: 14px 0;
    width: 100%;
    color: rgb(86,79,107);
}
.menuopt{
    border-bottom: 1px solid #f1f1f1;
}
.menuopt:last-child{
    border-bottom: none;
}
</style>