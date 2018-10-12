import Vue from 'vue'
import routes from './routes.js'

// const content = require()
// console.log(content)

// import VueResource from 'vue-resource';
// import * as d3 from "d3";
// import config from './gConfig';
// import Notifications from './components/Notification/index';

// Vue.use(Notifications);
// Vue.use(VueResource);

// Vue.filter('numfix', function (value) {
//   if (!value) return '--';
//   value = value.toString();
//   return value.replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
// })

// Vue.filter('percent', function (value) {
//   return (value * 100).toFixed(2) + '%';
// });

// Vue.filter('gcolor', function (value) {
//   return config.color(value);
// });

// Vue.filter('upper', function (value) {
//   return value.toUpperCase();
// });
// Vue.filter('timeFormat', function (time, fmt) {
//   return d3.timeFormat(fmt)(time);
// });


const app = new Vue({
  el: '#app',
  data: {
    currentRoute: location.pathname,
    openMenu: false,
    authChecked:false
  },
  computed: {
    ViewComponent() {
      const matchingView = routes.routeMap[this.currentRoute]
      console.log(require(`./pages/${matchingView}.vue`))
      debugger
      return matchingView ? require(`./pages/${matchingView}.vue`)
      : require('./pages/404.vue')
    }
  },
  render(h) {
    return h(this.ViewComponent)
  }
})

// window.addEventListener('popstate', () => {
//   app.currentRoute = window.location.pathname;
// })