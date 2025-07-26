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
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global BlockAccessibilityChecks */


// Get validation mode from plugin settings
var validationMode = BlockAccessibilityChecks.blockChecksOptions.core_button_block_check;

// Get validation rules from PHP registry
var validationRules = BlockAccessibilityChecks.validationRules || {};
var buttonRules = validationRules['core/button'] || {};

/**
 * Checks button attributes using PHP registry rules.
 *
 * @param {Object} block - The block object to be checked.
 * @return {Object} - The response object containing the validation result.
 */
function checkButtonAttributes(block) {
  // Only process button blocks
  if (block.name !== 'core/button') {
    return {
      isValid: true,
      mode: 'none'
    };
  }

  // Run all registered checks for the button block
  var failures = runButtonChecks(block, buttonRules);

  // Create response object based on validation result
  var response = {
    isValid: failures.length === 0,
    message: '',
    clientId: block.clientId,
    mode: failures.length === 0 ? 'none' : validationMode
  };

  // If validation fails, set appropriate error message using the highest priority failure
  if (failures.length > 0) {
    var highestPriorityFailure = failures.sort(function (a, b) {
      return a.priority - b.priority;
    })[0];
    response.message = formatValidationMessage(highestPriorityFailure.message, validationMode);
  }
  return response;
}

/**
 * Runs all enabled accessibility checks for a button block using PHP registry rules.
 *
 * @param {Object} block - The button block to validate.
 * @param {Object} rules - The validation rules from PHP registry.
 * @return {Array} - Array of validation failures.
 */
function runButtonChecks(block, rules) {
  var failures = [];

  // Check each registered rule
  Object.entries(rules).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      checkName = _ref2[0],
      config = _ref2[1];
    if (!config.enabled) {
      return;
    }
    var checkFailed = false;

    // Run the appropriate check based on the check name
    switch (checkName) {
      case 'button_required_content':
        checkFailed = checkButtonRequiredContent(block.attributes);
        break;
      case 'button_text_quality':
        checkFailed = checkButtonTextQuality(block.attributes);
        break;
      default:
        // Unknown check, skip
        break;
    }
    if (checkFailed) {
      failures.push({
        checkName: checkName,
        message: config.message,
        type: config.type,
        priority: config.priority
      });
    }
  });
  return failures;
}

/**
 * Check if button has required content (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkButtonRequiredContent(attributes) {
  // Check if button has text
  var hasText = attributes.text && (attributes.text.originalHTML || typeof attributes.text === 'string' && attributes.text.trim() !== '');

  // Check if button has URL
  var hasUrl = attributes.url && attributes.url.trim() !== '';

  // Button must have both text and URL
  return !hasText || !hasUrl;
}

/**
 * Check button text quality (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkButtonTextQuality(attributes) {
  if (!attributes.text) {
    return false;
  }

  // Extract text content, handling both string and object types
  var textContent = '';
  if (typeof attributes.text === 'string') {
    textContent = attributes.text;
  } else if (attributes.text.originalHTML) {
    textContent = attributes.text.originalHTML;
  }

  // Strip HTML tags and trim
  var text = textContent.replace(/<[^>]*>/g, '').trim();

  // Check for generic button text
  var genericTexts = ['click here', 'read more', 'learn more', 'more', 'here', 'link'];
  return genericTexts.includes(text.toLowerCase()) || text.length < 3;
}

/**
 * Formats validation message with appropriate prefix based on validation mode.
 *
 * @param {string} baseMessage - The base message from PHP registry.
 * @param {string} mode        - The validation mode (error, warning, none).
 * @return {string} - The formatted validation message.
 */
function formatValidationMessage(baseMessage, mode) {
  switch (mode) {
    case 'error':
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error:', 'block-accessibility-checks') + ' ' + baseMessage;
    case 'warning':
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Warning:', 'block-accessibility-checks') + ' ' + baseMessage;
    case 'none':
    default:
      return baseMessage;
  }
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
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global BlockAccessibilityChecks */


// Get validation mode from plugin settings
var validationMode = BlockAccessibilityChecks.blockChecksOptions.core_image_block_check;

// Get validation rules from PHP registry
var validationRules = BlockAccessibilityChecks.validationRules || {};
var imageRules = validationRules['core/image'] || {};

/**
 * Checks if an image block meets accessibility requirements using PHP registry rules.
 *
 * @param {Object} block - The image block to be checked.
 * @return {Object} - The validation response object.
 */
function checkImageAlt(block) {
  // Only process image blocks
  if (block.name !== 'core/image') {
    return {
      isValid: true,
      mode: 'none'
    };
  }

  // Run all registered checks for the image block
  var failures = runImageChecks(block, imageRules);

  // Create response object based on validation result
  var response = {
    isValid: failures.length === 0,
    message: '',
    clientId: block.clientId,
    mode: failures.length === 0 ? 'none' : validationMode
  };

  // If validation fails, set appropriate error message using the highest priority failure
  if (failures.length > 0) {
    var highestPriorityFailure = failures.sort(function (a, b) {
      return a.priority - b.priority;
    })[0];
    response.message = formatValidationMessage(highestPriorityFailure.message, validationMode);
  }
  return response;
}

/**
 * Runs all enabled accessibility checks for an image block using PHP registry rules.
 *
 * @param {Object} block - The image block to validate.
 * @param {Object} rules - The validation rules from PHP registry.
 * @return {Array} - Array of validation failures.
 */
function runImageChecks(block, rules) {
  var failures = [];

  // Check each registered rule
  Object.entries(rules).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      checkName = _ref2[0],
      config = _ref2[1];
    if (!config.enabled) {
      return;
    }
    var checkFailed = false;

    // Run the appropriate check based on the check name
    switch (checkName) {
      case 'alt_text_required':
        checkFailed = checkAltTextRequired(block.attributes);
        break;
      case 'alt_text_length':
        checkFailed = checkAltTextLength(block.attributes);
        break;
      case 'alt_caption_match':
        checkFailed = checkAltCaptionMatch(block.attributes);
        break;
      default:
        // Unknown check, skip
        break;
    }
    if (checkFailed) {
      failures.push({
        checkName: checkName,
        message: config.message,
        type: config.type,
        priority: config.priority
      });
    }
  });
  return failures;
}

/**
 * Check if image has required alt text (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkAltTextRequired(attributes) {
  // Check if image is marked as decorative
  var isDecorative = attributes.isDecorative === true;

  // If marked as decorative, alt text is not required
  if (isDecorative) {
    return false;
  }

  // Check if alt text exists and is not empty
  var hasAltText = attributes.alt && attributes.alt.trim() !== '';

  // Return true if check fails (no alt text when required)
  return !hasAltText;
}

/**
 * Check alt text length (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkAltTextLength(attributes) {
  if (!attributes.alt || attributes.alt.trim() === '') {
    return false;
  }
  return attributes.alt.length > 125;
}

/**
 * Check if alt text matches caption (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkAltCaptionMatch(attributes) {
  if (!attributes.alt || !attributes.caption) {
    return false;
  }
  var altText = attributes.alt.trim();
  var caption = attributes.caption.trim().replace(/<[^>]*>/g, ''); // Strip HTML tags

  return altText !== '' && caption !== '' && altText === caption;
}

/**
 * Formats validation message with appropriate prefix based on validation mode.
 *
 * @param {string} baseMessage - The base message from PHP registry.
 * @param {string} mode        - The validation mode (error, warning, none).
 * @return {string} - The formatted validation message.
 */
function formatValidationMessage(baseMessage, mode) {
  switch (mode) {
    case 'error':
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error:', 'block-accessibility-checks') + ' ' + baseMessage;
    case 'warning':
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Warning:', 'block-accessibility-checks') + ' ' + baseMessage;
    case 'none':
    default:
      return baseMessage;
  }
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
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/* global BlockAccessibilityChecks */


// Get validation mode from plugin settings
var validationMode = BlockAccessibilityChecks.blockChecksOptions.core_table_block_check;

// Get validation rules from PHP registry
var validationRules = BlockAccessibilityChecks.validationRules || {};
var tableRules = validationRules['core/table'] || {};

/**
 * Checks if a table block has proper accessibility features using PHP registry rules.
 *
 * @param {Object} block - The table block to be checked.
 * @return {Object} - The validation response object.
 */
function checkTableHeaderRow(block) {
  // Only process table blocks
  if (block.name !== 'core/table') {
    return {
      isValid: true,
      mode: 'none'
    };
  }

  // Run all registered checks for the table block
  var failures = runTableChecks(block, tableRules);

  // Create response object based on validation result
  var response = {
    isValid: failures.length === 0,
    message: '',
    clientId: block.clientId,
    mode: failures.length === 0 ? 'none' : validationMode
  };

  // If validation fails, set appropriate error message using the highest priority failure
  if (failures.length > 0) {
    var highestPriorityFailure = failures.sort(function (a, b) {
      return a.priority - b.priority;
    })[0];
    response.message = formatValidationMessage(highestPriorityFailure.message, validationMode);
  }
  return response;
}

/**
 * Runs all enabled accessibility checks for a table block using PHP registry rules.
 *
 * @param {Object} block - The table block to validate.
 * @param {Object} rules - The validation rules from PHP registry.
 * @return {Array} - Array of validation failures.
 */
function runTableChecks(block, rules) {
  var failures = [];

  // Check each registered rule
  Object.entries(rules).forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      checkName = _ref2[0],
      config = _ref2[1];
    if (!config.enabled) {
      return;
    }
    var checkFailed = false;

    // Run the appropriate check based on the check name
    switch (checkName) {
      case 'table_headers':
        checkFailed = checkTableHeaders(block.attributes);
        break;
      default:
        // Unknown check, skip
        break;
    }
    if (checkFailed) {
      failures.push({
        checkName: checkName,
        message: config.message,
        type: config.type,
        priority: config.priority
      });
    }
  });
  return failures;
}

/**
 * Check table headers (mirrors PHP logic).
 *
 * @param {Object} attributes - Block attributes.
 * @return {boolean} - True if check fails.
 */
function checkTableHeaders(attributes) {
  // Check if table has data in body
  var hasBody = attributes.body && attributes.body.length > 0;
  if (!hasBody) {
    return false; // Empty table doesn't need headers
  }

  // Check if table has header section defined
  var hasHeader = attributes.head && attributes.head.length > 0;

  // Check if table has caption
  var hasCaption = attributes.caption && attributes.caption.trim() !== '';

  // Table should have either headers or caption for accessibility
  return !(hasHeader || hasCaption);
}

/**
 * Formats validation message with appropriate prefix based on validation mode.
 *
 * @param {string} baseMessage - The base message from PHP registry.
 * @param {string} mode        - The validation mode (error, warning, none).
 * @return {string} - The formatted validation message.
 */
function formatValidationMessage(baseMessage, mode) {
  switch (mode) {
    case 'error':
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Error:', 'block-accessibility-checks') + ' ' + baseMessage;
    case 'warning':
      return (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_0__.__)('Warning:', 'block-accessibility-checks') + ' ' + baseMessage;
    case 'none':
    default:
      return baseMessage;
  }
}

/***/ }),

/***/ "./src/scripts/blockChecks/coreBlockValidation.js":
/*!********************************************************!*\
  !*** ./src/scripts/blockChecks/coreBlockValidation.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__);
/**
 * Core block validation logic
 *
 * This file contains all the validation logic for WordPress core blocks.
 * It integrates with the unified validation hooks system.
 */



/**
 * Register core block validation logic
 */
(0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_0__.addFilter)('ba11yc.validateBlock', 'ba11yc/core-blocks', function (isValid, blockType, attributes, checkName) {
  // Only handle core blocks
  if (!blockType.startsWith('core/')) {
    return isValid;
  }
  switch (blockType) {
    case 'core/image':
      return validateImageBlock(attributes, checkName);
    case 'core/button':
      return validateButtonBlock(attributes, checkName);
    case 'core/table':
      return validateTableBlock(attributes, checkName);
  }
  return isValid;
});

/**
 * Validate image block checks
 *
 * @param {Object} attributes - The block attributes.
 * @param {string} checkName  - The name of the check to perform.
 */
function validateImageBlock(attributes, checkName) {
  switch (checkName) {
    case 'alt_text_required':
      // Check if image is marked as decorative
      if (attributes.isDecorative) {
        return true; // Pass - decorative images don't need alt text
      }
      // Check if alt text exists and is not empty
      return !!(attributes.alt && attributes.alt.trim());
    case 'alt_text_length':
      // Only check if alt text exists
      if (!attributes.alt) {
        return true; // Pass - no alt text to check length
      }
      return attributes.alt.length <= 125;
    case 'alt_caption_match':
      // Only check if both alt and caption exist
      if (!attributes.alt || !attributes.caption) {
        return true; // Pass - can't match if one is missing
      }
      var alt = attributes.alt.trim().toLowerCase();
      var caption = attributes.caption.trim().toLowerCase();
      return alt !== caption;
  }
  return true;
}

/**
 * Validate button block checks
 * @param {Object} attributes - The block attributes.
 * @param {string} checkName  - The name of the check to perform.
 */
function validateButtonBlock(attributes, checkName) {
  switch (checkName) {
    case 'button_required_content':
      // Check if button has both text and URL
      var hasText = !!(attributes.text && attributes.text.trim());
      var hasUrl = !!(attributes.url && attributes.url.trim());
      return hasText && hasUrl;
    case 'button_text_quality':
      // Check for poor quality button text
      if (!attributes.text) {
        return true; // Pass - no text to check quality
      }
      var text = attributes.text.trim().toLowerCase();
      var poorQualityTexts = ['click here', 'read more', 'more', 'link', 'here', 'this', 'continue', 'go'];
      return !poorQualityTexts.includes(text);
  }
  return true;
}

/**
 * Validate table block checks
 * @param {Object} attributes - The block attributes.
 * @param {string} checkName  - The name of the check to perform.
 */
function validateTableBlock(attributes, checkName) {
  switch (checkName) {
    case 'table_headers':
      // Check if table has header row
      if (!attributes.body || !Array.isArray(attributes.body) || attributes.body.length === 0) {
        return true; // Pass - empty table
      }

      // Check if any cell in first row has header styling
      var firstRow = attributes.body[0];
      if (!firstRow || !Array.isArray(firstRow.cells)) {
        return true; // Pass - malformed table
      }

      // Look for header cells or check if head section exists
      var hasHeaderSection = !!(attributes.head && Array.isArray(attributes.head) && attributes.head.length > 0);
      var hasHeaderCells = firstRow.cells.some(function (cell) {
        return cell.tag === 'th';
      });
      return hasHeaderSection || hasHeaderCells;
  }
  return true;
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
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _validationHooks__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./validationHooks */ "./src/scripts/helpers/validationHooks.js");
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }








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
    var _useState = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useState)({
        isValid: true,
        mode: 'none',
        issues: []
      }),
      _useState2 = _slicedToArray(_useState, 2),
      validationResult = _useState2[0],
      setValidationResult = _useState2[1];
    var timeoutRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useRef)(null);
    var prevAltRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useRef)(attributes.alt);
    (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_5__.useEffect)(function () {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // For image blocks with alt text changes, add a delay
      if (name === 'core/image' && prevAltRef.current !== attributes.alt) {
        timeoutRef.current = setTimeout(function () {
          // Use unified validation system
          var result = (0,_validationHooks__WEBPACK_IMPORTED_MODULE_6__.validateBlock)({
            name: name,
            attributes: attributes,
            clientId: clientId
          });
          setValidationResult(result.isValid ? {
            isValid: true,
            mode: 'none',
            message: ''
          } : result);
        }, 1500);
        prevAltRef.current = attributes.alt;
      } else {
        // Immediate validation for other cases using unified system
        var result = (0,_validationHooks__WEBPACK_IMPORTED_MODULE_6__.validateBlock)({
          name: name,
          attributes: attributes,
          clientId: clientId
        });
        setValidationResult(result.isValid ? {
          isValid: true,
          mode: 'none',
          issues: []
        } : result);
      }
      return function () {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [name, attributes, clientId]);

    // Generate messages for all issues
    var issues = validationResult.issues || [];
    return /*#__PURE__*/React.createElement(React.Fragment, null, validationResult.mode !== 'none' && /*#__PURE__*/React.createElement(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_3__.InspectorControls, null, /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, {
      title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Accessibility Check', 'block-accessibility-checks'),
      initialOpen: true
    }, issues.map(function (issue, index) {
      return /*#__PURE__*/React.createElement(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelRow, {
        key: "".concat(issue.checkName, "-").concat(index)
      }, /*#__PURE__*/React.createElement("p", {
        className: issue.type === 'error' ? 'a11y-error-msg' : 'a11y-warning-msg'
      }, /*#__PURE__*/React.createElement("strong", null, issue.type === 'error' ? (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Error', 'block-accessibility-checks') : (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_2__.__)('Warning', 'block-accessibility-checks'), ":"), ' ', issue.type === 'error' ? issue.error_msg : issue.warning_msg || issue.error_msg));
    }))), validationResult.mode !== 'none' && /*#__PURE__*/React.createElement("div", {
      className: validationResult.mode === 'error' ? 'a11y-block-error' : 'a11y-block-warning'
    }, /*#__PURE__*/React.createElement(BlockEdit, props)), validationResult.mode === 'none' && /*#__PURE__*/React.createElement(BlockEdit, props));
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
/* harmony import */ var _validationHooks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./validationHooks */ "./src/scripts/helpers/validationHooks.js");
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }



/**
 * Recursively retrieves invalid blocks from a list of blocks.
 *
 * @param {Array} blocks - Array of blocks to check.
 * @return {Array} An array of invalid blocks.
 */
function getInvalidBlocksRecursive(blocks) {
  // Recursive function to check each block and its inner blocks
  return blocks.flatMap(function (block) {
    // Use unified validation system
    var result = (0,_validationHooks__WEBPACK_IMPORTED_MODULE_1__.validateBlock)(block);
    var results = [];
    if (!result.isValid) {
      results.push(result);
    }

    // If the block has inner blocks, recursively check them
    if (block.innerBlocks && block.innerBlocks.length > 0) {
      return [].concat(results, _toConsumableArray(getInvalidBlocksRecursive(block.innerBlocks)));
    }
    return results;
  });
}

/**
 * Retrieves the invalid blocks from the block editor.
 *
 * @return {Array} An array of invalid blocks.
 */
function GetInvalidBlocks() {
  // Hook to get all blocks once, at the top level
  var allBlocks = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_0__.useSelect)(function (select) {
    return select('core/block-editor').getBlocks();
  }, []);

  // Now, use the recursive function to check all blocks and their inner blocks
  var invalidBlocks = getInvalidBlocksRecursive(allBlocks);

  // Filter out valid blocks and return only invalid ones
  return invalidBlocks.filter(function (result) {
    return !result.isValid;
  });
}

/***/ }),

/***/ "./src/scripts/helpers/validationHooks.js":
/*!************************************************!*\
  !*** ./src/scripts/helpers/validationHooks.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   validateBlock: () => (/* binding */ validateBlock)
/* harmony export */ });
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
/**
 * Validation Hooks System
 *
 * Provides a unified JavaScript-only validation system that integrates
 * with the WordPress block editor.
 */

// Get block check configuration from PHP
var blockAccessibilityChecks = window.BlockAccessibilityChecks || {};
var blockChecksConfig = blockAccessibilityChecks.validationRules || {};

/**
 * Universal block validation function
 *
 * This function runs all registered validation checks for any block type.
 * External plugins can hook into this via wp.hooks.addFilter().
 *
 * @param {Object} block - The block object to validate
 * @return {Object} Validation result with all issues
 */
function validateBlock(block) {
  // Only validate blocks that have registered checks
  if (!blockChecksConfig[block.name]) {
    return {
      isValid: true,
      issues: []
    };
  }
  var attributes = block.attributes;
  var blockRules = blockChecksConfig[block.name];
  var issues = [];

  // Check each registered rule
  for (var _i = 0, _Object$entries = Object.entries(blockRules); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      checkName = _Object$entries$_i[0],
      rule = _Object$entries$_i[1];
    // Skip disabled checks
    if (!rule.enabled) {
      continue;
    }

    // Use the new JavaScript-only validation system
    var isValid = wp.hooks.applyFilters('ba11yc.validateBlock', true,
    // Default: validation passes
    block.name, attributes, checkName, rule);

    // If check fails, add to issues array
    if (!isValid) {
      var priority = 3; // Default priority
      if (rule.type === 'error') {
        priority = 1;
      } else if (rule.type === 'warning') {
        priority = 2;
      }
      issues.push({
        checkName: checkName,
        type: rule.type,
        error_msg: rule.error_msg || rule.message || '',
        warning_msg: rule.warning_msg || rule.error_msg || rule.message || '',
        priority: priority
      });
    }
  }

  // Sort issues by priority (errors first, then warnings, then others)
  issues.sort(function (a, b) {
    return a.priority - b.priority;
  });

  // Determine overall validation status and primary mode
  var hasErrors = issues.some(function (issue) {
    return issue.type === 'error';
  });
  var hasWarnings = issues.some(function (issue) {
    return issue.type === 'warning';
  });
  var primaryMode = 'none';
  if (hasErrors) {
    primaryMode = 'error';
  } else if (hasWarnings) {
    primaryMode = 'warning';
  }
  return {
    isValid: issues.length === 0,
    issues: issues,
    mode: primaryMode,
    clientId: block.clientId,
    name: block.name
  };
}

/***/ }),

/***/ "./src/scripts/registerPlugin.js":
/*!***************************************!*\
  !*** ./src/scripts/registerPlugin.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   blockChecksArray: () => (/* binding */ blockChecksArray),
/* harmony export */   getBlockChecksArray: () => (/* binding */ getBlockChecksArray)
/* harmony export */ });
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/plugins */ "@wordpress/plugins");
/* harmony import */ var _wordpress_plugins__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_plugins__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _helpers_blockInvalidation__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./helpers/blockInvalidation */ "./src/scripts/helpers/blockInvalidation.js");
/* harmony import */ var _helpers_blockErrorComponent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./helpers/blockErrorComponent */ "./src/scripts/helpers/blockErrorComponent.js");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/hooks */ "@wordpress/hooks");
/* harmony import */ var _wordpress_hooks__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _blockChecks_checkButton__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./blockChecks/checkButton */ "./src/scripts/blockChecks/checkButton.js");
/* harmony import */ var _blockChecks_checkImage__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./blockChecks/checkImage */ "./src/scripts/blockChecks/checkImage.js");
/* harmony import */ var _blockChecks_checkTable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./blockChecks/checkTable */ "./src/scripts/blockChecks/checkTable.js");





// Import block check functions




// Base checks array with core checks
var coreChecks = [_blockChecks_checkButton__WEBPACK_IMPORTED_MODULE_4__.checkButtonAttributes, _blockChecks_checkImage__WEBPACK_IMPORTED_MODULE_5__.checkImageAlt, _blockChecks_checkTable__WEBPACK_IMPORTED_MODULE_6__.checkTableHeaderRow];

// Cache for the filtered checks array to prevent repeated filter applications
var cachedChecksArray = null;
var cacheInvalidated = true;

// Function to invalidate the cache when new filters are added
function invalidateCache() {
  cacheInvalidated = true;
}

// Listen for when new filters are added
if (typeof wp !== 'undefined' && wp.hooks) {
  wp.hooks.addAction('hookAdded', 'blockAccessibilityChecks/invalidate-cache', function (hookName) {
    if (hookName === 'blockAccessibilityChecks.blockChecksArray') {
      invalidateCache();
    }
  });
}

// Function to get current checks array (allows dynamic updates from external plugins)
function getBlockChecksArray() {
  if (cacheInvalidated || !cachedChecksArray) {
    cachedChecksArray = (0,_wordpress_hooks__WEBPACK_IMPORTED_MODULE_3__.applyFilters)('blockAccessibilityChecks.blockChecksArray', coreChecks);
    cacheInvalidated = false;
  }
  return cachedChecksArray;
}

// For backwards compatibility, expose the array but make it dynamic
var blockChecksArray = new Proxy([], {
  get: function get(target, prop) {
    var currentArray = getBlockChecksArray();
    if (prop === 'length') {
      return currentArray.length;
    }
    if (typeof prop === 'string' && !isNaN(prop)) {
      return currentArray[parseInt(prop)];
    }
    if (typeof currentArray[prop] === 'function') {
      return currentArray[prop].bind(currentArray);
    }
    return currentArray[prop];
  }
});
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
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!***********************!*\
  !*** ./src/script.js ***!
  \***********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _styles_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./styles.scss */ "./src/styles.scss");
/* harmony import */ var _scripts_blockMods_imageAttr__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./scripts/blockMods/imageAttr */ "./src/scripts/blockMods/imageAttr.js");
/* harmony import */ var _scripts_registerPlugin__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./scripts/registerPlugin */ "./src/scripts/registerPlugin.js");
/* harmony import */ var _scripts_helpers_validationHooks__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./scripts/helpers/validationHooks */ "./src/scripts/helpers/validationHooks.js");
/* harmony import */ var _scripts_blockChecks_coreBlockValidation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./scripts/blockChecks/coreBlockValidation */ "./src/scripts/blockChecks/coreBlockValidation.js");





})();

/******/ })()
;
//# sourceMappingURL=block-checks.js.map