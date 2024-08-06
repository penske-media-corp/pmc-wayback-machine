# ReverseProxy Class

The `ReverseProxy` class is a PHP implementation of a reverse proxy server. It proxies HTTP requests to a specified URL, saves the response as an HTML file in a nested directory structure, and returns the proxied response.

## Constructor

```php
public function __construct($baseDir = '../../frontend/public/proxied_pages')
```

The constructor initializes the Guzzle HTTP client and the base directory for storing the proxied pages. It takes an optional `$baseDir` parameter to specify the base directory. If not provided, it defaults to `'proxied_pages'`.

## Methods

### `proxy($url)`
```php
public function proxy($url)
```
This method is the main entry point for proxying a URL. It sends an HTTP GET request to the specified `$url`, saves the response as an HTML file in the appropriate directory structure, and returns the proxied response.

Parameters:
* `$url`: The URL to proxy.

Returns:
* A `GuzzleHttp\Psr7\Response` object representing the proxied response.
If an exception occurs during the proxying process, it returns a `GuzzleHttp\Psr7\Response` object with a 500 status code and the error message.

## Directory Structure

The `ReverseProxy` class saves the proxied pages in a nested directory structure organized by year, month, day, hour, minute, second, and domain name. The directory structure looks like this:
```
proxied_pages/
    2023/
        04/
            25/
                12/
                    34/
                        56/
                            example.com/
                                path_to_page.html
```

The HTML file for the proxied page (`path_to_page.html`) is saved in the innermost directory, which is named after the domain name (`example.com`).

It was decided to organize the snapshots by date and then domain last because it was assumed that most deploys would be to shared code that could affect multiple sites, so when looking to see what deploys happened people would be looking at a certain day first, and then want to know what sites were affected by that deploy. It would be less common for someone to look at a site first, and then look at what deploys affected that site. However the GUI supports looking at the snapshots both ways (by site and by date), it just takes a few more steps for us to organize it first by site.

## Error Handling

The `ReverseProxy` class logs any errors that occur during the proxying process to New Relic using the MonologAgent logger. If an error occurs, the proxy method will return a `GuzzleHttp\Psr7\Response` object with a `500` status code and the error message.

Note that you need to have the New Relic PHP agent installed and configured in your application for the error logging to work.

## Dependencies

The `ReverseProxy` class depends on the following libraries:
* `guzzlehttp/guzzle`: A PHP HTTP client that makes it easy to send HTTP requests and integrate with web services.
* `newrelic/monolog-enricher`: A New Relic enricher for Monolog, which allows logging to New Relic.

Make sure to install these dependencies using Composer before using the `ReverseProxy` class.