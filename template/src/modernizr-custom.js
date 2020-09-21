/*! modernizr 3.6.0 (Custom Build) | MIT *
 * https://modernizr.com/download/?-arrow-contenteditable-es5-es6array-es6collections-es6object-eventlistener-indexeddb-inlinesvg-localstorage-promises-queryselector-svgforeignobject-urlparser-setclasses !*/
!function(window,document,undefined){function is(e,r){return typeof e===r}function testRunner(){var e,r,t,n,o,i,s;for(var d in tests)if(tests.hasOwnProperty(d)){if(e=[],r=tests[d],r.name&&(e.push(r.name.toLowerCase()),r.options&&r.options.aliases&&r.options.aliases.length))for(t=0;t<r.options.aliases.length;t++)e.push(r.options.aliases[t].toLowerCase());for(n=is(r.fn,"function")?r.fn():r.fn,o=0;o<e.length;o++)i=e[o],s=i.split("."),1===s.length?Modernizr[s[0]]=n:(!Modernizr[s[0]]||Modernizr[s[0]]instanceof Boolean||(Modernizr[s[0]]=new Boolean(Modernizr[s[0]])),Modernizr[s[0]][s[1]]=n),classes.push((n?"":"no-")+s.join("-"))}}function setClasses(e){var r=docElement.className,t=Modernizr._config.classPrefix||"";if(isSVG&&(r=r.baseVal),Modernizr._config.enableJSClass){var n=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");r=r.replace(n,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(r+=" "+t+e.join(" "+t),isSVG?docElement.className.baseVal=r:docElement.className=r)}function createElement(){return"function"!=typeof document.createElement?document.createElement(arguments[0]):isSVG?document.createElementNS.call(document,"http://www.w3.org/2000/svg",arguments[0]):document.createElement.apply(document,arguments)}function cssToDOM(e){return e.replace(/([a-z])-([a-z])/g,function(e,r,t){return r+t.toUpperCase()}).replace(/^-/,"")}function addTest(e,r){if("object"==typeof e)for(var t in e)hasOwnProp(e,t)&&addTest(t,e[t]);else{e=e.toLowerCase();var n=e.split("."),o=Modernizr[n[0]];if(2==n.length&&(o=o[n[1]]),"undefined"!=typeof o)return Modernizr;r="function"==typeof r?r():r,1==n.length?Modernizr[n[0]]=r:(!Modernizr[n[0]]||Modernizr[n[0]]instanceof Boolean||(Modernizr[n[0]]=new Boolean(Modernizr[n[0]])),Modernizr[n[0]][n[1]]=r),setClasses([(r&&0!=r?"":"no-")+n.join("-")]),Modernizr._trigger(e,r)}return Modernizr}function contains(e,r){return!!~(""+e).indexOf(r)}function fnBind(e,r){return function(){return e.apply(r,arguments)}}function testDOMProps(e,r,t){var n;for(var o in e)if(e[o]in r)return t===!1?e[o]:(n=r[e[o]],is(n,"function")?fnBind(n,t||r):n);return!1}function domToCSS(e){return e.replace(/([A-Z])/g,function(e,r){return"-"+r.toLowerCase()}).replace(/^ms-/,"-ms-")}function computedStyle(e,r,t){var n;if("getComputedStyle"in window){n=getComputedStyle.call(window,e,r);var o=window.console;if(null!==n)t&&(n=n.getPropertyValue(t));else if(o){var i=o.error?"error":"log";o[i].call(o,"getComputedStyle returning null, its possible modernizr test results are inaccurate")}}else n=!r&&e.currentStyle&&e.currentStyle[t];return n}function getBody(){var e=document.body;return e||(e=createElement(isSVG?"svg":"body"),e.fake=!0),e}function injectElementWithStyles(e,r,t,n){var o,i,s,d,a="modernizr",l=createElement("div"),c=getBody();if(parseInt(t,10))for(;t--;)s=createElement("div"),s.id=n?n[t]:a+(t+1),l.appendChild(s);return o=createElement("style"),o.type="text/css",o.id="s"+a,(c.fake?c:l).appendChild(o),c.appendChild(l),o.styleSheet?o.styleSheet.cssText=e:o.appendChild(document.createTextNode(e)),l.id=a,c.fake&&(c.style.background="",c.style.overflow="hidden",d=docElement.style.overflow,docElement.style.overflow="hidden",docElement.appendChild(c)),i=r(l,e),c.fake?(c.parentNode.removeChild(c),docElement.style.overflow=d,docElement.offsetHeight):l.parentNode.removeChild(l),!!i}function nativeTestProps(e,r){var t=e.length;if("CSS"in window&&"supports"in window.CSS){for(;t--;)if(window.CSS.supports(domToCSS(e[t]),r))return!0;return!1}if("CSSSupportsRule"in window){for(var n=[];t--;)n.push("("+domToCSS(e[t])+":"+r+")");return n=n.join(" or "),injectElementWithStyles("@supports ("+n+") { #modernizr { position: absolute; } }",function(e){return"absolute"==computedStyle(e,null,"position")})}return undefined}function testProps(e,r,t,n){function o(){s&&(delete mStyle.style,delete mStyle.modElem)}if(n=is(n,"undefined")?!1:n,!is(t,"undefined")){var i=nativeTestProps(e,t);if(!is(i,"undefined"))return i}for(var s,d,a,l,c,u=["modernizr","tspan","samp"];!mStyle.style&&u.length;)s=!0,mStyle.modElem=createElement(u.shift()),mStyle.style=mStyle.modElem.style;for(a=e.length,d=0;a>d;d++)if(l=e[d],c=mStyle.style[l],contains(l,"-")&&(l=cssToDOM(l)),mStyle.style[l]!==undefined){if(n||is(t,"undefined"))return o(),"pfx"==r?l:!0;try{mStyle.style[l]=t}catch(f){}if(mStyle.style[l]!=c)return o(),"pfx"==r?l:!0}return o(),!1}function testPropsAll(e,r,t,n,o){var i=e.charAt(0).toUpperCase()+e.slice(1),s=(e+" "+cssomPrefixes.join(i+" ")+i).split(" ");return is(r,"string")||is(r,"undefined")?testProps(s,r,n,o):(s=(e+" "+domPrefixes.join(i+" ")+i).split(" "),testDOMProps(s,r,t))}function detectDeleteDatabase(e,r){var t=e.deleteDatabase(r);t.onsuccess=function(){addTest("indexeddb.deletedatabase",!0)},t.onerror=function(){addTest("indexeddb.deletedatabase",!1)}}var classes=[],tests=[],ModernizrProto={_version:"3.6.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,r){var t=this;setTimeout(function(){r(t[e])},0)},addTest:function(e,r,t){tests.push({name:e,fn:r,options:t})},addAsyncTest:function(e){tests.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=ModernizrProto,Modernizr=new Modernizr,Modernizr.addTest("eventlistener","addEventListener"in window),Modernizr.addTest("queryselector","querySelector"in document&&"querySelectorAll"in document),Modernizr.addTest("es6array",!!(Array.prototype&&Array.prototype.copyWithin&&Array.prototype.fill&&Array.prototype.find&&Array.prototype.findIndex&&Array.prototype.keys&&Array.prototype.entries&&Array.prototype.values&&Array.from&&Array.of)),Modernizr.addTest("arrow",function(){try{eval("()=>{}")}catch(e){return!1}return!0}),Modernizr.addTest("es6collections",!!(window.Map&&window.Set&&window.WeakMap&&window.WeakSet)),Modernizr.addTest("es6object",!!(Object.assign&&Object.is&&Object.setPrototypeOf)),Modernizr.addTest("promises",function(){return"Promise"in window&&"resolve"in window.Promise&&"reject"in window.Promise&&"all"in window.Promise&&"race"in window.Promise&&function(){var e;return new window.Promise(function(r){e=r}),"function"==typeof e}()}),Modernizr.addTest("localstorage",function(){var e="modernizr";try{return localStorage.setItem(e,e),localStorage.removeItem(e),!0}catch(r){return!1}}),Modernizr.addTest("urlparser",function(){var e;try{return e=new URL("http://modernizr.com/"),"http://modernizr.com/"===e.href}catch(r){return!1}});var docElement=document.documentElement,isSVG="svg"===docElement.nodeName.toLowerCase();Modernizr.addTest("contenteditable",function(){if("contentEditable"in docElement){var e=createElement("div");return e.contentEditable=!0,"true"===e.contentEditable}}),Modernizr.addTest("inlinesvg",function(){var e=createElement("div");return e.innerHTML="<svg/>","http://www.w3.org/2000/svg"==("undefined"!=typeof SVGRect&&e.firstChild&&e.firstChild.namespaceURI)}),Modernizr.addTest("es5array",function(){return!!(Array.prototype&&Array.prototype.every&&Array.prototype.filter&&Array.prototype.forEach&&Array.prototype.indexOf&&Array.prototype.lastIndexOf&&Array.prototype.map&&Array.prototype.some&&Array.prototype.reduce&&Array.prototype.reduceRight&&Array.isArray)}),Modernizr.addTest("es5date",function(){var e="2013-04-12T06:06:37.307Z",r=!1;try{r=!!Date.parse(e)}catch(t){}return!!(Date.now&&Date.prototype&&Date.prototype.toISOString&&Date.prototype.toJSON&&r)}),Modernizr.addTest("es5function",function(){return!(!Function.prototype||!Function.prototype.bind)}),Modernizr.addTest("es5object",function(){return!!(Object.keys&&Object.create&&Object.getPrototypeOf&&Object.getOwnPropertyNames&&Object.isSealed&&Object.isFrozen&&Object.isExtensible&&Object.getOwnPropertyDescriptor&&Object.defineProperty&&Object.defineProperties&&Object.seal&&Object.freeze&&Object.preventExtensions)}),Modernizr.addTest("strictmode",function(){"use strict";return!this}()),Modernizr.addTest("es5string",function(){return!(!String.prototype||!String.prototype.trim)}),Modernizr.addTest("json","JSON"in window&&"parse"in JSON&&"stringify"in JSON),Modernizr.addTest("es5syntax",function(){var value,obj,stringAccess,getter,setter,reservedWords,zeroWidthChars;try{return stringAccess=eval('"foobar"[3] === "b"'),getter=eval("({ get x(){ return 1 } }).x === 1"),eval("({ set x(v){ value = v; } }).x = 1"),setter=1===value,eval("obj = ({ if: 1 })"),reservedWords=1===obj["if"],zeroWidthChars=eval("_‌‍ = true"),stringAccess&&getter&&setter&&reservedWords&&zeroWidthChars}catch(ignore){return!1}}),Modernizr.addTest("es5undefined",function(){var e,r;try{r=window.undefined,window.undefined=12345,e="undefined"==typeof window.undefined,window.undefined=r}catch(t){return!1}return e}),Modernizr.addTest("es5",function(){return!!(Modernizr.es5array&&Modernizr.es5date&&Modernizr.es5function&&Modernizr.es5object&&Modernizr.strictmode&&Modernizr.es5string&&Modernizr.json&&Modernizr.es5syntax&&Modernizr.es5undefined)});var toStringFn={}.toString;Modernizr.addTest("svgforeignobject",function(){return!!document.createElementNS&&/SVGForeignObject/.test(toStringFn.call(document.createElementNS("http://www.w3.org/2000/svg","foreignObject")))});var hasOwnProp;!function(){var e={}.hasOwnProperty;hasOwnProp=is(e,"undefined")||is(e.call,"undefined")?function(e,r){return r in e&&is(e.constructor.prototype[r],"undefined")}:function(r,t){return e.call(r,t)}}(),ModernizrProto._l={},ModernizrProto.on=function(e,r){this._l[e]||(this._l[e]=[]),this._l[e].push(r),Modernizr.hasOwnProperty(e)&&setTimeout(function(){Modernizr._trigger(e,Modernizr[e])},0)},ModernizrProto._trigger=function(e,r){if(this._l[e]){var t=this._l[e];setTimeout(function(){var e,n;for(e=0;e<t.length;e++)(n=t[e])(r)},0),delete this._l[e]}},Modernizr._q.push(function(){ModernizrProto.addTest=addTest});var omPrefixes="Moz O ms Webkit",cssomPrefixes=ModernizrProto._config.usePrefixes?omPrefixes.split(" "):[];ModernizrProto._cssomPrefixes=cssomPrefixes;var atRule=function(e){var r,t=prefixes.length,n=window.CSSRule;if("undefined"==typeof n)return undefined;if(!e)return!1;if(e=e.replace(/^@/,""),r=e.replace(/-/g,"_").toUpperCase()+"_RULE",r in n)return"@"+e;for(var o=0;t>o;o++){var i=prefixes[o],s=i.toUpperCase()+"_"+r;if(s in n)return"@-"+i.toLowerCase()+"-"+e}return!1};ModernizrProto.atRule=atRule;var domPrefixes=ModernizrProto._config.usePrefixes?omPrefixes.toLowerCase().split(" "):[];ModernizrProto._domPrefixes=domPrefixes;var modElem={elem:createElement("modernizr")};Modernizr._q.push(function(){delete modElem.elem});var mStyle={style:modElem.elem.style};Modernizr._q.unshift(function(){delete mStyle.style}),ModernizrProto.testAllProps=testPropsAll;var prefixed=ModernizrProto.prefixed=function(e,r,t){return 0===e.indexOf("@")?atRule(e):(-1!=e.indexOf("-")&&(e=cssToDOM(e)),r?testPropsAll(e,r,t):testPropsAll(e,"pfx"))};Modernizr.addAsyncTest(function(){var e;try{e=prefixed("indexedDB",window)}catch(r){}if(e){var t="modernizr-"+Math.random(),n=e.open(t);n.onerror=function(){n.error&&"InvalidStateError"===n.error.name?addTest("indexeddb",!1):(addTest("indexeddb",!0),detectDeleteDatabase(e,t))},n.onsuccess=function(){addTest("indexeddb",!0),detectDeleteDatabase(e,t)}}else addTest("indexeddb",!1)}),testRunner(),setClasses(classes),delete ModernizrProto.addTest,delete ModernizrProto.addAsyncTest;for(var i=0;i<Modernizr._q.length;i++)Modernizr._q[i]();window.Modernizr=Modernizr}(window,document);