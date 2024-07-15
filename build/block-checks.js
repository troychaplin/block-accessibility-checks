(()=>{"use strict";const e=window.wp.plugins,t=window.wp.data;function n(){return(0,t.useSelect)((function(e){return e("core/block-editor").getBlocks()}),[]).flatMap((function(e){return u.map((function(t){return t(e)}))})).filter((function(e){return!e.isValid}))}const r=window.wp.element,a=window.wp.compose,i=window.wp.hooks;function c(){return c=Object.assign?Object.assign.bind():function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)({}).hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},c.apply(null,arguments)}var o=(0,a.createHigherOrderComponent)((function(e){var t=function(t){var r=n().find((function(e){return e.clientId===t.clientId})),a=r?r.message:"";return React.createElement(React.Fragment,null,r?React.createElement("div",null,React.createElement("div",{className:"a11y-block-error"},React.createElement("div",{className:"a11y-error-msg"},React.createElement("svg",{xmlns:"http://www.w3.org/2000/svg",height:"1em",viewBox:"0 0 512 512",fill:"#8B3122"},React.createElement("path",{d:"M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"})),a),React.createElement(e,c({},t,{className:"".concat(t.className)})))):React.createElement(e,c({},t,{className:"".concat(t.className)})))};return t.displayName="a11yCheck(".concat(e.displayName||e.name||"Component",")"),t}),"blockErrorComponent");(0,i.addFilter)("editor.BlockListBlock","block-a11y-checks/with-client-id-class-name",o);const l=window.wp.i18n;function s(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=Array(t);n<t;n++)r[n]=e[n];return r}var u=[function(e){return function e(t,n){var r,a=function(e,t){var n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=function(e,t){if(e){if("string"==typeof e)return s(e,t);var n={}.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?s(e,t):void 0}}(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var _n=0,r=function(){};return{s:r,n:function(){return _n>=e.length?{done:!0}:{done:!1,value:e[_n++]}},e:function(e){throw e},f:r}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,i=!0,c=!1;return{s:function(){n=n.call(e)},n:function(){var e=n.next();return i=e.done,e},e:function(e){c=!0,a=e},f:function(){try{i||null==n.return||n.return()}finally{if(c)throw a}}}}(t);try{for(a.s();!(r=a.n()).done;){var i=r.value;if("core/button"===i.name){var c=i.attributes,o=c.text,u=c.url;if(""===o||void 0===u)return{isValid:!1,message:(0,l.__)("Accessibility Error: Each button must have both text and URL.","block-accessibility-checks"),clientId:n}}if(i.innerBlocks.length>0){var d=e(i.innerBlocks,n);if(!d.isValid)return d}}}catch(e){a.e(e)}finally{a.f()}return{isValid:!0}}(e.innerBlocks,e.clientId)},function(e){return"core/heading"===e.name&&1===e.attributes.level?{isValid:!1,message:(0,l.__)("Accessibility Error: Level 1 headings are not allowed in your content area.","block-accessibility-checks"),clientId:e.clientId}:{isValid:!0}},function(e){return"core/table"===e.name&&0!==e.attributes.body.length&&0===e.attributes.head.length?{isValid:!1,message:(0,l.__)("Accessibility Error: Tables are required to have a header row.","block-accessibility-checks"),clientId:e.clientId}:{isValid:!0}}];(0,e.registerPlugin)("block-validation",{render:function(){var e=n(),a=(0,t.useDispatch)("core/editor"),i=a.lockPostSaving,c=a.unlockPostSaving,o=a.lockPostAutosaving,l=a.unlockPostAutosaving,s=a.disablePublishSidebar,u=a.enablePublishSidebar;return(0,r.useEffect)((function(){e.length>0?(i(),o(),s()):(c(),l(),u())}),[e,s,u,o,i,l,c]),null}})})();