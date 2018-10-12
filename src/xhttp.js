import Vue from 'vue'; 
import routes from './routes'
import gConfig from './gConfig'; 

var apiRoot = routes.rootPath+gConfig.apiRoot;

export default {
  get: function (url, params, successCallback, errorCallback) {
    var data = Object.assign({ timestamp: 1474357232, token: 'ef0945cecab732ec4af8fa58c7ab21a3' }, params);
    Vue.http.get(apiRoot + url, { params: data })
      .then(function (res) { 
        return res.json()
      }).then(function (result) { 
        if (120 == result.error_code) {
          window.location.href = routes.rootPath+'/login';
        } else {
          successCallback(result);
        }
      }, function (err) { 
        if (errorCallback && errorCallback instanceof Function) {
          errorCallback(err);
        }
      });
  },
  post: function (url, params, successCallback, errorCallback) {
    var data = Object.assign({ timestamp: 1474357232, token: 'ef0945cecab732ec4af8fa58c7ab21a3' }, params);
    Vue.http.post(apiRoot + url, data, { emulateJSON: true })
      .then(function (res) {
        return res.json()
      }).then(function (result) {
        if (120 == result.error_code) {
          window.location.href = routes.rootPath+'/login';
        } else {
          successCallback(result);
        }
      }, function (err) { 
        if (errorCallback && errorCallback instanceof Function) {
          errorCallback(err);
        }
      });
  }
}
