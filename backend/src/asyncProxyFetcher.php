<?php
namespace PMC\Wayback;

use GuzzleHttp\Pool;
use GuzzleHttp\Client;
use GuzzleHttp\Psr7\Request;
use Monolog\Logger;
use Symfony\Component\Yaml\Yaml;

class AsyncProxyFetcher
{
    private $client;
    private $reverseProxy;
    private $logger;
    private $config;

    const MAX_CONCURRENT_JOBS = 5;

    public function __construct($configFile, $baseDir = '../../frontend/public/proxied_pages')
    {
        $this->client = new Client();
        $this->reverseProxy = new ReverseProxy($baseDir);
        $this->logger = LoggerService::getLogger('AsyncProxyFetcher');
        $this->config = $this->loadConfig($configFile);
    }

    public function fetchDomains($domains)
    {
        $requests = $this->prepareRequests($domains);

        if (empty($requests)) {
            $this->logger->warning('No valid domains or URLs found in the config file.');
            return;
        }

        $pool = new Pool($this->client, $requests, [
            'concurrency' => self::MAX_CONCURRENT_JOBS,
            'fulfilled' => function ($response, $index) use ($requests) {
                $request = $requests[$index];
                $this->logger->info('Job succeeded', [
                    'url' => $request->getUri(),
                    'status_code' => $response->getStatusCode(),
                ]);
                $this->reverseProxy->proxy($request->getUri());
            },
            'rejected' => function ($reason, $index) use ($requests) {
                $request = $requests[$index];
                $this->logger->error('Job failed', [
                    'url' => $request->getUri(),
                    'reason' => $reason->getMessage(),
                ]);
            },
        ]);

        $promise = $pool->promise();
        $promise->wait();
    }


    private function prepareRequests($domains)
    {
        $requests = [];

        if ($domains === 'all') {
            $domains = array_keys($this->config);
        } elseif (!is_array($domains)) {
            $this->logger->warning("Invalid domains parameter: $domains");
            return $requests;
        }

        foreach ($domains as $domain) {
            if (!isset($this->config[$domain])) {
                $this->logger->warning("Domain not found in the config file: $domain");
                continue;
            }

            foreach ($this->config[$domain] as $url) {
                $requests[] = new Request('GET', $url);
            }
        }

        return $requests;
    }

    private function loadConfig($configFile)
    {
        $configFilePath = realpath('/../../../' . $configFile);

        if (!file_exists($configFile)) {
            $this->logger->error("Config file not found: $configFile");
            return [];
        }

        $config = Yaml::parseFile($configFilePath);

        if ($config === false) {
            $this->logger->error("Failed to parse the config file: $configFile");
            return [];
        }

        return $config;
    }
}
