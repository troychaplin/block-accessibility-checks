<?php
/**
 * Tests the backfill for the PHP >= 8.0 nullsafe object operator.
 *
 * @author    Juliette Reinders Folmer <phpcs_nospam@adviesenzo.nl>
 * @copyright 2020 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   https://github.com/PHPCSStandards/PHP_CodeSniffer/blob/master/licence.txt BSD Licence
 */

namespace PHP_CodeSniffer\Tests\Core\Tokenizers.HP;

use PHP_CodeSniffer\Tests\Core\Tokenizers\AbstractTokenizerTestCase;
use PHP_CodeSniffer\Util\Tokens;

final class NullsafeObjectOperatorTest extends AbstractTokenizerTestCase
{

    /**
     * Tokens to search for.
     *
     * @var array<int|string>
     */
    protected $find = [
        T_NULLSAFE_OBJECT_OPERATOR,
        T_OBJECT_OPERATOR,
        T_INLINE_THEN,
    ];


    /**
     * Test that a normal object operator is still tokenized as such.
     *
     * @covers PHP_CodeSniffer\Tokenizers\PHP::tokenize
     *
     * @return void
     */
    public function testObjectOperator()
    {
        $tokens = $this->phpcsFile->getTokens();

        $operator = $this->getTargetToken('/* testObjectOperator */', $this->find);
        $this->assertSame(T_OBJECT_OPERATOR, $tokens[$operator]['code'], 'Failed asserting code is object operator');
        $this->assertSame('T_OBJECT_OPERATOR', $tokens[$operator]['type'], 'Failed asserting type is object operator');

    }//end testObjectOperator()


    /**
     * Test that a nullsafe object operator is tokenized as such.
     *
     * @param string $testMarker The comment which prefaces the target token in the test file.
     *
     * @dataProvider dataNullsafeObjectOperator
     * @covers       PHP_CodeSniffer\Tokenizers\PHP::tokenize
     *
     * @return void
     */
    public function testNullsafeObjectOperator($testMarker)
    {
        $tokens = $this->phpcsFile->getTokens();

        $operator = $this->getTargetToken($testMarker, $this->find);
        $this->assertSame(T_NULLSAFE_OBJECT_OPERATOR, $tokens[$operator]['code'], 'Failed asserting code is nullsafe object operator');
        $this->assertSame('T_NULLSAFE_OBJECT_OPERATOR', $tokens[$operator]['type'], 'Failed asserting type is nullsafe object operator');

    }//end testNullsafeObjectOperator()


    /**
     * Data provider.
     *
     * @see testNullsafeObjectOperator()
     *
     * @return array<string, array<string>>
     */
    public static function dataNullsafeObjectOperator()
    {
        return [
            'nullsafe operator'                         => ['/* testNullsafeObjectOperator */'],
            'illegal nullsafe operator (write context)' => ['/* testNullsafeObjectOperatorWriteContext */'],
        ];

    }//end dataNullsafeObjectOperator()


    /**
     * Test that a question mark not followed by an object operator is tokenized as T_TERNARY_THEN.
     *
     * @param string $testMarker         The comment which prefaces the target token in the test file.
     * @param bool   $testObjectOperator Whether to test for the next non-empty token being tokenized
     *                                   as an object operator.
     *
     * @dataProvider dataTernaryThen
     * @covers       PHP_CodeSniffer\Tokenizers\PHP::tokenize
     *
     * @return void
     */
    public function testTernaryThen($testMarker, $testObjectOperator=false)
    {
        $tokens = $this->phpcsFile->getTokens();

        $operator = $this->getTargetToken($testMarker, $this->find);
        $this->assertSame(T_INLINE_THEN, $tokens[$operator]['code'], 'Failed asserting code is inline then');
        $this->assertSame('T_INLINE_THEN', $tokens[$operator]['type'], 'Failed asserting type is inline then');

        if ($testObjectOperator === true) {
            $next = $this->phpcsFile->findNext(Tokens::$emptyTokens, ($operator + 1), null, true);
            $this->assertSame(T_OBJECT_OPERATOR, $tokens[$next]['code'], 'Failed asserting code is object operator');
            $this->assertSame('T_OBJECT_OPERATOR', $tokens[$next]['type'], 'Failed asserting type is object operator');
        }

    }//end testTernaryThen()


    /**
     * Data provider.
     *
     * @see testTernaryThen()
     *
     * @return array<string, array<string, string|bool>>
     */
    public static function dataTernaryThen()
    {
        return [
            'ternary then'                                         => [
                'testMarker' => '/* testTernaryThen */',
            ],
            'whitespace between question mark and object operator' => [
                'testMarker'         => '/* testParseErrorWhitespaceNotAllowed */',
                'testObjectOperator' => true,
            ],
            'comment between question mark and object operator'    => [
                'testMarker'         => '/* testParseErrorCommentNotAllowed */',
                'testObjectOperator' => true,
            ],
            'parse error/live coding'                              => [
                'testMarker' => '/* testLiveCoding */',
            ],
        ];

    }//end dataTernaryThen()


}//end class
