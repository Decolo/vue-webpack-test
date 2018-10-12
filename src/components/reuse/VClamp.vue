<template>
  <span ref="clampcontainer">
  	<slot> </slot>
  </span>
</template>


<script>

export default {
    props: {
        clamp: {
          type: null,
          default: 2
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
      return {
      	ele:'', 
        sty:'',  
        splitOnCharList : this.splitOnChars.slice(0),
        splitChar : this.splitOnChars[0],
        chunks:'',
        lastChunk:'',
        truncationHTML:''
      }
    },
    mounted:function(){
    	this.truncationHTML=this.$refs.clampcontainer.getElementsByClassName('truncation')[0]
    	this.clampElement();
    },
    updated:function(){ 
    	this.clampElement();
    },
    methods:{
    	clampElement:function(){ 
	    	var vm=this; 
            var clampValue=this.clamp;
            var isCSSValue=clampValue.indexOf && (clampValue.indexOf('px') > -1 || clampValue.indexOf('em') > -1)
	    	var element=vm.ele=this.$refs.clampcontainer;  
	    	vm.sty=vm.ele.style; 
	    	if (clampValue == 'auto') {
	            clampValue = vm.getMaxLines();
	        }
	        else if (isCSSValue) {
	            clampValue = vm.getMaxLines(parseInt(vm.clampValue));
	        }

	        var clampedText; 
	        var height = vm.getMaxHeight(clampValue);
	        if (height < element.clientHeight) { 
	            clampedText = vm.truncate(vm.getLastChild(element), height);
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
        truncate:function (target, maxHeight) {
            if (!maxHeight) {return;}
            var vm=this;
            
            /**
             * Resets global variables.
             */
            function reset() {
                vm.splitOnCharList = vm.splitOnChars.slice(0);
                vm.splitChar = vm.splitOnCharList[0];
                vm.chunks = null;
                vm.lastChunk = null;
            }
            
            var nodeValue = target.nodeValue.replace(vm.truncationChar, '');
            
            //Grab the next chunks
            if (!vm.chunks) {
                //If there are more characters to try, grab the next one
                if (vm.splitOnCharList.length > 0) {
                    vm.splitChar = vm.splitOnCharList.shift();
                }
                //No characters to chunk by. Go character-by-character
                else {
                    vm.splitChar = '';
                }
                
                vm.chunks = nodeValue.split(vm.splitChar);
            }
             
            //If there are chunks left to remove, remove the last one and see if
            // the nodeValue fits.
            if (vm.chunks.length > 1) {
                // console.log('chunks', chunks);
                vm.lastChunk = vm.chunks.pop(); 
                // console.log('lastChunk', lastChunk);
                vm.applyEllipsis(target, vm.chunks.join(vm.splitChar));
            }
            //No more chunks can be removed using this character
            else {
                vm.chunks = null;
            } 

            if (vm.truncationHTML) {
                target.nodeValue = target.nodeValue.replace(vm.truncationChar, '');
                vm.ele.innerHTML = target.nodeValue+ this.truncationChar;
                vm.ele.appendChild(vm.truncationHTML);
            }


            //Search produced valid chunks
            if (vm.chunks) {
                //It fits
                if (vm.ele.clientHeight <= maxHeight) { 
                    //There's still more characters to try splitting on, not quite done yet
                    if (vm.splitOnCharList.length >= 0 && vm.splitChar != '') {
                        vm.applyEllipsis(target, vm.chunks.join(vm.splitChar) + vm.splitChar + vm.lastChunk);
                        vm.chunks = null;
                    }
                    //Finished!
                    else {
                        return vm.ele.innerHTML;
                    }
                }
            }
            //No valid chunks produced
            else {
                //No valid chunks even when splitting by letter, time to move
                //on to the next node 
                if (vm.splitChar == '') {
                    vm.applyEllipsis(target, '');
                    target = vm.getLastChild(vm.ele);
                    reset();
                }
            }
            
            return vm.truncate(target, maxHeight); 
        },
        applyEllipsis:function (elem, str) { 
            elem.nodeValue = str + this.truncationChar;
        }
    }
}

</script>