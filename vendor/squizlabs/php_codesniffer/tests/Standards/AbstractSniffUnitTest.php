<?php
/**
 * An abstract class that all sniff unit tests must extend.
 *
 * A sniff unit test checks a .inc file for expected violations of a single
 * coding standard. Expected errors and warnings that are not found, or
 * warnings and errors that are not expected, are considered test failures.
 *
 * @author    Greg Sherwood <gsherwood@squiz.net>
 * @copyright 2006-2015 Squiz Pty Ltd (ABN 77 084 670 600)
 * @license   https://github.com/PHPCSStandards/PHP_CodeSniffer/blob/master/licence.txt BSD Licence
 */

namespace PHP_CodeSniffer\Tests.tandards;

use DirectoryIterator;
use PHP_CodeSniffer\Exceptions\RuntimeException;
use PHP_CodeSniffer\Files\LocalFile;
use PHP_CodeSniffer\Ruleset;
use PHP_CodeSniffer\Tests\ConfigDouble;
use PHP_CodeSniffer\Util\Common;
use PHPUnit\Framework\TestCase;

abstract class AbstractSniffUnitTest extends TestCase
{

    /**
     * Enable or disable the backup and restoration of the $GLOBALS array.
     * Overwrite this attribute in a child class of TestCase.
     * Setting this attribute in setUp() has no effect!
     *
     * @var boolean
     */
    protected $backupGlobals = false;

    /**
     * The path to the standard's main directory.
     *
     * @var string
     */
    public $standardsDir = null;

    /**
     * The path to the standard's test directory.
     *
     * @var string
     */
    public $testsDir = null;


    /**
     * Sets up this unit test.
     *
     * @before
     *
     * @return void
     */
    protected function setUpPrerequisites()
    {
        $class = get_class($this);
        $this->standardsDir = $GLOBALS['PHP_CODESNIFFER_STANDARD_DIRS'][$class];
        $this->testsDir     = $GLOBALS['PHP_CODESNIFFER_TEST_DIRS'][$class];

    }//end setUpPrerequisites()


    /**
     * Get a list of all test files to check.
     *
     * These will have the same base as the sniff name but different extensions.
     * We ignore the .php file as it is the class.
     *
     * @param string $testFileBase The base path that the unit tests files will have.
     *
     * @return string[]
     */
    protected function getTestFiles($testFileBase)
    {
        $testFiles = [];

        $dir = substr($testFileBase, 0, strrpos($testFileBase, DIRECTORY_SEPARATOR));
        $di  = new DirectoryIterator($dir);

        foreach ($di as $file) {
            $path = $file->getPathname();
            if (substr($path, 0, strlen($testFileBase)) === $testFileBase) {
                if ($path !== $testFileBase.'php' && substr($path, -5) !== 'fixed' && substr($path, -4) !== '.bak') {
                    $testFiles[] = $path;
                }
            }
        }

        // Put them in order.
        sort($testFiles, SORT_NATURAL);

        return $testFiles;

    }//end getTestFiles()


    /**
     * Should this test be skipped for some reason.
     *
     * @return boolean
     */
    protected function shouldSkipTest()
    {
        return false;

    }//end shouldSkipTest()


    /**
     * Tests the extending classes Sniff class.
     *
     * @return void
     * @throws \PHPUnit\Framework\Exception
     */
    final public function testSniff()
    {
        // Skip this test if we can't run in this environment.
        if ($this->shouldSkipTest() === true) {
            $this->markTestSkipped();
        }

        $sniffCode = Common::getSniffCode(get_class($this));
        list($standardName, $categoryName, $sniffName) = explode('.', $sniffCode);

        $testFileBase = $this->testsDir.$categoryName.DIRECTORY_SEPARATOR.$sniffName.'UnitTest.';

        // Get a list of all test files to check.
        $testFiles = $this->getTestFiles($testFileBase);
        $GLOBALS['PHP_CODESNIFFER_SNIFF_CASE_FILES'][] = $testFiles;

        if (isset($GLOBALS['PHP_CODESNIFFER_CONFIG']) === true) {
            $config = $GLOBALS['PHP_CODESNIFFER_CONFIG'];
        } else {
            $config        = new ConfigDouble();
            $config->cache = false;
            $GLOBALS['PHP_CODESNIFFER_CONFIG'] = $config;
        }

        $config->standards = [$standardName];
        $config->sniffs    = [$sniffCode];
        $config->ignored   = [];

        if (isset($GLOBALS['PHP_CODESNIFFER_RULESETS']) === false) {
            $GLOBALS['PHP_CODESNIFFER_RULESETS'] = [];
        }

        if (isset($GLOBALS['PHP_CODESNIFFER_RULESETS'][$standardName]) === false) {
            $ruleset = new Ruleset($config);
            $GLOBALS['PHP_CODESNIFFER_RULESETS'][$standardName] = $ruleset;
        }

        $ruleset = $GLOBALS['PHP_CODESNIFFER_RULESETS'][$standardName];

        $sniffFile = $this->standardsDir.DIRECTORY_SEPARATOR.'Sniffs'.DIRECTORY_SEPARATOR.$categoryName.DIRECTORY_SEPARATOR.$sniffName.'Sniff.php';

        $sniffClassName = substr(get_class($this), 0, -8).'Sniff';
        $sniffClassName = str_replace('\Tests\\', '\Sniffs\\', $sniffClassName);
        $sniffClassName = Common::cleanSniffClass($sniffClassName);

        $restrictions = [strtolower($sniffClassName) => true];
        $ruleset->registerSniffs([$sniffFile], $restrictions, []);
        $ruleset->populateTokenListeners();

        $failureMessages = [];
        foreach ($testFiles as $testFile) {
            $filename  = basename($testFile);
            $oldConfig = $config->getSettings();

            try {
                $this->setCliValues($filename, $config);
                $phpcsFile = new LocalFile($testFile, $ruleset, $config);
                $phpcsFile->process();
            } catch (RuntimeException $e) {
                $this->fail('An unexpected exception has been caught: '.$e->getMessage());
            }

            $failures        = $this->generateFailureMessages($phpcsFile);
            $failureMessages = array_merge($failureMessages, $failures);

            if ($phpcsFile->getFixableCount() > 0) {
                // Attempt to fix the errors.
                $phpcsFile->fixer->fixFile();
                $fixable = $phpcsFile->getFixableCount();
                if ($fixable > 0) {
                    $failureMessages[] = "Failed to fix $fixable fixable violations in $filename";
                }

                // Check for a .fixed file to check for accuracy of fixes.
                $fixedFile = $testFile.'.fixed';
                $filename  = basename($testFile);
                if (file_exists($fixedFile) === true) {
                    if ($phpcsFile->fixer->getContents() !== file_get_contents($fixedFile)) {
                        // Only generate the (expensive) diff if a difference is expected.
                        $diff = $phpcsFile->fixer->generateDiff($fixedFile);
                        if (trim($diff) !== '') {
                            $fixedFilename     = basename($fixedFile);
                            $failureMessages[] = "Fixed version of $filename does not match expected version in $fixedFilename; the diff is\n$diff";
                        }
                    }
                } else if (is_callable([$this, 'addWarning']) === true) {
                    $this->addWarning("Missing fixed version of $filename to verify the accuracy of fixes, while the sniff is making fixes against the test case file");
                }
            }//end if

            // Restore the config.
            $config->setSettings($oldConfig);
        }//end foreach

        if (empty($failureMessages) === false) {
            $this->fail(implode(PHP_EOL, $failureMessages));
        }

    }//end testSniff()


    /**
     * Generate a list of test failures for a given sniffed file.
     *
     * @param \PHP_CodeSniffer\Files\LocalFile $file The file being tested.
     *
     * @return array
     * @throws \PHP_CodeSniffer\Exceptions\RuntimeException
     */
    public function generateFailureMessages(LocalFile $file)
    {
        $testFile = $file->getFilename();

        $foundErrors      = $file->getErrors();
        $foundWarnings    = $file->getWarnings();
        $expectedErrors   = $this->getErrorList(basename($testFile));
        $expectedWarnings = $this->getWarningList(basename($testFile));

        if (is_array($expectedErrors) === false) {
            throw new RuntimeException('getErrorList() must return an array');
        }

        if (is_array($expectedWarnings) === false) {
            throw new RuntimeException('getWarningList() must return an array');
        }

        /*
            We merge errors and warnings together to make it easier
            to iterate over them and produce the errors string. In this way,
            we can report on errors and warnings in the same line even though
            it's not really structured to allow that.
        */

        $allProblems     = [];
        $failureMessages = [];

        foreach ($foundErrors as $line => $lineErrors) {
            foreach ($lineErrors as $column => $errors) {
                if (isset($allProblems[$line]) === false) {
                    $allProblems[$line] = [
                        'expected_errors'   => 0,
                        'expected_warnings' => 0,
                        'found_errors'      => [],
                        'found_warnings'    => [],
                    ];
                }

                $foundErrorsTemp = [];
                foreach ($allProblems[$line]['found_errors'] as $foundError) {
                    $foundErrorsTemp[] = $foundError;
                }

                $errorsTemp = [];
                foreach ($errors as $foundError) {
                    $errorsTemp[] = $foundError['message'].' ('.$foundError['source'].')';

                    $source = $foundError['source'];
                    if (in_array($source, $GLOBALS['PHP_CODESNIFFER_SNIFF_CODES'], true) === false) {
                        $GLOBALS['PHP_CODESNIFFER_SNIFF_CODES'][] = $source;
                    }

                    if ($foundError['fixable'] === true
                        && in_array($source, $GLOBALS['PHP_CODESNIFFER_FIXABLE_CODES'], true) === false
                    ) {
                        $GLOBALS['PHP_CODESNIFFER_FIXABLE_CODES'][] = $source;
                    }
                }

                $allProblems[$line]['found_errors'] = array_merge($foundErrorsTemp, $errorsTemp);
            }//end foreach

            if (isset($expectedErrors[$line]) === true) {
                $allProblems[$line]['expected_errors'] = $expectedErrors[$line];
            } else {
                $allProblems[$line]['expected_errors'] = 0;
            }

            unset($expectedErrors[$line]);
        }//end foreach

        foreach ($expectedErrors as $line => $numErrors) {
            if (isset($allProblems[$line]) === false) {
                $allProblems[$line] = [
                    'expected_errors'   => 0,
                    'expected_warnings' => 0,
                    'found_errors'      => [],
                    'found_warnings'    => [],
                ];
            }

            $allProblems[$line]['expected_errors'] = $numErrors;
        }

        foreach ($foundWarnings as $line => $lineWarnings) {
            foreach ($lineWarnings as $column => $warnings) {
                if (isset($allProblems[$line]) === false) {
                    $allProblems[$line] = [
                        'expected_errors'   => 0,
                        'expected_warnings' => 0,
                        'found_errors'      => [],
                        'found_warnings'    => [],
                    ];
                }

                $foundWarningsTemp = [];
                foreach ($allProblems[$line]['found_warnings'] as $foundWarning) {
                    $foundWarningsTemp[] = $foundWarning;
                }

                $warningsTemp = [];
                foreach ($warnings as $warning) {
                    $warningsTemp[] = $warning['message'].' ('.$warning['source'].')';

                    $source = $warning['source'];
                    if (in_array($source, $GLOBALS['PHP_CODESNIFFER_SNIFF_CODES'], true) === false) {
                        $GLOBALS['PHP_CODESNIFFER_SNIFF_CODES'][] = $source;
                    }

                    if ($warning['fixable'] === true
                        && in_array($source, $GLOBALS['PHP_CODESNIFFER_FIXABLE_CODES'], true) === false
                    ) {
                        $GLOBALS['PHP_CODESNIFFER_FIXABLE_CODES'][] = $source;
                    }
                }

                $allProblems[$line]['found_warnings'] = array_merge($foundWarningsTemp, $warningsTemp);
            }//end foreach

            if (isset($expectedWarnings[$line]) === true) {
                $allProblems[$line]['expected_warnings'] = $expectedWarnings[$line];
            } else {
                $allProblems[$line]['expected_warnings'] = 0;
            }

            unset($expectedWarnings[$line]);
        }//end foreach

        foreach ($expectedWarnings as $line => $numWarnings) {
            if (isset($allProblems[$line]) === false) {
                $allProblems[$line] = [
                    'expected_errors'   => 0,
                    'expected_warnings' => 0,
                    'found_errors'      => [],
                    'found_warnings'    => [],
                ];
            }

            $allProblems[$line]['expected_warnings'] = $numWarnings;
        }

        // Order the messages by line number.
        ksort($allProblems);

        foreach ($allProblems as $line => $problems) {
            $numErrors        = count($problems['found_errors']);
            $numWarnings      = count($problems['found_warnings']);
            $expectedErrors   = $problems['expected_errors'];
            $expectedWarnings = $problems['expected_warnings'];

            $errors      = '';
            $foundString = '';

            if ($expectedErrors !== $numErrors || $expectedWarnings !== $numWarnings) {
                $lineMessage     = "[LINE $line]";
                $expectedMessage = 'Expected ';
                $foundMessage    = 'in '.basename($testFile).' but found ';

                if ($expectedErrors !== $numErrors) {
                    $expectedMessage .= "$expectedErrors error(s)";
                    $foundMessage    .= "$numErrors error(s)";
                    if ($numErrors !== 0) {
                        $foundString .= 'error(s)';
                        $errors      .= implode(PHP_EOL.' -> ', $problems['found_errors']);
                    }

                    if ($expectedWarnings !== $numWarnings) {
                        $expectedMessage .= ' and ';
                        $foundMessage    .= ' and ';
                        if ($numWarnings !== 0) {
                            if ($foundString !== '') {
                                $foundString .= ' and ';
                            }
                        }
                    }
                }

                if ($expectedWarnings !== $numWarnings) {
                    $expectedMessage .= "$expectedWarnings warning(s)";
                    $foundMessage    .= "$numWarnings warning(s)";
                    if ($numWarnings !== 0) {
                        $foundString .= 'warning(s)';
                        if (empty($errors) === false) {
                            $errors .= PHP_EOL.' -> ';
                        }

                        $errors .= implode(PHP_EOL.' -> ', $problems['found_warnings']);
                    }
                }

                $fullMessage = "$lineMessage $expectedMessage $foundMessage.";
                if ($errors !== '') {
                    $fullMessage .= " The $foundString found were:".PHP_EOL." -> $errors";
                }

                $failureMessages[] = $fullMessage;
            }//end if
        }//end foreach

        return $failureMessages;

    }//end generateFailureMessages()


    /**
     * Get a list of CLI values to set before the file is tested.
     *
     * @param string                  $filename The name of the file being tested.
     * @param \PHP_CodeSniffer\Config $config   The config data for the run.
     *
     * @return void
     */
    public function setCliValues($filename, $config)
    {

    }//end setCliValues()


    /**
     * Returns the lines where errors should occur.
     *
     * The key of the array should represent the line number and the value
     * should represent the number of errors that should occur on that line.
     *
     * @return array<int, int>
     */
    abstract protected function getErrorList();


    /**
     * Returns the lines where warnings should occur.
     *
     * The key of the array should represent the line number and the value
     * should represent the number of warnings that should occur on that line.
     *
     * @return array<int, int>
     */
    abstract protected function getWarningList();


}//end class
