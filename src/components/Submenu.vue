<template>
  <div class="submenu-list" :class="{'hasactive':hasActive}" v-show="menu.showChildMenu" :style="{height:this.menu.children.length*2.5 +'rem'}">
    <transition-group 
              name="staggered-fade"
              tag="ul"
              v-bind:css="false"
              v-on:before-enter="beforeEnter"
              v-on:enter="enter"
              v-on:leave="leave" 
            >
    <li class="siderbar-item"
        :class="{'active':submenu.route==currroute,'subopen':submenu.showChildMenu}" @click.stop="openSubMenu(submenu)"
                v-for="(submenu, index) in computedMenus"
                v-bind:key="submenu.title"
                v-bind:data-index="index"
              >
              <span  class="submenu-title">{{submenu.title}}<i class="fa fa-angle-right ricon" v-if="submenu.haschild"></i></span>
              <submenu-component v-if="submenu.haschild" :menu="submenu" :delay="200"></submenu-component>
    </li>
    </transition-group> 
  </div>
</template>

<script> 
  import routes from '../routes'
  
  export default {
    name:'submenu-component',
    data (){
      return { 
        menuItem:this.menu,
        currentMenu:this.menu,
        currroute:this.$root.currentRoute, 
        startSub:true, 
        beShow:this.menu.showChildMenu
      }
    },
    props: {
      menu:{
        type: Object,
        required: false
      },
      delay:{
        type:Number,
        default:0
      }
    },
    created:function() {   
    },
    mounted:function(){ 
      var vm=this; 
      this.$watch('menu', function (newMenu) { 
        if(newMenu.showChildMenu){
          setTimeout(function () { 
            vm.beShow=true;
          }, this.delay)
        }else{
          vm.beShow=false;
        }
      },{deep:true});
    },
    computed: {
      computedMenus: function () {
        var vm = this
        var hasActive=false;
        var children=vm.menu.children.filter(function(m){
          if(m.showChildMenu){hasActive=true};
          return !m.noauth;
        }) 
        var menus=!vm.beShow?[]:hasActive?children.filter(function (item) {
          return item.showChildMenu
        }):children;  
        return menus
      },
      hasActive: function () {
        var vm = this
        var hasActive=false;
        vm.menu.children.forEach(function(m){
          if(m.showChildMenu){hasActive=true};
        })    
        return hasActive
      }
    },
    methods: {
      closeSelf(event){
        event.preventDefault();
        event.stopPropagation();
        this.menuItem.showChildMenu=false;  
      },
      openSubMenu:function (menuItem) {
        event.preventDefault();
        event.stopPropagation();
        if(menuItem.haschild){
          this.$emit('openmenu',menuItem);
          menuItem.showChildMenu=true;
        }else{  
          this.$root.currentRoute = routes.rootPath+menuItem.route 
          window.history.pushState(
            null,
            null,
            routes.rootPath+menuItem.route
          )
        }
      },
      beforeEnter: function (el) {
        el.style.opacity = 0
        el.style.height = 0
      },
      enter: function (el, done) {
        var delay = el.dataset.index * 150;
        setTimeout(function () {
          el.style.opacity = 1;
          el.style.height = '2.5rem'
        }, delay)
      },
      leave: function (el, done) {
        var vm=this; 
        el.style.opacity = 0;
        el.style.height = 0;
        setTimeout(function () { 
          el.style.display="none";
        }, 300)
      } 
    }
  }
</script>
<style >
  .siderbar-item{
    transition: opacity 370ms,height 370ms,padding 200ms;
  }
  .submenu-list.hasactive>ul>.siderbar-item{
    transition: all 150ms;
  }
</style>