/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/scripts/blockChecks/checkButton.js":
/*!************************************************!*\
  !*** ./src/scripts/blockChecks/checkButton.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkButtonAttributes: () => (/* binding */ checkButtonAttributes)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* global BlockAccessibilityChecks */

var validationMode = BlockAccessibilityChecks.blockChecksOptions.coreButtonBlockCheck;

/**
 * Checks the heading level of a block.
 *
 * @param {Object} block - The block object to be checked.
 * @return {Object} - The response object containing the validation result.
 */
function checkButtonAttributes(block) {
  if (block.name === 'core/button' && !block.attributes.url && !block.attributes.text.originalHTML) {
    var response = {
      isValid: true,
      message: '',
      clientId: block.clientId,
      mode: validationMode
    };
    switch (validationMode) {
      case 'error':
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Error: Button error.', 'block-accessibility-checks');
        break;
      case 'warning':
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Warning: Button warning.', 'block-accessibility-checks');
        break;
      case 'none':
      default:
        response.isValid = true;
    }
    return response;
  }
  return {
    isValid: true,
    mode: 'none'
  };
}

/***/ }),

/***/ "./src/scripts/blockChecks/checkHeading.js":
/*!*************************************************!*\
  !*** ./src/scripts/blockChecks/checkHeading.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkHeadingLevel: () => (/* binding */ checkHeadingLevel)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* global BlockAccessibilityChecks */

var validationMode = BlockAccessibilityChecks.blockChecksOptions.coreHeadingBlockCheck;

/**
 * Checks the heading level of a block.
 *
 * @param {Object} block - The block object to be checked.
 * @return {Object} - The response object containing the validation result.
 */
function checkHeadingLevel(block) {
  if (block.name === 'core/heading' && block.attributes.level === 1) {
    var response = {
      isValid: true,
      message: '',
      clientId: block.clientId,
      mode: validationMode
    };
    switch (validationMode) {
      case 'error':
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Error: Level 1 headings are not allowed in your content area.', 'block-accessibility-checks');
        break;
      case 'warning':
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Warning: Level 1 headings are discouraged in your content area.', 'block-accessibility-checks');
        break;
      case 'none':
      default:
        response.isValid = true;
    }
    return response;
  }
  return {
    isValid: true,
    mode: 'none'
  };
}

/***/ }),

/***/ "./src/scripts/blockChecks/checkImage.js":
/*!***********************************************!*\
  !*** ./src/scripts/blockChecks/checkImage.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkImageAlt: () => (/* binding */ checkImageAlt)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* global BlockAccessibilityChecks */

var validationMode = BlockAccessibilityChecks.blockChecksOptions.coreImageBlockCheck;

/**
 * Checks if an image block has an alt attribute and is not decorative.
 *
 * @param {Object} block - The image block to be checked.
 * @return {Object} - The validation response object.
 */
function checkImageAlt(block) {
  if (block.name === 'core/image' && !block.attributes.alt && !block.attributes.isDecorative) {
    var response = {
      isValid: true,
      message: '',
      clientId: block.clientId,
      mode: validationMode
    };
    switch (validationMode) {
      case 'error':
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Error: Images are required to have alternative text.', 'block-accessibility-checks');
        break;
      case 'warning':
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Warning: Images without alternative text are discouraged in your content area.', 'block-accessibility-checks');
        break;
      case 'none':
      default:
        response.isValid = true;
    }
    return response;
  }
  return {
    isValid: true,
    mode: 'none'
  };
}

/***/ }),

/***/ "./src/scripts/blockChecks/checkTable.js":
/*!***********************************************!*\
  !*** ./src/scripts/blockChecks/checkTable.js ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkTableHeaderRow: () => (/* binding */ checkTableHeaderRow)
/* harmony export */ });
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* global BlockAccessibilityChecks */

var validationMode = BlockAccessibilityChecks.blockChecksOptions.coreTableBlockCheck;

/**
 * Checks if a table block has a header row.
 *
 * @param {Object} block - The table block to be checked.
 * @return {Object} - The validation response object.
 */
function checkTableHeaderRow(block) {
  if (block.name === 'core/table' && block.attributes.body.length !== 0 && block.attributes.head.length === 0) {
    var response = {
      isValid: true,
      message: '',
      clientId: block.clientId,
      mode: validationMode
    };
    switch (validationMode) {
      case 'error':
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Error: Tables are required to have a header row.', 'block-accessibility-checks');
        break;
      case 'warning':
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Warning: It is recommended that tables have a header row.', 'block-accessibility-checks');
        break;
      case 'none':
      default:
        response.isValid = true;
    }
    return response;
  }
  return {
    isValid: true,
    mode: 'none'
  };
}

/***/ }),

/***/ "./src/scripts/blockMods/imageAttr.js":
/*!********************************************!*\
  !*** ./src/scripts/blockMods/imageAttr.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);






/**
 * Adds an image attribute to the settings object.
 *
 * @param {Object} settings - The settings object.
 * @return {Object} - The modified settings object.
 */
var addImageAttribute = function addImageAttribute(settings) {
  if (settings.name !== 'core/image') {
    return settings;
  }
  settings.attributes = Object.assign(settings.attributes, {
    isDecorative: {
      type: 'boolean',
      "default": false
    }
  });
  return settings;
};
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.addFilter)('blocks.registerBlockType', 'block-accessibility-checks/add-image-attribute', addImageAttribute);

/**
 * Higher-order component that adds accessibility settings to the image block editor.
 *
 * @param {Function} BlockEdit - The original block editor component.
 * @return {Function} - The modified block editor component.
 */
var addImageInspectorControls = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_2__.createHigherOrderComponent)(function (BlockEdit) {
  return function (props) {
    if (props.name !== 'core/image') {
      return /*#__PURE__*/React.createElement(BlockEdit, props);
    }
    var attributes = props.attributes,
      setAttributes = props.setAttributes;
    var isDecorative = attributes.isDecorative;
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, null, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Settings', 'block-accessibility-checks'),
      initialOpen: true
    }, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Please confirm this image is decorative', 'block-accessibility-checks'),
      checked: isDecorative,
      onChange: function onChange(value) {
        return setAttributes({
          isDecorative: value
        });
      }
    }))), /*#__PURE__*/React.createElement(BlockEdit, props));
  };
}, 'addImageInspectorControls');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.addFilter)('editor.BlockEdit', 'block-accessibility-checks/add-inspector-control', addImageInspectorControls);

/***/ }),

/***/ "./src/scripts/helpers/blockErrorComponent.js":
/*!****************************************************!*\
  !*** ./src/scripts/helpers/blockErrorComponent.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/compose */ "@wordpress/compose");
/* harmony import */ var _wordpress_compose__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_compose__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _blockChecks_checkButton__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../blockChecks/checkButton */ "./src/scripts/blockChecks/checkButton.js");
/* harmony import */ var _blockChecks_checkHeading__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../blockChecks/checkHeading */ "./src/scripts/blockChecks/checkHeading.js");
/* harmony import */ var _blockChecks_checkImage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../blockChecks/checkImage */ "./src/scripts/blockChecks/checkImage.js");
/* harmony import */ var _blockChecks_checkTable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../blockChecks/checkTable */ "./src/scripts/blockChecks/checkTable.js");








/**
 * A higher-order component that adds error handling and accessibility checks to a block component.
 *
 * @param {Function} BlockEdit - The block component to wrap with error handling.
 * @return {Function} - The wrapped block component with error handling.
 */
var withErrorHandling = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_0__.createHigherOrderComponent)(function (BlockEdit) {
  return function (props) {
    var name = props.name,
      attributes = props.attributes,
      clientId = props.clientId;
    var validationResult = {
      isValid: true,
      mode: 'none',
      message: ''
    };
    switch (name) {
      case 'core/button':
        validationResult = (0,_blockChecks_checkButton__WEBPACK_IMPORTED_MODULE_3__.checkButtonAttributes)({
          name: name,
          attributes: attributes,
          clientId: clientId
        });
        break;
      case 'core/heading':
        validationResult = (0,_blockChecks_checkHeading__WEBPACK_IMPORTED_MODULE_4__.checkHeadingLevel)({
          name: name,
          attributes: attributes,
          clientId: clientId
        });
        break;
      case 'core/image':
        validationResult = (0,_blockChecks_checkImage__WEBPACK_IMPORTED_MODULE_5__.checkImageAlt)({
          name: name,
          attributes: attributes,
          clientId: clientId
        });
        break;
      case 'core/table':
        validationResult = (0,_blockChecks_checkTable__WEBPACK_IMPORTED_MODULE_6__.checkTableHeaderRow)({
          name: name,
          attributes: attributes,
          clientId: clientId
        });
        break;
      default:
        validationResult = {
          isValid: true,
          mode: 'none',
          message: ''
        };
    }

    // If validation mode is 'none' or the block is valid, return the block as is
    if (validationResult.mode === 'none' || validationResult.isValid) {
      return /*#__PURE__*/React.createElement(BlockEdit, props);
    }

    // Wrap the block with error/warning messages based on validation mode
    var wrapperClass = validationResult.mode === 'error' ? 'a11y-block-error' : 'a11y-block-warning';

    // Use the message from the validation result or fall back to a generic message
    var message = validationResult.message || (validationResult.mode === 'error' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Accessibility Error: This block does not meet accessibility standards.', 'block-accessibility-checks') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Accessibility Warning: This block may have accessibility issues.', 'block-accessibility-checks'));
    return /*#__PURE__*/React.createElement("div", {
      className: wrapperClass
    }, /*#__PURE__*/React.createElement("p", {
      className: validationResult.mode === 'error' ? 'a11y-error-msg' : 'a11y-warning-msg'
    }, message), /*#__PURE__*/React.createElement(BlockEdit, props));
  };
}, 'withErrorHandling');
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_1__.addFilter)('editor.BlockEdit', 'block-accessibility-checks/with-error-handling', withErrorHandling);

/***/ }),

/***/ "./src/scripts/helpers/blockInvalidation.js":
/*!**************************************************!*\
  !*** ./src/scripts/helpers/blockInvalidation.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BlockInvalidation: () => (/* binding */ BlockInvalidation)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _getInvalidBlocks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./getInvalidBlocks */ "./src/scripts/helpers/getInvalidBlocks.js");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_2__);




/**
 * Function that handles block invalidation.
 *
 * @return {null} Returns null.
 */
function BlockInvalidation() {
  var invalidBlocks = (0,_getInvalidBlocks__WEBPACK_IMPORTED_MODULE_1__.GetInvalidBlocks)();
  var _useDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useDispatch)('core/editor'),
    lockPostSaving = _useDispatch.lockPostSaving,
    unlockPostSaving = _useDispatch.unlockPostSaving,
    lockPostAutosaving = _useDispatch.lockPostAutosaving,
    unlockPostAutosaving = _useDispatch.unlockPostAutosaving,
    disablePublishSidebar = _useDispatch.disablePublishSidebar,
    enablePublishSidebar = _useDispatch.enablePublishSidebar;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_2__.useEffect)(function () {
    var hasErrors = invalidBlocks.some(function (block) {
      return block.mode === 'error';
    });
    if (hasErrors) {
      lockPostSaving();
      lockPostAutosaving();
      disablePublishSidebar();
    } else {
      unlockPostSaving();
      unlockPostAutosaving();
      enablePublishSidebar();
    }
  }, [invalidBlocks, disablePublishSidebar, enablePublishSidebar, lockPostAutosaving, lockPostSaving, unlockPostAutosaving, unlockPostSaving]);
  return null;
}

/***/ }),

/***/ "./src/scripts/helpers/getInvalidBlocks.js":
/*!*************************************************!*\
  !*** ./src/scripts/helpers/getInvalidBlocks.js ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GetInvalidBlocks: () => (/* binding */ GetInvalidBlocks)
/* harmony export */ });
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _registerPlugin__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../registerPlugin */ "./src/scripts/registerPlugin.js");



/**
 * Retrieves the invalid blocks from the block editor.
 *
 * @return {Array} An array of invalid blocks.
 */
function GetInvalidBlocks() {
  var allBlocks = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useSelect)(function (select) {
    return select('core/block-editor').getBlocks();
  }, []);
  return allBlocks.flatMap(function (block) {
    return _registerPlugin__WEBPACK_IMPORTED_MODULE_1__.blockChecksArray.map(function (check) {
      return check(block);
    });
  }).filter(function (result) {
    return !result.isValid;
  });
}

/***/ }),

/***/ "./src/scripts/registerPlugin.js":
/*!***************************************!*\
  !*** ./src/scripts/registerPlugin.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   blockChecksArray: () => (/* binding */ blockChecksArray)
/* harmony export */ });
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/plugins */ "@wordpress/plugins");
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers_blockInvalidation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers/blockInvalidation */ "./src/scripts/helpers/blockInvalidation.js");
/* harmony import */ var _helpers_blockErrorComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers/blockErrorComponent */ "./src/scripts/helpers/blockErrorComponent.js");
/* harmony import */ var _blockChecks_checkButton__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./blockChecks/checkButton */ "./src/scripts/blockChecks/checkButton.js");
/* harmony import */ var _blockChecks_checkHeading__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./blockChecks/checkHeading */ "./src/scripts/blockChecks/checkHeading.js");
/* harmony import */ var _blockChecks_checkImage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./blockChecks/checkImage */ "./src/scripts/blockChecks/checkImage.js");
/* harmony import */ var _blockChecks_checkTable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./blockChecks/checkTable */ "./src/scripts/blockChecks/checkTable.js");




// Import block check functions




var blockChecksArray = [_blockChecks_checkButton__WEBPACK_IMPORTED_MODULE_3__.checkButtonAttributes, _blockChecks_checkHeading__WEBPACK_IMPORTED_MODULE_4__.checkHeadingLevel, _blockChecks_checkImage__WEBPACK_IMPORTED_MODULE_5__.checkImageAlt, _blockChecks_checkTable__WEBPACK_IMPORTED_MODULE_6__.checkTableHeaderRow];
(0,_wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__.registerPlugin)('block-validation', {
  render: _helpers_blockInvalidation__WEBPACK_IMPORTED_MODULE_1__.BlockInvalidation
});

/***/ }),

/***/ "./src/styles.scss":
/*!*************************!*\
  !*** ./src/styles.scss ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
// extracted by mini-css-extract-plugin


/***/ }),

/***/ "@wordpress/block-editor":
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
/***/ ((module) => {

module.exports = window["wp"]["blockEditor"];

/***/ }),

/***/ "@wordpress/components":
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
/***/ ((module) => {

module.exports = window["wp"]["components"];

/***/ }),

/***/ "@wordpress/compose":
/*!*********************************!*\
  !*** external ["wp","compose"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["compose"];

/***/ }),

/***/ "@wordpress/data":
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["data"];

/***/ }),

/***/ "@wordpress/element":
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["element"];

/***/ }),

/***/ "@wordpress/hooks":
/*!*******************************!*\
  !*** external ["wp","hooks"] ***!
  \*******************************/
/***/ ((module) => {

module.exports = window["wp"]["hooks"];

/***/ }),

/***/ "@wordpress/i18n":
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
/***/ ((module) => {

module.exports = window["wp"]["i18n"];

/***/ }),

/***/ "@wordpress/plugins":
/*!*********************************!*\
  !*** external ["wp","plugins"] ***!
  \*********************************/
/***/ ((module) => {

module.exports = window["wp"]["plugins"];

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!***********************!*\
  !*** ./src/script.js ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _styles_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles.scss */ "./src/styles.scss");
/* harmony import */ var _scripts_blockMods_imageAttr__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scripts/blockMods/imageAttr */ "./src/scripts/blockMods/imageAttr.js");
/* harmony import */ var _scripts_registerPlugin__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scripts/registerPlugin */ "./src/scripts/registerPlugin.js");



/******/ })()
;
//# sourceMappingURL=block-checks.js.map