<?php
namespace PMC\Wayback;

use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Response;
use Monolog\Logger;

class ReverseProxy
{
    private $client;
    private $baseDir;
    private $logger;

    public function __construct($baseDir = '../../frontend/public/proxied_pages')
    {
        $this->client = new Client();
        $this->baseDir = realpath($baseDir);
        $this->createBaseDir();

        $this->logger = LoggerService::getLogger('ReverseProxy');
    }

    public function proxy($url)
    {
        try {
            $this->logger->info('Proxying URL: ' . $url);
            $response = $this->client->get($url);
            $this->saveResponseAsHtml($response, $url);
            return $this->proxyResponse($response);
        } catch (\Exception $e) {
            $this->logger->error('Error proxying URL: ' . $url, ['exception' => $e]);
            return new Response(500, [], 'Error: ' . $e->getMessage());
        }
    }

    private function proxyResponse(Response $response)
    {
        $proxiedResponse = new Response(
            $response->getStatusCode(),
            $response->getHeaders(),
            $response->getBody(),
            $response->getProtocolVersion(),
            $response->getReasonPhrase()
        );

        return $proxiedResponse;
    }

    private function saveResponseAsHtml(Response $response, $url)
    {
        $this->logger->info('Saving response as HTML for URL: ' . $url);
        $html = $response->getBody()->getContents();

        $filename = $this->getFilenameFromUrl($url);
        $filepath = $this->getFilePath($filename, $url);

        file_put_contents($filepath, $html);
        $this->logger->info('Response saved as HTML: ' . $filepath);
    }

    private function getFilenameFromUrl($url)
    {
        $parsedUrl = parse_url($url);
        $path = isset($parsedUrl['path']) ? $parsedUrl['path'] : '';
        $filename = str_replace('/', '_', $path) . '.html';
        return $filename;
    }

    private function getFilePath($filename, $url)
    {
        $parsedUrl = parse_url($url);
        $host = $parsedUrl['host'];

        $now = new \DateTime();
        $year = $now->format('Y');
        $month = $now->format('m');
        $day = $now->format('d');
        $hour = $now->format('H');
        $minute = $now->format('i');

        $dirPath = $this->baseDir . '/' . $year . '/' . $month . '/' . $day . '/' . $hour . '/' . $minute . '/' . $host;
        $this->createDirectory($dirPath);

        return $dirPath . '/' . $filename;
    }

    private function createBaseDir()
    {
        if (!is_dir($this->baseDir)) {
            mkdir($this->baseDir, 0755, true);
        }
    }

    private function createDirectory($path)
    {
        if (!is_dir($path)) {
            $this->logger->info('Creating directory: ' . $path);
            $success = mkdir($path, 0755, true);
            if (!$success) {
                $this->logger->error('mkdir failed for ' . $path );
            }
        }
    }

    private function logResponse(Response $response)
    {
        $this->logger->info('HTTP Response', [
            'status_code' => $response->getStatusCode(),
            'reason_phrase' => $response->getReasonPhrase(),
            'headers' => $response->getHeaders(),
            'body' => $response->getBody()->getContents(),
        ]);
    }
}
