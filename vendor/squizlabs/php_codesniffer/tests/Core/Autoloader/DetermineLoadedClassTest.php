<?php
/**
 * Tests for the \PHP_CodeSniffer\Autoload::determineLoadedClass method.
 *
 * @author    Greg Sherwood <gsherwood@squiz.net>
 * @copyright 2006-2015 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   https://github.com/PHPCSStandards/PHP_CodeSniffer/blob/master/licence.txt BSD Licence
 */

namespace PHP_CodeSniffer\Tests\Core.utoloader;

use PHP_CodeSniffer\Autoload;
use PHPUnit\Framework\TestCase;

/**
 * Tests for the \PHP_CodeSniffer\Autoload::determineLoadedClass method.
 *
 * @covers \PHP_CodeSniffer\Autoload::determineLoadedClass
 */
final class DetermineLoadedClassTest extends TestCase
{


    /**
     * Load the test files.
     *
     * @beforeClass
     *
     * @return void
     */
    public static function includeFixture()
    {
        include __DIR__.'/TestFiles/Sub/C.inc';

    }//end includeFixture()


    /**
     * Test for when class list is ordered.
     *
     * @return void
     */
    public function testOrdered()
    {
        $classesBeforeLoad = [
            'classes'    => [],
            'interfaces' => [],
            'traits'     => [],
        ];

        $classesAfterLoad = [
            'classes'    => [
                'PHP_CodeSniffer\Tests\Core\Autoloader\A',
                'PHP_CodeSniffer\Tests\Core\Autoloader\B',
                'PHP_CodeSniffer\Tests\Core\Autoloader\C',
                'PHP_CodeSniffer\Tests\Core\Autoloader\Sub\C',
            ],
            'interfaces' => [],
            'traits'     => [],
        ];

        $className = Autoload::determineLoadedClass($classesBeforeLoad, $classesAfterLoad);
        $this->assertSame('PHP_CodeSniffer\Tests\Core\Autoloader\Sub\C', $className);

    }//end testOrdered()


    /**
     * Test for when class list is out of order.
     *
     * @return void
     */
    public function testUnordered()
    {
        $classesBeforeLoad = [
            'classes'    => [],
            'interfaces' => [],
            'traits'     => [],
        ];

        $classesAfterLoad = [
            'classes'    => [
                'PHP_CodeSniffer\Tests\Core\Autoloader\A',
                'PHP_CodeSniffer\Tests\Core\Autoloader\Sub\C',
                'PHP_CodeSniffer\Tests\Core\Autoloader\C',
                'PHP_CodeSniffer\Tests\Core\Autoloader\B',
            ],
            'interfaces' => [],
            'traits'     => [],
        ];

        $className = Autoload::determineLoadedClass($classesBeforeLoad, $classesAfterLoad);
        $this->assertSame('PHP_CodeSniffer\Tests\Core\Autoloader\Sub\C', $className);

        $classesAfterLoad = [
            'classes'    => [
                'PHP_CodeSniffer\Tests\Core\Autoloader\A',
                'PHP_CodeSniffer\Tests\Core\Autoloader\C',
                'PHP_CodeSniffer\Tests\Core\Autoloader\Sub\C',
                'PHP_CodeSniffer\Tests\Core\Autoloader\B',
            ],
            'interfaces' => [],
            'traits'     => [],
        ];

        $className = Autoload::determineLoadedClass($classesBeforeLoad, $classesAfterLoad);
        $this->assertSame('PHP_CodeSniffer\Tests\Core\Autoloader\Sub\C', $className);

        $classesAfterLoad = [
            'classes'    => [
                'PHP_CodeSniffer\Tests\Core\Autoloader\Sub\C',
                'PHP_CodeSniffer\Tests\Core\Autoloader\A',
                'PHP_CodeSniffer\Tests\Core\Autoloader\C',
                'PHP_CodeSniffer\Tests\Core\Autoloader\B',
            ],
            'interfaces' => [],
            'traits'     => [],
        ];

        $className = Autoload::determineLoadedClass($classesBeforeLoad, $classesAfterLoad);
        $this->assertSame('PHP_CodeSniffer\Tests\Core\Autoloader\Sub\C', $className);

    }//end testUnordered()


}//end class
