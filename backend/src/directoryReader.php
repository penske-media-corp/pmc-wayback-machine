<?php
namespace PMC\Wayback;

use DateTime;
use Monolog\Logger;

class DirectoryReader
{
    const snapshotFileExtension = '.html';
    private $baseDir;
    private $logger;
    private $snapshotsByDate = [];
    private $snapshotsBySite = [];

    public function __construct($baseDir = '../../frontend/public/proxied_pages')
    {
        $this->baseDir = realpath($baseDir);
        $this->logger = LoggerService::getLogger('DirectoryReader');
    }

    public function getDirectoryContents($domain = null, $startDate = null, $endDate = null)
    {
        try {
            // Parse and sanitize $startDate
            if ($startDate !== null && preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
                $startDate = new DateTime($startDateStr);
            } else {
                $startDate = new DateTime('-3 months');
            }

            // Parse and sanitize $endDate
            if ($endDate !== null && preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
                $endDate = new DateTime($endDate);
            } else {
                $endDate = new DateTime();
            }

            $startYear = $startDate->format('Y');
            $startMonth = $startDate->format('m');
            $startDay = $startDate->format('d');

            $endYear = $endDate->format('Y');
            $endMonth = $endDate->format('m');
            $endDay = $endDate->format('d');

            for ($year = $startYear; $year <= $endYear; $year++) {
                $yearStart = ($year == $startYear) ? $startMonth : '01';
                $yearEnd = ($year == $endYear) ? $endMonth : '12';

                for ($month = $yearStart; $month <= $yearEnd; $month++) {
                    $monthStart = ($month == $yearStart && $year == $startYear) ? $startDay : '01';
                    $monthEnd = ($month == $yearEnd && $year == $endYear) ? $endDay : cal_days_in_month(CAL_GREGORIAN, $month, $year);

                    for ($day = $monthStart; $day <= $monthEnd; $day++) {
                        $dirPath = $this->baseDir . '/' . $year . '/' . str_pad($month, 2, '0', STR_PAD_LEFT) . '/' . str_pad($day, 2, '0', STR_PAD_LEFT);

                        $this->traverseDirectory($dirPath);
                    }
                }
            }

            return json_encode($this->snapshotsByDate, JSON_PRETTY_PRINT);
        } catch (\Exception $e) {
            $this->logger->error('Error getting directory contents', ['exception' => $e]);
            return json_encode(['error' => $e->getMessage()]);
        }
    }


    private function traverseDirectory($dirPath)
    {
        $dirName = basename($dirPath);

        if (is_dir($dirPath) && ($handle = opendir($dirPath))) {
            while (false !== ($entry = readdir($handle))) {
                if ($entry != '.' && $entry != '..' && $entry != $this::snapshotFileExtension) {
                    $path = $dirPath . '/' . $entry;
                    if (is_dir($path)) {
                        $dirParts = explode('/', trim(str_replace($this->baseDir, '', $path), '/'));
                        $ref = &$this->snapshotsByDate;
                        foreach ($dirParts as $part) {
                            if (!isset($ref[$part])) {
                                $ref[$part] = [];
                            }
                            $ref = &$ref[$part];
                        }
                        $this->traverseDirectory($path);
                    } else {
                        $dirParts = explode('/', trim(str_replace($this->baseDir, '', $dirPath), '/'));
                        $ref = &$this->snapshotsByDate;
                        foreach ($dirParts as $part) {
                            if (!isset($ref[$part])) {
                                $ref[$part] = [];
                            }
                            $ref = &$ref[$part];
                        }
                        $ref[$entry] = str_replace($this->baseDir, '', $dirPath) . '/' . basename($path);
                    }
                }
            }
            closedir($handle);
        }
    }

    private function getHostFromPath($path)
    {
        $parts = explode('/', $path);
        $hostIndex = count($parts) - 2;
        return $parts[$hostIndex];
    }

    private function getDateFromPath($path)
    {
        $parts = explode('/', $path);
        $dateIndex = count($parts) - 3;
        $dateStr = $parts[$dateIndex - 2] . '-' . $parts[$dateIndex - 1] . '-' . $parts[$dateIndex];

        return [
            'year' => $parts[$dateIndex - 2],
            'month' => $parts[$dateIndex - 1],
            'day' => $parts[$dateIndex],
        ];
    }

}
