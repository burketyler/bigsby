"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[513],{3905:function(e,n,t){t.d(n,{Zo:function(){return p},kt:function(){return f}});var r=t(7294);function i(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function o(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function a(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?o(Object(t),!0).forEach((function(n){i(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):o(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function l(e,n){if(null==e)return{};var t,r,i=function(e,n){if(null==e)return{};var t,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||(i[t]=e[t]);return i}(e,n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)t=o[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(i[t]=e[t])}return i}var s=r.createContext({}),c=function(e){var n=r.useContext(s),t=n;return e&&(t="function"==typeof e?e(n):a(a({},n),e)),t},p=function(e){var n=c(e.components);return r.createElement(s.Provider,{value:n},e.children)},u={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},g=r.forwardRef((function(e,n){var t=e.components,i=e.mdxType,o=e.originalType,s=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),g=c(t),f=i,d=g["".concat(s,".").concat(f)]||g[f]||u[f]||o;return t?r.createElement(d,a(a({ref:n},p),{},{components:t})):r.createElement(d,a({ref:n},p))}));function f(e,n){var t=arguments,i=n&&n.mdxType;if("string"==typeof e||i){var o=t.length,a=new Array(o);a[0]=g;var l={};for(var s in n)hasOwnProperty.call(n,s)&&(l[s]=n[s]);l.originalType=e,l.mdxType="string"==typeof e?e:i,a[1]=l;for(var c=2;c<o;c++)a[c]=t[c];return r.createElement.apply(null,a)}return r.createElement.apply(null,t)}g.displayName="MDXCreateElement"},349:function(e,n,t){t.r(n),t.d(n,{assets:function(){return p},contentTitle:function(){return s},default:function(){return f},frontMatter:function(){return l},metadata:function(){return c},toc:function(){return u}});var r=t(3117),i=t(102),o=(t(7294),t(3905)),a=["components"],l={},s="Configuration",c={unversionedId:"usage/configuration",id:"usage/configuration",title:"Configuration",description:"Configuration in Bigsby follows a cascading pattern running from the top level, the default config,",source:"@site/docs/usage/configuration.mdx",sourceDirName:"usage",slug:"/usage/configuration",permalink:"/bigsby/docs/usage/configuration",tags:[],version:"current",frontMatter:{},sidebar:"docs",previous:{title:"Getting started",permalink:"/bigsby/docs/getting-started"},next:{title:"Logging",permalink:"/bigsby/docs/usage/logging"}},p={},u=[{value:"Default Config",id:"default-config",level:2},{value:"Instance Config",id:"instance-config",level:2},{value:"Inline Config",id:"inline-config",level:2},{value:"Decorated Config",id:"decorated-config",level:2}],g={toc:u};function f(e){var n=e.components,t=(0,i.Z)(e,a);return(0,o.kt)("wrapper",(0,r.Z)({},g,t,{components:n,mdxType:"MDXLayout"}),(0,o.kt)("h1",{id:"configuration"},"Configuration"),(0,o.kt)("p",null,"Configuration in Bigsby follows a cascading pattern running from the top level, the ",(0,o.kt)("a",{parentName:"p",href:"#default-config"},"default config"),",\nto the bottom level ",(0,o.kt)("a",{parentName:"p",href:"#decorated-config"},"decorated config"),". The configs defined at each level are merged on top of\nthe previous level."),(0,o.kt)("div",{style:{display:"flex",justifyContent:"center"}},(0,o.kt)("a",{href:"/bigsby/img/config-diagram.png",target:"_blank"},(0,o.kt)("img",{src:"/bigsby/img/config-diagram.png",style:{height:"25rem"},alt:"Request Lifecycle"}))),(0,o.kt)("h2",{id:"default-config"},"Default Config"),(0,o.kt)("p",null,"A Bigsby instance is bootstrapped with default configuration settings for important functionality:"),(0,o.kt)("ul",null,(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"request.enableTypeCoercion = true")),(0,o.kt)("li",{parentName:"ul"},(0,o.kt)("inlineCode",{parentName:"li"},"response.enableInferContentType = true"))),(0,o.kt)("h2",{id:"instance-config"},"Instance Config"),(0,o.kt)("p",null,"When creating a Bigsby instance, it's possible to specify configuration for Bigsby itself, as well as options\nthat will be inherited by every handler created by the instance."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},'const bigsby = new Bigsby({\n  api: {\n    response: {\n      headers: {\n        "Access-Control-Allow-Origin": "*",\n        "Access-Control-Allow-Methods": "GET",\n      },\n    },\n  },\n});\n')),(0,o.kt)("p",null,"At any point after creation, you can reset the settings of your Bigsby instance using the ",(0,o.kt)("inlineCode",{parentName:"p"},"setConfig"),"\nmethod. This will result in all previous configurations being erased, and the inputs configurations being merged\ndirectly on top of the ",(0,o.kt)("a",{parentName:"p",href:"#default-configs"},"default configs"),"."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},'bigsby.setConfig({\n  api: {\n    response: {\n      headers: {\n        "Access-Control-Allow-Origin": "https://mydomain.com",\n        "Access-Control-Allow-Methods": "POST",\n      },\n    },\n  },\n});\n')),(0,o.kt)("p",null,"It's possible to merge a new set of configs onto the existing instance configs without resetting them using\nthe ",(0,o.kt)("inlineCode",{parentName:"p"},"patchConfig")," method."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},'bigsby.patchConfig({\n  api: {\n    response: {\n      headers: {\n        "Access-Control-Allow-Methods": "*",\n      },\n    },\n  },\n});\n')),(0,o.kt)("h2",{id:"inline-config"},"Inline Config"),(0,o.kt)("p",null,"Inline configuration can be set directly on a handler by providing a config object when creating the handler\nusing ",(0,o.kt)("inlineCode",{parentName:"p"},"createApiHandler"),". Configs set at this level will take precedence over those set at the instance level."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"@Api()\nclass ArnyQuotesHandler implements ApiHandler {\n  public async invoke(): Promise<string> {\n    return getQuote();\n  }\n}\n\nexport default bigsby.createApiHandler(ArnyQuotesHandler, {\n  lifecycle: {\n    onError: [sendAlert],\n  },\n});\n")),(0,o.kt)("h2",{id:"decorated-config"},"Decorated Config"),(0,o.kt)("p",null,"Decorating your handler classes is another method of providing configuration. Similar to ",(0,o.kt)("a",{parentName:"p",href:"#inline-config"},"inline config"),"\nyou can provide configs directly to your handler, but instead by adding them as an argument to the ",(0,o.kt)("inlineCode",{parentName:"p"},"@Api")," decorator."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-typescript"},"@Api({\n  lifecycle: {\n    onError: [sendAlert],\n  },\n})\nclass ArnyQuotesHandler implements ApiHandler {\n  public async invoke(): Promise<string> {\n    return getQuote();\n  }\n}\n\nexport default bigsby.createApiHandler(ArnyQuotesHandler);\n")),(0,o.kt)("p",null,"More specific settings like ",(0,o.kt)("a",{parentName:"p",href:"/bigsby/docs/usage/authentication"},"authentication"),", ",(0,o.kt)("a",{parentName:"p",href:"/bigsby/docs/usage/validation"},"validation"),", and ",(0,o.kt)("a",{parentName:"p",href:"/bigsby/docs/usage/versioning"},"versioning"),"\nuse their specialised decorators to apply the configuration and are interpreted by Bigsby when creating the handler."),(0,o.kt)("p",null,"All decorated configs take precedence over those set at the ",(0,o.kt)("a",{parentName:"p",href:"#inline-config"},"inline")," or ",(0,o.kt)("a",{parentName:"p",href:"#instance-config"},"instance")," level."))}f.isMDXComponent=!0}}]);