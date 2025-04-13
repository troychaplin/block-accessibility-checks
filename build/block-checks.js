(()=>{"use strict";const e=window.wp.i18n,t=window.wp.hooks,r=window.wp.compose,n=window.wp.blockEditor,i=window.wp.components;(0,t.addFilter)("blocks.registerBlockType","block-accessibility-checks/add-image-attribute",(function(e){return"core/image"!==e.name||(e.attributes=Object.assign(e.attributes,{isDecorative:{type:"boolean",default:!1}})),e}));var a=(0,r.createHigherOrderComponent)((function(t){return function(r){if("core/image"!==r.name)return React.createElement(t,r);var a=r.attributes,c=r.setAttributes,o=a.isDecorative;return React.createElement(React.Fragment,null,React.createElement(n.InspectorControls,null,React.createElement(i.PanelBody,{title:(0,e.__)("Accessibility Settings","block-accessibility-checks"),initialOpen:!0},React.createElement(i.ToggleControl,{label:(0,e.__)("Please confirm this image is decorative","block-accessibility-checks"),checked:o,onChange:function(e){return c({isDecorative:e})}}))),React.createElement(t,r))}}),"addImageInspectorControls");(0,t.addFilter)("editor.BlockEdit","block-accessibility-checks/add-inspector-control",a);const c=window.wp.plugins,o=window.wp.data;function s(e){return function(e){if(Array.isArray(e))return l(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(e){if("string"==typeof e)return l(e,t);var r={}.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?l(e,t):void 0}}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function l(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=Array(t);r<t;r++)n[r]=e[r];return n}function u(e){return e.flatMap((function(e){var t=p.map((function(t){return t(e)}));return e.innerBlocks&&e.innerBlocks.length>0?[].concat(s(t),s(u(e.innerBlocks))):t}))}function d(){return u((0,o.useSelect)((function(e){return e("core/block-editor").getBlocks()}),[])).filter((function(e){return!e.isValid}))}const b=window.wp.element;var m=BlockAccessibilityChecks.blockChecksOptions.core_button_block_check;function k(t){if("core/button"===t.name&&!t.attributes.url&&!t.attributes.text.originalHTML){var r={isValid:!0,message:"",clientId:t.clientId,mode:m};switch(m){case"error":r.isValid=!1,r.message=(0,e.__)("Error: Buttons must have text and a link","block-accessibility-checks");break;case"warning":r.isValid=!1,r.message=(0,e.__)("Warning: Buttons must have text and a link","block-accessibility-checks");break;default:r.isValid=!0}return r}return{isValid:!0,mode:"none"}}var f=BlockAccessibilityChecks.blockChecksOptions.core_image_block_check;function g(t){if("core/image"===t.name&&!t.attributes.alt&&!t.attributes.isDecorative){var r={isValid:!0,message:"",clientId:t.clientId,mode:f};switch(f){case"error":r.isValid=!1,r.message=(0,e.__)("Error: Images are required to have alternative text","block-accessibility-checks");break;case"warning":r.isValid=!1,r.message=(0,e.__)("Warning: Images are required to have alternative text","block-accessibility-checks");break;default:r.isValid=!0}return r}return{isValid:!0,mode:"none"}}var h=BlockAccessibilityChecks.blockChecksOptions.core_table_block_check;function y(t){if("core/table"===t.name&&0!==t.attributes.body.length&&0===t.attributes.head.length){var r={isValid:!0,message:"",clientId:t.clientId,mode:h};switch(h){case"error":r.isValid=!1,r.message=(0,e.__)("Error: Tables are required to have a header row","block-accessibility-checks");break;case"warning":r.isValid=!1,r.message=(0,e.__)("Warning: Tables are required to have a header row","block-accessibility-checks");break;default:r.isValid=!0}return r}return{isValid:!0,mode:"none"}}function v(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=Array(t);r<t;r++)n[r]=e[r];return n}var w=(0,r.createHigherOrderComponent)((function(t){return function(r){var a,c,o=r.name,s=r.attributes,l=r.clientId,u=(a=(0,b.useState)({isValid:!0,mode:"none",message:""}),c=2,function(e){if(Array.isArray(e))return e}(a)||function(e,t){var r=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=r){var n,i,a,c,o=[],s=!0,l=!1;try{if(a=(r=r.call(e)).next,0===t){if(Object(r)!==r)return;s=!1}else for(;!(s=(n=a.call(r)).done)&&(o.push(n.value),o.length!==t);s=!0);}catch(e){l=!0,i=e}finally{try{if(!s&&null!=r.return&&(c=r.return(),Object(c)!==c))return}finally{if(l)throw i}}return o}}(a,c)||function(e,t){if(e){if("string"==typeof e)return v(e,t);var r={}.toString.call(e).slice(8,-1);return"Object"===r&&e.constructor&&(r=e.constructor.name),"Map"===r||"Set"===r?Array.from(e):"Arguments"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?v(e,t):void 0}}(a,c)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()),d=u[0],m=u[1],f=(0,b.useRef)(null),h=(0,b.useRef)(s.alt);(0,b.useEffect)((function(){var e;if("core/image"===o&&h.current!==s.alt)f.current&&clearTimeout(f.current),f.current=setTimeout((function(){var e=g({name:o,attributes:s,clientId:l});m(e)}),1500),h.current=s.alt;else{switch(o){case"core/button":e=k({name:o,attributes:s,clientId:l});break;case"core/image":e=g({name:o,attributes:s,clientId:l});break;case"core/table":e=y({name:o,attributes:s,clientId:l});break;default:e={isValid:!0,mode:"none",message:""}}m(e)}return function(){f.current&&clearTimeout(f.current)}}),[o,s,l]);var w="";return d.message?w=d.message:"error"===d.mode?w=(0,e.__)("Accessibility Error: This block does not meet accessibility standards.","block-accessibility-checks"):"warning"===d.mode&&(w=(0,e.__)("Accessibility Warning: This block may have accessibility issues.","block-accessibility-checks")),React.createElement(React.Fragment,null,"none"!==d.mode&&React.createElement("div",{className:"error"===d.mode?"a11y-block-error":"a11y-block-warning"},React.createElement(t,r)),"none"===d.mode&&React.createElement(t,r),"none"!==d.mode&&React.createElement(n.InspectorControls,null,React.createElement(i.PanelBody,{title:(0,e.__)("Accessibility Check","block-accessibility-checks"),initialOpen:!0},React.createElement(i.PanelRow,null,React.createElement("p",{className:"error"===d.mode?"a11y-error-msg":"a11y-warning-msg"},w)))))}}),"withErrorHandling");(0,t.addFilter)("editor.BlockEdit","block-accessibility-checks/with-error-handling",w);var p=[k,g,y];(0,c.registerPlugin)("block-validation",{render:function(){var e=d(),t=(0,o.useDispatch)("core/editor"),r=t.lockPostSaving,n=t.unlockPostSaving,i=t.lockPostAutosaving,a=t.unlockPostAutosaving,c=t.disablePublishSidebar,s=t.enablePublishSidebar;return(0,b.useEffect)((function(){e.some((function(e){return"error"===e.mode}))?(r(),i(),c()):(n(),a(),s())}),[e,c,s,i,r,a,n]),null}})})();