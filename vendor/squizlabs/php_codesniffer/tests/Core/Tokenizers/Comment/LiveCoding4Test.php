<?php
/**
 * Tests that unclosed docblocks during live coding are handled correctly.
 *
 * @author    Juliette Reinders Folmer <phpcs_nospam@adviesenzo.nl>
 * @copyright 2024 PHPCSStandards and contributors
 * @license   https://github.com/PHPCSStandards/PHP_CodeSniffer/blob/master/licence.txt BSD Licence
 */

namespace PHP_CodeSniffer\Tests\Core\Tokenizers.omment;

/**
 * Tests that unclosed docblocks during live coding are handled correctly.
 *
 * @covers PHP_CodeSniffer\Tokenizers\Comment
 */
final class LiveCoding4Test extends CommentTestCase
{


    /**
     * Data provider.
     *
     * @see testDocblockOpenerCloser()
     *
     * @return array<string, array<string, string|int|array<int>>>
     */
    public static function dataDocblockOpenerCloser()
    {
        return [
            'live coding: unclosed docblock, trailing whitespace on last line, no blank line at end of file' => [
                'marker'       => '/* testLiveCoding */',
                'closerOffset' => 15,
                'expectedTags' => [],
            ],
        ];

    }//end dataDocblockOpenerCloser()


    /**
     * Verify tokenization of the DocBlock.
     *
     * @phpcs:disable Squiz.Arrays.ArrayDeclaration.SpaceBeforeDoubleArrow -- Readability is better with alignment.
     *
     * @return void
     */
    public function testLiveCoding()
    {
        $expectedSequence = [
            [T_DOC_COMMENT_OPEN_TAG   => '/**'],
            [T_DOC_COMMENT_WHITESPACE => "\n"],
            [T_DOC_COMMENT_WHITESPACE => ' '],
            [T_DOC_COMMENT_STAR       => '*'],
            [T_DOC_COMMENT_WHITESPACE => ' '],
            [T_DOC_COMMENT_STRING     => 'The last line of this test must have trailing whitespace.'],
            [T_DOC_COMMENT_WHITESPACE => "\n"],
            [T_DOC_COMMENT_WHITESPACE => ' '],
            [T_DOC_COMMENT_STAR       => '*'],
            [T_DOC_COMMENT_WHITESPACE => ' '],
            [T_DOC_COMMENT_STRING     => 'So, be careful when saving this file!'],
            [T_DOC_COMMENT_WHITESPACE => "\n"],
            [T_DOC_COMMENT_WHITESPACE => ' '],
            [T_DOC_COMMENT_STAR       => '*'],
            [T_DOC_COMMENT_WHITESPACE => '                 '],
            [T_DOC_COMMENT_CLOSE_TAG  => ''],
        ];

        $target = $this->getTargetToken('/* '.__FUNCTION__.' */', T_DOC_COMMENT_OPEN_TAG);

        $this->checkTokenSequence($target, $expectedSequence);

    }//end testLiveCoding()


}//end class
