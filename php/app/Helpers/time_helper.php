<?php

if (!function_exists('format_thai_date')) {
    /**
     * Format date for Thai locale
     *
     * @param string|DateTime $date
     * @param string $format
     * @return string
     */
    function format_thai_date($date, string $format = 'd/m/Y'): string
    {
        if (is_string($date)) {
            $date = new \DateTime($date);
        }

        return $date->format($format);
    }
}

if (!function_exists('calculate_minutes_between')) {
    /**
     * Calculate minutes between two datetimes
     *
     * @param string|DateTime $start
     * @param string|DateTime $end
     * @return int
     */
    function calculate_minutes_between($start, $end): int
    {
        if (is_string($start)) {
            $start = new \DateTime($start);
        }
        if (is_string($end)) {
            $end = new \DateTime($end);
        }

        $diff = $start->diff($end);
        return ($diff->days * 24 * 60) + ($diff->h * 60) + $diff->i;
    }
}

if (!function_exists('minutes_to_hours')) {
    /**
     * Convert minutes to hours (decimal)
     *
     * @param int $minutes
     * @return float
     */
    function minutes_to_hours(int $minutes): float
    {
        return round($minutes / 60, 2);
    }
}

if (!function_exists('minutes_to_days')) {
    /**
     * Convert minutes to days (8 hours per day)
     *
     * @param int $minutes
     * @param int $hoursPerDay
     * @return float
     */
    function minutes_to_days(int $minutes, int $hoursPerDay = 8): float
    {
        return round($minutes / ($hoursPerDay * 60), 2);
    }
}

if (!function_exists('is_weekend')) {
    /**
     * Check if date is weekend (Saturday or Sunday)
     *
     * @param string|DateTime $date
     * @return bool
     */
    function is_weekend($date): bool
    {
        if (is_string($date)) {
            $date = new \DateTime($date);
        }

        $dayOfWeek = (int) $date->format('w');
        return $dayOfWeek === 0 || $dayOfWeek === 6;
    }
}

if (!function_exists('get_date_range')) {
    /**
     * Get array of dates between start and end
     *
     * @param string|DateTime $start
     * @param string|DateTime $end
     * @return array
     */
    function get_date_range($start, $end): array
    {
        if (is_string($start)) {
            $start = new \DateTime($start);
        }
        if (is_string($end)) {
            $end = new \DateTime($end);
        }

        $dates = [];
        $current = clone $start;

        while ($current <= $end) {
            $dates[] = $current->format('Y-m-d');
            $current->modify('+1 day');
        }

        return $dates;
    }
}
