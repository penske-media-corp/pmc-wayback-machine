<?php
/**
 * @TODO This should probably be moved to a directory like `backend/public`
 */

require_once __DIR__ . '/../vendor/autoload.php';

use PMC\Wayback\DirectoryReader;

/**
 * Retrieves the start date, end date, and domain from the $_REQUEST superglobal.
 *
 * The start date is expected to be provided in the $_REQUEST['start_date'] parameter.
 * If the 'start_date' parameter is present in the request, its value is assigned to
 * the $startDate variable. If the parameter is not present, $startDate is set to null.
 *
 * The end date is expected to be provided in the $_REQUEST['end_date'] parameter.
 * If the 'end_date' parameter is present in the request, its value is assigned to
 * the $endDate variable. If the parameter is not present, $endDate is set to null.
 *
 * The domain is expected to be provided in the $_REQUEST['domain'] parameter.
 * If the 'domain' parameter is present in the request, its value is assigned to
 * the $domain variable. If the parameter is not present, $domain is set to null.
 *
 * These variables are used to filter the directory contents based on the specified
 * start date, end date, and domain.
 *
 * @var string|null $startDate The start date for filtering directory contents, or null if not provided.
 * @var string|null $endDate The end date for filtering directory contents, or null if not provided.
 * @var string|null $domain The domain for filtering directory contents, or null if not provided.
 */
$startDate = isset($_REQUEST['start_date']) ? $_REQUEST['start_date'] : null;
$endDate = isset($_REQUEST['end_date']) ? $_REQUEST['end_date'] : null;
$domain = isset($_REQUEST['domain']) ? $_REQUEST['domain'] : null;

/**
 * Creates an instance of the DirectoryReader class and retrieves the contents of the proxied pages directory.
 *
 * The DirectoryReader class is responsible for reading the contents of the proxied pages directory
 * and filtering the results based on the specified criteria.
 *
 * The constructor of the DirectoryReader class takes one argument:
 * 1. $baseDir: The relative path to the proxied pages directory.
 *
 * After creating the DirectoryReader instance, the code calls the `getDirectoryContents` method
 * with the following arguments:
 *
 * 1. $domain: The domain to filter the directory contents by, or null to include all domains.
 * 2. $startDate: The start date to filter the directory contents by, or null to include all dates.
 * 3. $endDate: The end date to filter the directory contents by, or null to include all dates.
 *
 * The `getDirectoryContents` method returns the filtered directory contents as a string.
 *
 * Finally, the code echoes the filtered directory contents to the output.
 *
 * @var DirectoryReader $reader An instance of the DirectoryReader class.
 * @var string $contents The filtered contents of the proxied pages directory.
 */
$reader = new DirectoryReader('frontend/public/proxied_pages');
$contents = $reader->getDirectoryContents($domain, $startDate, $endDate);

echo $contents;
