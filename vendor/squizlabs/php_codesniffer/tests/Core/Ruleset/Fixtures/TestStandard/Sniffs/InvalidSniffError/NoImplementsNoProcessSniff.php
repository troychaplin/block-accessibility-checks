<?php
/**
 * Test fixture.
 *
 * @see \PHP_CodeSniffer\Tests\Core\Ruleset\RegisterSniffsRejectsInvalidSniffTest
 */

namespace Fixtures\TestStandard\Sniffs.nvalidSniffError;

final class NoImplementsNoProcessSniff
{

    public function register()
    {
        return [T_OPEN_TAG];
    }
}
