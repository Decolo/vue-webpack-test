<template>
   <div class="container fixapp loginpanel"> 
        <div class="loginform">
            <input type="text" placeholder="请输入8531账号"  v-model="username">
            <input type="password" placeholder="请输入密码"  v-model="password">
            <button class="loginbtn" @click="dologin">登录</button>
        </div>
      <notifications position="center center"/>
    </div>
</template>
<script>  
  import xhttp from '../xhttp'; 
  import mt from '../mytool';
  import routes from '../routes';
  export default {
  	data:function (){ 
  		return {
        username:'',
        password:''
      }
    },
    methods:{
      dologin:function () {
        var vm=this;
        xhttp.post('/login',
                {username:vm.username,password:vm.password},
                function(res) {
                    res = typeof res == 'string' ? JSON.parse(res) : res;
                     if (res.success_code) { 
                      vm.addAuth();
                     } else if (res.error_code) {
                         var title = '';
                         switch (res.error_code) {
                             case 110:
                                 title = '用户不存在';
                                 break;
                             case 111:
                                 title = '权限不够';
                                 break;
                             case 113:
                                 title = '密码错误';
                                 break;
                         } 
                         vm.$toast.warn(title);
                     };
                });
      },
      addAuth:function () {
        var vm=this;
        xhttp.get('/addAuth',
                {account:vm.username},
                function(res) {
                  if (res.auth) {
                    mt.setCookie('auth',res.auth);
                    window.location.href = routes.rootPath+'/'; 
                  }else{
                    vm.$toast.warn('权限不够');
                  }
                });
      } 
    }
  }
</script>  
