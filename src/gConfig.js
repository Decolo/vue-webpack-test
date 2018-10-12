var config={
    apiRoot:'/zapi',
    linecolors:['214,103,205','255, 178, 88','117, 112, 255','255, 129, 172','255, 152, 117','253, 86, 238','222, 96, 108','186, 120, 255','73, 158, 239','221, 161, 137'],
    colorarray:["#4DD7C6", "#FF9875", "#DD616E",  "#FC56EE", "#BA77FF","#FF81AC", "#52D6ED", "#7075FF", "#445AB7", "#9079C8"],
    darkcolorarray:["#1E564F", "#663C2E", "#58262C", "#64225F", "#4A2F66", "#66334", "#20555E", "#2E2C66", "#1B2449", "#393050"],
    color:function(index){
       return config.colorarray[config.ranged(index,config.colorarray.length-1)];
    },
    darkcolor:function(index){
       return config.darkcolorarray[config.ranged(index,config.darkcolorarray.length-1)];
    },
    ranged:function(i,l){ 
        return i>l?config.ranged(i-l,l):i;
    },
    ownproducts:['浙江新闻', '浙江24小时', '浙江政务服务'],
    chartsize:{
        width:screen.width>600?600:screen.width,
    	height:screen.height * 0.4,//图表高度
    	barwidth:20,//柱状图条形宽度
    	bargrid:{
    		top:10,
    		bottom:10,
    		left:0
    	},//柱形图布局
        lineGrid:{
            top:50,
            bottom:50,
            left:10,
            right:10,
            tooltipMargin:14
        },//条图布局
    	barmargin:10
    },
    username:function(){
        var hasName=false;
        var name='';
        var reg = /name\|\d+:[0-9a-zA-Z\+\/]*/g;
        var namearr = document.cookie.match(reg);
        if (namearr && namearr.length > 0) {
            var namestr = document.cookie.match(reg)[0];
            name = namestr.substr(namestr.indexOf(':') + 1);
        } 
        return name;
    },
    account:function(){
        var hasName=false;
        var name='';
        var reg = /user\|\d+:[0-9a-zA-Z\+\/]*/g;
        var namearr = document.cookie.match(reg);
        if (namearr && namearr.length > 0) {
            var namestr = document.cookie.match(reg)[0];
            name = namestr.substr(namestr.indexOf(':') + 1);
        } 
        return name;
    }
}

export default config;
