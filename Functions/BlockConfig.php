<?php

namespace BlockAccessibility;

class BlockConfig
{
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
