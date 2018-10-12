import Notifications from './Notifications.vue'
import { events } from './events'

var Notify = {
  install(Vue) {
    if (this.installed) {
      return;
    }

    this.installed = true;

    Vue.component('notifications', Notifications)
    Vue.prototype.$notify = (params) => {
      if (typeof params === 'string') {
        params = { title: '', text: params }
      }

      if (typeof params === 'object') {
        events.$emit('add', params)
      }
    }
    Vue.prototype.$toast = {
      warn: function (message) {
        let params = { title: '', duration: 1000, type: 'toast', override: true, text: '<p><span class="iconfont icon-warn"></span><p><p>' + message + '</p>' }
        events.$emit('add', params)
      },
      error: function (message) {
        let params = { title: '', duration: 1000, type: 'toast', override: true, text: '<p><span class="iconfont icon-fail"></span><p><p>' + message + '</p>' }
        events.$emit('add', params)
      },
      success: function (message) {
        let params = { title: '', duration: 1000, type: 'toast', override: true, text: '<p><span class="iconfont icon-success"></span><p><p>' + message + '</p>' }
        events.$emit('add', params)
      },
      info: function (message) {
        let params = { title: '', duration: 1000, type: 'toast', override: true, text: message}
        events.$emit('add', params)
      }
    }
  }
}

export default Notify;
