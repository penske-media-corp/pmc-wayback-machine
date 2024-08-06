# DirectoryReader Class

The `DirectoryReader` class is used to read and retrieve information about the directory structure created by the `ReverseProxy` class. It provides methods to get the nested hierarchy of directories and files, as well as the ability to retrieve the contents of a specific directory.

## Constructor

```php
public function __construct($baseDir = '../../frontend/public/proxied_pages')
```

The constructor initializes the base directory and the logger. It takes an optional `$baseDir` parameter to specify the base directory where the proxied pages are stored. If not provided, it defaults to `'proxied_pages'`.

## Methods

### `getDirectoryStructure()`

```php
public function getDirectoryStructure()
```

This method returns a JSON string representing the nested hierarchy of directories and files. The structure is organized by date and domain name. The JSON object has two keys:
* `snapshots_by_date`: A nested structure of years, months, days, and hosts for each day.
* `snapshots_by_site`: A nested structure of hosts, years, months, and days.
By default, it retrieves the directory structure for the past three months, starting from the first day of the oldest month. You can override the start and end dates by passing `$startDate` and `$endDate` parameters to the constructor.

Example usage:
```php
$reader = new DirectoryReader();
$jsonStructure = $reader->getDirectoryStructure();
echo $jsonStructure;
```

### `getDirectoryContents($year, $month, $day, $domain = null)`

```php
public function getDirectoryContents($year, $month, $day, $domain = null)
```

This method retrieves the contents of a specific directory based on the provided year, month, day, and optionally, a domain name. It returns a JSON string containing an object with two keys:
* `directories`: An array of subdirectories within the specified directory.
* `files`: An array of files within the specified directory. If the $domain parameter is provided, it filters the files to include only those from the directory matching the specified domain name. If no files exist for the specified domain, the files key will be set to null.

Parameters:
* `$year`: The year for which to retrieve the directory contents.
* `$month`: The month for which to retrieve the directory contents.
* `$day`: The day for which to retrieve the directory contents.
* `$domain` (optional): The domain name to filter the files by.

Example usage:
```php
$reader = new DirectoryReader();

// Get all directories and files for a specific year, month, and day
$contents = $reader->getDirectoryContents('2024', '06', '01');
echo $contents;

// Get all directories and files for a specific year, month, day, and domain
$contents = $reader->getDirectoryContents('2024', '06', '01', 'variety.com');
echo $contents;
```

## Error Handling

The `DirectoryReader` class logs any errors that occur during the directory traversal or retrieval to New Relic using the `MonologAgent` logger. If an error occurs, the methods will return a JSON string with an error key containing the error message.

Example error response:
```
{
    "error": "Directory not found: /path/to/proxied_pages/2024/06/01"
}
```

Note that you need to have the New Relic PHP agent installed and configured in your application for the error logging to work.