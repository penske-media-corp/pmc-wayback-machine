# AsyncProxyFetcher Class

The `AsyncProxyFetcher` class is responsible for fetching and saving URLs associated with one or more domains specified in a YAML configuration file. It creates a series of asynchronous jobs (maximum number configured by a class constant) to fetch and save the URLs using the `ReverseProxy` class.

## Constructor

```php
public function __construct($configFile, $baseDir = '../../frontend/public/proxied_pages')
```

The constructor takes two parameters:
* `$configFile`: The path to the YAML configuration file containing the domain names and URLs.
* `$baseDir` (optional): The base directory for the `ReverseProxy` class to store the proxied pages. If not provided, it defaults to `'proxied_pages'`.

## Methods

### `fetchDomains($domains)`

```php
public function fetchDomains($domains)
```

This method is the main entry point for fetching and saving URLs. It accepts an array of domain names or the string "all" to fetch URLs for all domains in the configuration file.

Parameters:
* `$domains`: An array of domain names or the string "all".

The method creates a series of asynchronous jobs (maximum number configured by the `MAX_CONCURRENT_JOBS` constant) to fetch and save the URLs associated with the specified domains using the ReverseProxy class.

For each successful job (fulfilled request), it logs a success message to New Relic with the URL and status code.

For each failed job (rejected request), it logs an error message to New Relic with the URL and reason for failure.

If a domain name is not found in the configuration file, it logs a warning to New Relic.

Example usage:
```php
$configFile = 'domains.yml';
$fetcher = new AsyncProxyFetcher($configFile);

// Fetch URLs for all domains
$fetcher->fetchDomains('all');

// Fetch URLs for specific domains
$fetcher->fetchDomains(['variety.com', 'footwearnews.com']);
```

## Configuration

The maximum number of concurrent jobs can be configured by modifying the `MAX_CONCURRENT_JOBS` constant in the `AsyncProxyFetcher` class.

```php
const MAX_CONCURRENT_JOBS = 5; // Change this value to adjust the maximum number of concurrent jobs
```

## Error Handling

The `AsyncProxyFetcher` class logs all errors and job states (success or failure) to New Relic using the `MonologAgent` logger.

If the YAML configuration file is not found or cannot be parsed, it logs an error to New Relic and proceeds with an empty configuration.

## Dependencies

The `AsyncProxyFetcher` class depends on the following libraries:
* `guzzlehttp/guzzle`: A PHP HTTP client that makes it easy to send HTTP requests and integrate with web services.
* `newrelic/monolog-enricher`: A New Relic enricher for Monolog, which allows logging to New Relic.

Make sure to install these dependencies using Composer before using the AsyncProxyFetcher class.

Additionally, this class assumes that the `ReverseProxy` class is available and working correctly.

Note that you need to have the New Relic PHP agent installed and configured in your application for the error and job state logging to work.
