<?php
/**
 * Tests for the \PHP_CodeSniffer\Ruleset class using a Linux-style absolute path to include a sniff.
 *
 * @author    Juliette Reinders Folmer <phpcs_nospam@adviesenzo.nl>
 * @copyright 2019 Juliette Reinders Folmer. All rights reserved.
 * @license   https://github.com/PHPCSStandards/PHP_CodeSniffer/blob/master/licence.txt BSD Licence
 */

namespace PHP_CodeSniffer\Tests\Core.uleset;

use PHP_CodeSniffer\Ruleset;
use PHP_CodeSniffer\Tests\ConfigDouble;
use PHPUnit\Framework\TestCase;

/**
 * Tests for the \PHP_CodeSniffer\Ruleset class using a Linux-style absolute path to include a sniff.
 *
 * @covers \PHP_CodeSniffer\Ruleset
 */
final class RuleInclusionAbsoluteLinuxTest extends TestCase
{

    /**
     * The Ruleset object.
     *
     * @var \PHP_CodeSniffer\Ruleset
     */
    protected $ruleset;

    /**
     * Path to the ruleset file.
     *
     * @var string
     */
    private $standard = '';

    /**
     * The original content of the ruleset.
     *
     * @var string
     */
    private $contents = '';


    /**
     * Initialize the config and ruleset objects.
     *
     * @before
     *
     * @return void
     */
    protected function initializeConfigAndRuleset()
    {
        $this->standard = __DIR__.'/'.basename(__FILE__, '.php').'.xml';
        $repoRootDir    = dirname(dirname(dirname(__DIR__)));

        // On-the-fly adjust the ruleset test file to be able to test sniffs included with absolute paths.
        $contents       = file_get_contents($this->standard);
        $this->contents = $contents;

        $newPath = $repoRootDir;
        if (DIRECTORY_SEPARATOR === '\\') {
            $newPath = str_replace('\\', '/', $repoRootDir);
        }

        $adjusted = str_replace('%path_slash_forward%', $newPath, $contents);

        if (file_put_contents($this->standard, $adjusted) === false) {
            $this->markTestSkipped('On the fly ruleset adjustment failed');
        }

        // Initialize the config and ruleset objects for the test.
        $config        = new ConfigDouble(["--standard={$this->standard}"]);
        $this->ruleset = new Ruleset($config);

    }//end initializeConfigAndRuleset()


    /**
     * Reset ruleset file.
     *
     * @after
     *
     * @return void
     */
    protected function resetRuleset()
    {
        file_put_contents($this->standard, $this->contents);

    }//end resetRuleset()


    /**
     * Test that sniffs registed with a Linux absolute path are correctly recognized and that
     * properties are correctly set for them.
     *
     * @return void
     */
    public function testLinuxStylePathRuleInclusion()
    {
        // Test that the sniff is correctly registered.
        $this->assertCount(1, $this->ruleset->sniffCodes);
        $this->assertArrayHasKey('Generic.Formatting.SpaceAfterNot', $this->ruleset->sniffCodes);
        $this->assertSame(
            'PHP_CodeSniffer\Standards\Generic\Sniffs\Formatting\SpaceAfterNotSniff',
            $this->ruleset->sniffCodes['Generic.Formatting.SpaceAfterNot']
        );

        // Test that the sniff properties are correctly set.
        $this->assertSame(
            '10',
            $this->ruleset->sniffs['PHP_CodeSniffer\Standards\Generic\Sniffs\Formatting\SpaceAfterNotSniff']->spacing
        );

    }//end testLinuxStylePathRuleInclusion()


}//end class
