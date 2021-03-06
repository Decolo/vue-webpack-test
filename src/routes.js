export default {
  rootPath: '/data',
  routeMap: {
    '/login': 'Login',
    '/': 'ProScale',
    '/productscale': 'ProScale',
    '/webvisted': 'WebVisted',
    '/webTrend': 'WebTrend',
    '/webnewvisit': 'webNewUV',
    '/webperdur': 'WebPerDuration',
    '/webavgviews': 'WebAvgViews',
    '/appdown': 'AppDownload',
    '/appnewdown': 'AppNewDown',
    '/appcomment': 'AppNewComment',
    '/appscore': 'AppAvgScore',
    '/wxscale': 'WxScale',
    '/wxincrease': 'WxIncrease',
    '/wxloss': 'WxLoss',
    '/wbscale': 'WbScale',
    '/wbincrease': 'WbIncrease',
    '/webRank': 'WebRank',
    '/zjxwbasic': 'ZjxwBasic',
    '/zjxwcontent': 'ZjxwContent',
    '/zjxwcity': 'ZjxwCity',
    '/zjxwlocal': 'ZjxwLocal',
    '/zjxwNews': 'ZjxwNews',
    '/zjxwActivity': 'ZjxwActivity',
    '/zjxwSubject': 'ZjxwSubject',
    '/zjxwPlace': 'ZjxwPlace',
    '/zjxwRank': 'ZjxwRank'
  },
  extraRoutes: {
    detail: '/details'
  },
  menus: [{
    title: '产品全局',
    haschild: true,
    showChildMenu: false,
    icon: 'fa fa-cubes',
    children: [{
      title: '产品规模',
      route: '/productscale',
      haschild: false,
      needauth: true,
      auth: 'productScale'
    }, {
      title: 'WEB',
      haschild: true,
      needauth: true,
      auth: 'web',
      hasreturn: true,
      showChildMenu: false,
      children: [{
        title: '网站访客规模',
        route: '/webvisted',
        haschild: false
      }, {
        title: '网站访客趋势',
        route: '/webTrend',
        haschild: false
      }, {
        title: '网站新增访客',
        route: '/webnewvisit',
        haschild: false
      }, {
        title: '网站次均停留时长',
        route: '/webperdur',
        haschild: false
      }, {
        title: '网站访客浏览页数',
        route: '/webavgviews',
        haschild: false
      }]
    }, {
      title: '竞品APP',
      haschild: true,
      hasreturn: true,
      needauth: true,
      auth: 'app',
      showChildMenu: false,
      children: [{
        title: 'APP下载量',
        route: '/appdown',
        haschild: false
      }, {
        title: 'APP新下载',
        route: '/appnewdown',
        haschild: false
      }, {
        title: 'APP评论数',
        route: '/appcomment',
        haschild: false
      }, {
        title: 'APP评分',
        route: '/appscore',
        haschild: false
      }]
    }, {
      title: '微信',
      needauth: true,
      auth: 'weixin',
      haschild: true,
      showChildMenu: false,
      hasreturn: true,
      children: [{
        title: '微信用户规模',
        route: '/wxscale',
        haschild: false
      }, {
        title: '微信净增用户',
        route: '/wxincrease',
        haschild: false
      }, {
        title: '微信流失用户',
        route: '/wxloss',
        haschild: false
      }]
    }, {
      title: '微博',
      needauth: true,
      auth: 'weibo',
      haschild: true,
      hasreturn: true,
      showChildMenu: false,
      children: [{
        title: '微博用户规模',
        route: '/wbscale',
        haschild: false
      }, {
        title: '微博净增用户',
        route: '/wbincrease',
        haschild: false
      }]
    }]
  }, {
    title: '内容全局',
    needauth: true,
    auth: 'contentList',
    haschild: true,
    showChildMenu: false,
    icon: 'fa fa-database',
    children: [{
      title: 'WEB内容榜单',
      route: '/webRank',
      haschild: false
    }]
  }, {
    title: '产品线',
    haschild: true,
    showChildMenu: false,
    icon: 'fa fa-gg',
    children: [{
      title: '浙江新闻',
      haschild: true,
      needauth: true,
      auth: 'zjxw',
      hasreturn: true,
      showChildMenu: false,
      children: [{
        title: '基础指标',
        route: '/zjxwbasic',
        haschild: false
      }, {
        title: '内容频道',
        route: '/zjxwcontent',
        haschild: false
      }, {
        title: '地市频道',
        route: '/zjxwcity',
        haschild: false
      }, {
        title: '本地板块',
        route: '/zjxwlocal',
        haschild: false
      }, {
        title: '新闻',
        route: '/zjxwNews',
        haschild: false
      }, {
        title: '活动',
        route: '/zjxwActivity',
        haschild: false
      }, {
        title: '专题',
        route: '/zjxwSubject',
        haschild: false
      }, {
        title: '位置',
        route: '/zjxwPlace',
        haschild: false
      }, {
        title: '排行',
        route: '/zjxwRank',
        haschild: false
      }]
    }]
  }]
}
