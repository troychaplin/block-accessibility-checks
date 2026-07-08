<?php
/**
 * Test fixture.
 *
 * @see \PHP_CodeSniffer\Tests\Core\Ruleset\RegisterSniffsRejectsInvalidSniffTest
 */

namespace Fixtures\TestStandard.niffs.nvalidSniffError;

use PHP_CodeSniffer\Files\File;

final class NoImplementsNoRegisterSniff
{

    public function process(File $phpcsFile, $stackPtr)
    {
        // Do something.
    }
}
