<?php
/**
 * This LoggerService class provides a static getLogger method that returns a singleton instance of
 * the logger. The createLogger method sets up a StreamHandler that writes logs to a file located at
 * logs/app.log relative to the project root.
 */
namespace PMC\Wayback;

use Monolog\Handler\StreamHandler;
use Monolog\Logger;

class LoggerService
{
    private static $logger;

    public static function getLogger($name = 'app')
    {
        if (!self::$logger) {
            self::$logger = self::createLogger($name);
        }

        return self::$logger;
    }

    private static function createLogger($name)
    {
        $logger = new Logger($name);
        $logDir = realpath(__DIR__ . '/../../logs');

        if ($logDir === false) {
            // Handle the case when the logs directory does not exist
            $logDir = __DIR__ . '/../../logs';
            if (!is_dir($logDir)) {
                mkdir($logDir, 0755, true);
            }
        }

        $logFile = $logDir . '/app.log';
        $handler = new StreamHandler($logFile, Logger::DEBUG);
        $logger->pushHandler($handler);

        return $logger;
    }

}
