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
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }

function checkButtonAttributes(block) {
  var _checkButton = function checkButton(innerBlocks, parentClientId) {
    var _iterator = _createForOfIteratorHelper(innerBlocks),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var innerBlock = _step.value;
        if (innerBlock.name === 'core/button') {
          var _innerBlock$attribute = innerBlock.attributes,
            text = _innerBlock$attribute.text,
            url = _innerBlock$attribute.url;
          if (text === '' || url === undefined) {
            return {
              isValid: false,
              message: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Error: Each button must have both text and URL.', 'block-accessibility-checks'),
              clientId: parentClientId
            };
          }
        }
        // Recursively check nested inner blocks
        if (innerBlock.innerBlocks.length > 0) {
          var result = _checkButton(innerBlock.innerBlocks, parentClientId);
          if (!result.isValid) {
            return result;
          }
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return {
      isValid: true
    };
  };
  return _checkButton(block.innerBlocks, block.clientId);
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
/* harmony import */ var _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/validationModes */ "./src/scripts/helpers/validationModes.js");

 // Adjust the path accordingly
var validationMode = _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.WARNING;
function checkHeadingLevel(block) {
  if (block.name === 'core/heading' && block.attributes.level === 1) {
    var response = {
      isValid: true,
      message: '',
      clientId: block.clientId,
      mode: validationMode // Use the default mode here
    };
    switch (validationMode) {
      case _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.WARNING:
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Warning: Level 1 headings are discouraged in your content area.', 'block-accessibility-checks');
        break;
      case _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.ERROR:
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Error: Level 1 headings are not allowed in your content area.', 'block-accessibility-checks');
        break;
      case _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.NONE:
      default:
        response.isValid = true;
    }
    return response;
  }
  return {
    isValid: true,
    mode: _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.NONE
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
/* harmony import */ var _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../helpers/validationModes */ "./src/scripts/helpers/validationModes.js");

 // Adjust the path accordingly
var validationMode = _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.ERROR;
function checkImageAlt(block) {
  if (block.name === 'core/image' && !block.attributes.alt && !block.attributes.isDecorative) {
    var response = {
      isValid: true,
      message: '',
      clientId: block.clientId,
      mode: validationMode
    };
    switch (validationMode) {
      case _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.WARNING:
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Warning: Images without alternative text are discouraged in your content area.', 'block-accessibility-checks');
        break;
      case _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.ERROR:
        response.isValid = false;
        response.message = (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Error: Images are required to have alternative text.', 'block-accessibility-checks');
        break;
      case _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.NONE:
      default:
        response.isValid = true;
    }
    return response;
  }
  return {
    isValid: true,
    mode: _helpers_validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.NONE
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

function checkTableHeaderRow(block) {
  if (block.name === 'core/table' && block.attributes.body.length !== 0 && block.attributes.head.length === 0) {
    return {
      isValid: false,
      message: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Accessibility Error: Tables are required to have a header row.', 'block-accessibility-checks'),
      clientId: block.clientId
    };
  }
  return {
    isValid: true
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






// Add image attribute to confirm decorative to bypass a11y block
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

// Create a new block control for the attribute
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
/* harmony import */ var _validationModes__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./validationModes */ "./src/scripts/helpers/validationModes.js");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _blockChecks_checkHeading__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../blockChecks/checkHeading */ "./src/scripts/blockChecks/checkHeading.js");
/* harmony import */ var _blockChecks_checkImage__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../blockChecks/checkImage */ "./src/scripts/blockChecks/checkImage.js");

 // Ensure correct path


// Import your specific block check functions


var withErrorHandling = (0,_wordpress_compose__WEBPACK_IMPORTED_MODULE_0__.createHigherOrderComponent)(function (BlockEdit) {
  return function (props) {
    var name = props.name,
      attributes = props.attributes,
      clientId = props.clientId;
    var validationResult = {
      isValid: true,
      mode: _validationModes__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_VALIDATION_MODE,
      message: ''
    };

    // Apply validation using the appropriate check function
    switch (name) {
      case 'core/heading':
        validationResult = (0,_blockChecks_checkHeading__WEBPACK_IMPORTED_MODULE_3__.checkHeadingLevel)({
          name: name,
          attributes: attributes,
          clientId: clientId
        });
        break;
      case 'core/image':
        validationResult = (0,_blockChecks_checkImage__WEBPACK_IMPORTED_MODULE_4__.checkImageAlt)({
          name: name,
          attributes: attributes,
          clientId: clientId
        });
        break;
      // Add more cases for other blocks as needed
      default:
        validationResult = {
          isValid: true,
          mode: _validationModes__WEBPACK_IMPORTED_MODULE_1__.DEFAULT_VALIDATION_MODE,
          message: ''
        };
    }

    // If validation mode is NONE or the block is valid, return the block as is
    if (validationResult.mode === _validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.NONE || validationResult.isValid) {
      return /*#__PURE__*/React.createElement(BlockEdit, props);
    }

    // Wrap the block with error/warning messages based on validation mode
    var wrapperClass = validationResult.mode === _validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.ERROR ? 'a11y-block-error' : 'a11y-block-warning';

    // Use the message from the validation result or fall back to a generic message
    var message = validationResult.message || (validationResult.mode === _validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.ERROR ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Accessibility Error: This block does not meet accessibility standards.', 'block-accessibility-checks') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Accessibility Warning: This block may have accessibility issues.', 'block-accessibility-checks'));
    return /*#__PURE__*/React.createElement("div", {
      className: wrapperClass
    }, /*#__PURE__*/React.createElement("p", {
      className: validationResult.mode === _validationModes__WEBPACK_IMPORTED_MODULE_1__.VALIDATION_MODES.ERROR ? 'a11y-error-msg' : 'a11y-warning-msg'
    }, message), /*#__PURE__*/React.createElement(BlockEdit, props));
  };
}, 'withErrorHandling');
wp.hooks.addFilter('editor.BlockEdit', 'block-accessibility-checks/with-error-handling', withErrorHandling);

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
/* harmony import */ var _validationModes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validationModes */ "./src/scripts/helpers/validationModes.js");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _getInvalidBlocks__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./getInvalidBlocks */ "./src/scripts/helpers/getInvalidBlocks.js");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_3__);
 // Adjust the path according to your file structure

/* global blockAccessibilitySettings */

 // Assuming this is the function that retrieves invalid blocks

function BlockInvalidation() {
  var invalidBlocks = (0,_getInvalidBlocks__WEBPACK_IMPORTED_MODULE_2__.GetInvalidBlocks)();
  var _useDispatch = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)('core/editor'),
    lockPostSaving = _useDispatch.lockPostSaving,
    unlockPostSaving = _useDispatch.unlockPostSaving,
    lockPostAutosaving = _useDispatch.lockPostAutosaving,
    unlockPostAutosaving = _useDispatch.unlockPostAutosaving,
    disablePublishSidebar = _useDispatch.disablePublishSidebar,
    enablePublishSidebar = _useDispatch.enablePublishSidebar;
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_3__.useEffect)(function () {
    // Check if any block has an ERROR validation mode
    var hasErrors = invalidBlocks.some(function (block) {
      return block.mode === _validationModes__WEBPACK_IMPORTED_MODULE_0__.VALIDATION_MODES.ERROR;
    });
    if (hasErrors && blockAccessibilitySettings.mode === 'DENY') {
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

/***/ "./src/scripts/helpers/validationModes.js":
/*!************************************************!*\
  !*** ./src/scripts/helpers/validationModes.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_VALIDATION_MODE: () => (/* binding */ DEFAULT_VALIDATION_MODE),
/* harmony export */   VALIDATION_MODES: () => (/* binding */ VALIDATION_MODES)
/* harmony export */ });
var VALIDATION_MODES = {
  NONE: 'none',
  WARNING: 'warning',
  ERROR: 'error'
};
var DEFAULT_VALIDATION_MODE = VALIDATION_MODES.ERROR;

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


// Block Modifications


// Block Checks


// Access the localized block checks options
// document.addEventListener('DOMContentLoaded', function () {
// 	if (typeof BlockAccessibilityChecks !== 'undefined') {
// 		console.log(
// 			'Block Checks Options:',
// 			BlockAccessibilityChecks.blockChecksOptions
// 		);
// 	} else {
// 		console.error('BlockAccessibilityChecks is not defined.');
// 	}
// });
/******/ })()
;
//# sourceMappingURL=block-checks.js.map