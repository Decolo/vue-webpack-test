<template>
  <span ref="clampcontainer">{{clampedText}}<slot></slot></span>
</template>


<script>

export default {
    props: {
        clamp: {
          type: null,
          default: 2
        },
        text:{
          type:String,
          require:true
        },
        splitOnChars: {
          type: Array,
          default: function(){return ['.', '-', '–', '—', ' ']}
        }, 
        truncationChar: {
          type: String,
          default: '…'
        } 
    },
    data: function () {
      var clampValue=this.clamp;
      return {
      	ele:'',
        originalText: this.text,
        sty:'',
        tweeningText:this.text,
        clampedText:this.text,
        clampValue:clampValue,
        isCSSValue:clampValue.indexOf && (clampValue.indexOf('px') > -1 || clampValue.indexOf('em') > -1),
        splitOnCharList : this.splitOnChars.slice(0),
        splitChar : this.splitOnChars[0],
        chunks:'',
        lastChunk:''

      }
    },
    mounted:function(){
        this.clampElement();
    },
    updated:function(){
        this.$nextTick(function () {  
            this.truncate(); 
        })
    },
    methods:{
        clampElement:function(){  
            var vm=this;
            var element=vm.ele=this.$refs.clampcontainer;  
            vm.sty=vm.ele.style;
            if (vm.clampValue == 'auto') {
                vm.clampValue = vm.getMaxLines();
            }
            else if (vm.isCSSValue) {
                vm.clampValue = vm.getMaxLines(parseInt(vm.clampValue));
            } 
            var height = vm.getMaxHeight(vm.clampValue); 
            if (height < element.clientHeight) { 
                vm.toTruncate(vm.clampedText, height);
            }  
        },
    	computeStyle:function(elem, prop) {
    		var win=window;
            if (!win.getComputedStyle) {
                win.getComputedStyle = function(el, pseudo) {
                    this.el = el;
                    this.getPropertyValue = function(prop) {
                        var re = /(\-([a-z]){1})/g;
                        if (prop == 'float') prop = 'styleFloat';
                        if (re.test(prop)) {
                            prop = prop.replace(re, function () {
                                return arguments[2].toUpperCase();
                            });
                        }
                        return el.currentStyle && el.currentStyle[prop] ? el.currentStyle[prop] : null;
                    }
                    return this;
                }
            }

            return win.getComputedStyle(elem, null).getPropertyValue(prop);
        },
        getMaxLines:function(height) {
            var availHeight = height || this.ele.clientHeight,
                lineHeight = this.getLineHeight(this.ele);
            return Math.max(Math.floor(availHeight/lineHeight), 0);
        },
        getMaxHeight:function(clmp) {
            var lineHeight = this.getLineHeight(this.ele);
            return lineHeight * clmp;
        },
        getLineHeight:function(elem) {
            var lh = this.computeStyle(elem, 'line-height');
            if (lh == 'normal') { 
                lh = parseInt(this.computeStyle(elem, 'font-size')) * 1.2;
            }
            return parseInt(lh);
        },
        getLastChild(elem) { 
        	var vm=this;
            if (elem.lastChild.children && elem.lastChild.children.length > 0) {
                return vm.getLastChild(Array.prototype.slice.call(elem.children).pop());
            } 
            else if (!elem.lastChild || !elem.lastChild.nodeValue || elem.lastChild.nodeValue == '' || elem.lastChild.nodeValue == vm.truncationChar) {
                elem.lastChild.parentNode.removeChild(elem.lastChild);
                return vm.getLastChild(vm.ele);
            } 
            else {
                return elem.lastChild;
            }
        },
        reset:function(){
            var vm=this;
            vm.splitOnCharList = vm.splitOnChars.slice(0); 
            vm.splitChar = vm.splitOnCharList[0];
            vm.chunks = null;
            vm.lastChunk = null;
        },
        toTruncate:function(clampText, maxHeight){ 
            if (!maxHeight) {return;}
            var vm=this;
            var nodeValue =clampText; 
            if (!vm.chunks) { 
                if (vm.splitOnCharList.length > 0) {
                    vm.splitChar = vm.splitOnCharList.shift();
                } 
                else {
                    vm.splitChar = '';
                }
                vm.chunks = nodeValue.split(vm.splitChar);  
            }
            vm.truncate(clampText, maxHeight);
        },
        truncate:function (clampText, maxHeight) {
            var vm=this;
            if (vm.chunks.length > 1) { 
                vm.lastChunk = vm.chunks.pop();  
                vm.applyEllipsis(vm.chunks.join(vm.splitChar));
            } 
            else {
                vm.chunks = null;
            }  
            if (vm.chunks) { 
                console.log(vm.ele.clientHeight+':'+maxHeight)
                if (vm.ele.clientHeight <= maxHeight) {  
                    if (vm.splitOnCharList.length >= 0 && vm.splitChar != '') {
                        vm.applyEllipsis(vm.chunks.join(vm.splitChar) + vm.splitChar + vm.lastChunk);
                        vm.chunks = null;
                    } 
                    else {
                        vm.clampedText=vm.tweeningText;
                    }
                }
                else{
                    vm.clampedText=vm.tweeningText;
                }
            } 
            else { 
                vm.toTruncate(vm.tweeningText, maxHeight); 
            }
        },
        applyEllipsis:function (str) { 
            this.tweeningText = str + this.truncationChar;
        }
    }
}

</script>