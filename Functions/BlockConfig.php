<?php

namespace BlockAccessibility;

class BlockConfig
{
  /**
   * Holds the singleton instance of BlockConfig.
   *
   * @var BlockConfig|null
   */
  private static $instance = null;

  /**
   * Holds the block configuration array.
   *
   * @var array|null
   */
  private $blockConfig = null;

  /**
   * Private constructor to prevent multiple instances.
   */
  private function __construct()
  {
    // Initialize the block configuration once
    $this->blockConfig = [
      [
        'function_name' => 'renderCoreButtonOptions',
        'option_name'   => 'coreButtonBlockCheck',
        'block_label'   => esc_html__('Button', 'block-accessibility-checks'),
      ],
      [
        'function_name' => 'renderCoreHeadingOptions',
        'option_name'   => 'coreHeadingBlockCheck',
        'block_label'   => esc_html__('Heading', 'block-accessibility-checks'),
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

  /**
   * Retrieves the singleton instance of the BlockConfig class.
   *
   * @return BlockConfig The singleton instance.
   */
  public static function getInstance()
  {
    if (self::$instance === null) {
      self::$instance = new self();
    }

    return self::$instance;
  }

  /**
   * Retrieves the block configuration.
   *
   * This method returns the cached block configuration array.
   *
   * @return array The block configuration.
   */
  public function getBlockConfig()
  {
    return $this->blockConfig;
  }
}
