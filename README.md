# PMC Wayback Machine

PMC Wayback Machine is a PHP application that takes snapshots of web pages from specified domains. It is designed to be triggered by a webhook when code is deployed, capturing snapshots of select pages on websites affected by the deployment.

## Prerequisites

- PHP 7.4 or higher
- Composer

## Installation

1. Clone the repository:
```bash
git clone https://github.com/penske-media-corp/pmc-wayback-machine.git
```


2. Navigate to the project's PHP directory:
```bash
cd pmc-wayback-machine/backend
```


3. Install dependencies using Composer:
```bash
composer install
```

4. Create the logs and proxied_pages directories in the project root directory and make them writable by PHP:
```bash
mkdir logs 
mkdir frontend/public/proxied_pages
```

## Configuration

1. Create a `domains.yml` file in the project root directory. This file should contain a list of domain names and URLs for the sites you want to take snapshots of. Refer to the `domains.yml.example` file for the expected format.

## Usage

### Creating Snapshots

To create snapshots of websites, you can use the `createsnapshots.php` script. This script accepts a list of domains as a comma-separated string via the `$_POST['domains']` parameter.

Example usage:
```bash
curl -X POST -d "domains=example.com,example.org" http://your-server.com/path/to/createsnapshots.php
```

This will create snapshots for the `example.com` and `example.org` domains.
If no domains are provided, the script will create snapshots for all domains specified in the `domains.yml` configuration file.

### Getting Snapshots
To retrieve the snapshots of websites, you can use the `getsnapshots.php` script. This script accepts the following GET parameters:
- `year` (optional): The year for which to retrieve snapshots.
- `month` (optional): The month for which to retrieve snapshots.
- `day` (optional): The day for which to retrieve snapshots.

Example: 
```bash
curl "http://your-server.com/path/to/getsnapshots.php?year=2023&month=4&day=15"
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
