<?php

/**
 * Class BlockConfig
 *
 * This class represents the configuration for the block accessibility checks.
 *
 * @package BlockAccessibility
 */

namespace BlockAccessibility;

class BlockConfig
{
  /**
   * Retrieves the block configuration.
   *
   * This function returns an array of block configurations, each containing the function name, option name, and block label.
   *
   * @return array The block configuration.
   */
  public static function getBlockConfig()
  {
    return [
      [
        'function_name' => 'renderCoreHeadingOptions',
        'option_name'   => 'coreHeadingBlockCheck',
        'block_label'   => esc_html__('Heading', 'block-accessibility-checks'),
      ],
      [
        'function_name' => 'renderCoreButtonOptions',
        'option_name'   => 'coreButtonBlockCheck',
        'block_label'   => esc_html__('Button', 'block-accessibility-checks'),
      ],
      [
        'function_name' => 'renderCoreImageOptions',
        'option_name'   => 'coreImageBlockCheck',
        'block_label'   => esc_html__('Image', 'block-accessibility-checks'),
      ],
      [
        'function_name' => 'renderCoreTableOptions',
        'option_name'   => 'coreTableBlockCheck',
        'block_label'   => esc_html__('Table', 'block-accessibility-checks'),
      ],
    ];
  }
}
