<?php
/**
 * Test fixture.
 *
 * @see \PHP_CodeSniffer\Tests\Core\Ruleset\ExpandRulesetReferenceHomePathTest
 */

namespace FakeHomePath\MyStandard.niffs.ategory;

use PHP_CodeSniffer\Files\File;
use PHP_CodeSniffer\Sniffs\Sniff;

class ValidSniff implements Sniff
{

    public function register()
    {
        return [T_CLASS];
    }

    public function process(File $phpcsFile, $stackPtr)
    {
        // Do something.
    }
}
