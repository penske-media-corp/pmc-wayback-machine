# PMC Wayback Machine

This project is a PHP implementation of a web archiving system, similar to the Internet Archive's Wayback Machine. It allows you to create snapshots of websites and retrieve them later.

## Prerequisites

- PHP 7.4 or higher
- Composer

## Installation

1. Clone the repository:
```bash
git clone https://github.com/penske-media-corp/pmc-wayback-machine.git
```

2. Install dependencies:
```bash
cd pmc-wayback-machine
composer install
```

3. Create the required directories:
```bash
mkdir logs
mkdir frontend/public/proxied_pages
```

## Configuration

1. Create a `domains.yml` file in the project root directory. This file should contain a list of domain names and URLs for the sites you want to take snapshots of. Refer to the `domains.yml.example` file for the expected format.

## Usage

### Creating Snapshots

To create snapshots of websites, you can use the `createsnapshots.php` script. This script accepts a list of domains as a comma-separated string via the $_POST['domains'] parameter.

Example usage:
```bash
# Testing all domains and pages defined in domains.yml
curl -d https://your-server.com/path/to/createsnapshots.php

# Testing pages from two domains (must be defined in domains.yml)
curl -X POST -d "domains=example.com,example.org" https://your-server.com/path/to/createsnapshots.php

# Triggering a test from a browser using GET parameters
https://your-server.com/path/to/createsnapshots.php?domains=example.com,example.org
```

This will create snapshots for the `example.com` and `example.org` domains.
If no domains are provided, the script will create snapshots for all domains specified in the `domains.yml` configuration file.

Command line examples:
```bash
# Testing all domains from the command line
php pmc-wayback-machine/backend/src/createsnapshots.php

# Testing specific domains from the command line (must be defined in domains.yml)
php pmc-wayback-machine/backend/src/createsnapshots.php example.com example.org
```

### Getting Snapshots
To retrieve the snapshots of websites, you can use the `getsnapshots.php` script. This script accepts the following GET parameters:

- `domain`: The domain to filter the snapshots by (optional).
- `startDate`: The start date to filter the snapshots by (optional, format: YYYY-MM-DD).
- `endDate`: The end date to filter the snapshots by (optional, format: YYYY-MM-DD).

Unlike `createsnapshots.php`, `getsnapshots.php` is intended to be triggered only from a browser and not the command line. Command line can still be used for testing but request parameters are not supported (it will always fetch all).

Example: 
```bash
# Fetching the default results (3 months, all domains).
http://your-server.com/path/to/getsnapshots.php

# Fetching using GET parameters to filter the results. This will retrieve the snapshots for the example.com domain between May 1, 2023, and May 31, 2023.
http://your-server.com/path/to/getsnapshots.php?domain=example.com&startDate=2023-05-01&endDate=2023-05-31
```

This will retrieve snapshots for April 15, 2023. If no parameters are provided, the script will retrieve snapshots for the default date set in `DirectoryReader`.

## Running Tests

This project includes unit tests written using PHPUnit. To run the tests, execute the following command from the project root directory:
```bash
cd backend
vendor/bin/phpunit tests/
```

## Configuration Options

You can configure the following options in the `AsyncProxyFetcher` class:

- `MAX_CONCURRENT_JOBS`: Adjust this constant to change the maximum number of concurrent jobs for fetching URLs.

## Dependencies

This project relies on the following third-party libraries:

- `guzzlehttp/guzzle`: A PHP HTTP client for sending HTTP requests.
- `monolog/monolog`: A logging library for PHP.
- `symfony/yaml`: The Symfony YAML component for parsing YAML files.

## Error Handling

The application logs all errors and job states (success or failure) using the Monolog library. Logs are written to the `logs/app.log` file in the project root directory.

## License

This project is under proprietary license. 

## Credits
Bits and pieces plucked from https://github.com/tlinhart/s3-browser