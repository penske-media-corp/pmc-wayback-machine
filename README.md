# PMC Wayback Machine

The PMC Wayback Machine is a self-hosted archiving solution to capture
screenshots and snapshots of any url.

This project mimics a subset of the functionality of the Internet Archive's
Wayback Machine. Also inspired by [Archivebox](https://github.com/ArchiveBox/ArchiveBox).

## Description

This tool helps us to monitor for regressions across our properties.

### Disclaimer

This project is a pre-release work in progress.

### Todos

* Cleanup environment variables and naming.
* Update the Checkly tests to trigger snapshots.
* Update the PHP application to push to the S3 bucket.

## Architecture

There are three pieces of architecture that come together to make this work.

* A NextJS application for browsing captured screenshots and snapshots.
* A PHP application for capturing snapshots.
* [Checkly](https://www.checklyhq.com/) tests for capturing screenshots.

## Usage

A new capture can be triggered manually, or via Checkly schedule for any url.

The Playwright test will execute in Checkly. It will capture screenshots in a
headless browser and uploads them to an S3 bucket. Before exiting, the test
will also trigger the PHP application to capture a snapshot.

_Note: The PHP application is not yet hooked up to the Checkly test. This is a
work in progress._

Once uploaded to S3, you can use the NextJS application to browse your
screenshots and snapshots.

_Note: Support for searching, filtering, pagination, diff viewing, and more are
on the planned list of improvements._

### Scheduling URLs

Checkly supports scheduling tests, which we use to mimic a cron job.

_Note:_

The URLs in `__checks__/screenshots-group.check.ts` should be abstracted into its own
file.

The `domains.yml` used in the PHP app will become redundant once integrated with the
Checkly tests.

## Installation
This section will guide you through installation and configuration.

### NextJS Installation

The root of this project includes the NextJS project. You can setup using
Vercel or a similar host.

#### Environment Variables

* `NEXT_PUBLIC_URL` - URL for the application.

* `AWS_ACCESS_KEY_ID` - Access Key ID for IAM user with read/write to the
bucket.
* `AWS_REGION` - Bucket region.
* `AWS_SECRET_ACCESS_KEY` - Secret Access Key for IAM user with read/write to
the bucket.
* `BUCKET_NAME` - Bucket name.
* `NEXT_PUBLIC_BUCKET_NAME` - Bucket name again (needs to be deduplicated with
above).

* `GITHUB_TOKEN` - Used to trigger the dispatch workflow for one-off url
captures.

* `SLACK_CHANNEL_ID` - Slack Channel ID for new one-off captures.
* `SLACK_TOKEN` - Slack Token with privledges to read/write to the correct
channel.

### Checkly Test Setup

Refer to the Checkly documentation on deploying tests to your account.

There is a GitHub workflow that can automate this for you if you fork this repo.

### PHP Application Installation

#### Prerequisites

- PHP 7.4 or higher
- Composer

#### Setup
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

#### Configuration

1. Create a `domains.yml` file in the project root directory. This file should contain a list of domain names and URLs for the sites you want to take snapshots of. Refer to the `domains.yml.example` file for the expected format.

#### Usage

##### Creating Snapshots

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

##### Getting Snapshots
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

##### Running Tests

This project includes unit tests written using PHPUnit. To run the tests, execute the following command from the project root directory:
```bash
cd backend
vendor/bin/phpunit tests/
```

##### Configuration Options

You can configure the following options in the `AsyncProxyFetcher` class:

- `MAX_CONCURRENT_JOBS`: Adjust this constant to change the maximum number of concurrent jobs for fetching URLs.

##### Dependencies

This project relies on the following third-party libraries:

- `guzzlehttp/guzzle`: A PHP HTTP client for sending HTTP requests.
- `monolog/monolog`: A logging library for PHP.
- `symfony/yaml`: The Symfony YAML component for parsing YAML files.

##### Error Handling

The application logs all errors and job states (success or failure) using the Monolog library. Logs are written to the `logs/app.log` file in the project root directory.

## License

This project is under proprietary license. 

## Credits
Bits and pieces plucked from https://github.com/tlinhart/s3-browser