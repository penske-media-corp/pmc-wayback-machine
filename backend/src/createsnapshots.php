<?php
/**
 * Define the lock file path
 */
$lockFile = __DIR__ . '/createsnapshots.lock';

/**
 * Check if the lock file exists
 */
$fp = fopen($lockFile, 'c'); // Open the file for reading and creation
if (!$fp) {
    echo "Cannot create lock file\n";
    exit(1);
}

/**
 * Try to acquire an exclusive lock on the file
 */
if (!flock($fp, LOCK_EX | LOCK_NB)) {
    echo "Another instance is already running\n";
    fclose($fp);
    exit(1);
}

require_once __DIR__ . '/../vendor/autoload.php';

use PMC\Wayback\AsyncProxyFetcher;

/**
 * Defines the path to the configuration file containing the list of domains.
 *
 * The configuration file is expected to be in YAML format and contain a list
 * of domains that the application should fetch URLs for.
 *
 * @var string $configFile The absolute path to the configuration file containing the list of domains.
 */
$configFile = __DIR__ . '/../../domains.yml';

/**
 * Defines the base directory path for storing proxied pages.
 *
 * The resulting $baseDir path is used by the application to store proxied
 * pages fetched from various domains.
 *
 * @var string $baseDir The absolute path to the base directory for storing proxied pages.
 */
$baseDir = __DIR__ . '/../../frontend/public/proxied_pages';

/**
 * Initializes the $domains array with a list of domains.
 *
 * The domains can be provided either through the $_REQUEST superglobal
 * (for web requests) or through command-line arguments.
 *
 * If the $_REQUEST['domains'] is set, it is expected to be a comma-separated
 * string of domain names. The code sanitizes the input by:
 * 1. Splitting the string by commas using `explode(',', $_REQUEST['domains'])`.
 * 2. Removing any HTML tags from each domain using `array_map('strip_tags', ...)`.
 * 3. Trimming any leading or trailing whitespace from each domain using `array_map('trim', ...)`.
 *
 * If $_REQUEST['domains'] is not set, the code checks if the script was run from
 * the command line by checking if $argv is not empty and has more than one element
 * (the first element is the script name).
 *
 * If the script was run from the command line, the $domains array is populated
 * with the command-line arguments, excluding the first argument (script name),
 * using `array_slice($argv, 1)`.
 *
 * @var array $domains An array of domain names, either from $_REQUEST or command-line arguments.
 */
$domains = [];
if (isset($_REQUEST['domains'])) {
    // Sanitize the domains from $_REQUEST
    $domains = array_map('trim', array_map('strip_tags', explode(',', $_REQUEST['domains'])));
}
// Check if domains are passed from the command line
elseif (!empty($argv) && count($argv) > 1) {
    $domains = array_slice($argv, 1);
}

/**
 * Creates an instance of the AsyncProxyFetcher class.
 *
 * The AsyncProxyFetcher class is responsible for fetching URLs from various
 * domains and storing the proxied pages in the specified base directory.
 *
 * The constructor takes two arguments:
 * 1. $configFile: The absolute path to the configuration file containing the list of domains.
 * 2. $baseDir: The absolute path to the base directory for storing proxied pages.
 *
 * After creating the AsyncProxyFetcher instance, the code checks if the $domains array is empty.
 *
 * If $domains is empty, it calls the `fetchDomains('all')` method on the $fetcher instance.
 * This method fetches URLs for all domains listed in the configuration file.
 *
 * If $domains is not empty, it calls the `fetchDomains($domains)` method on the $fetcher instance,
 * passing the $domains array as an argument. This method fetches URLs for the specified domains
 * in the $domains array.
 *
 * @var AsyncProxyFetcher $fetcher An instance of the AsyncProxyFetcher class.
 */
$fetcher = new AsyncProxyFetcher($configFile, $baseDir);
if (empty($domains)) {
    // Fetch URLs for all domains
    $fetcher->fetchDomains('all');
} else {
    // Fetch URLs for the specified domains
    $fetcher->fetchDomains($domains);
}

/**
 * Release the lock and close the file
 */
flock($fp, LOCK_UN);
fclose($fp);
