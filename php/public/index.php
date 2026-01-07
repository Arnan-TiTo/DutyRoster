<?php

/*
 |--------------------------------------------------------------------------
 | PHP Version Check
 |--------------------------------------------------------------------------
 */
$minPHPVersion = '8.1';
if (version_compare(PHP_VERSION, $minPHPVersion, '<')) {
    $message = sprintf(
        'Your PHP version must be %s or higher to run CodeIgniter. Current version: %s',
        $minPHPVersion,
        PHP_VERSION
    );
    exit($message);
}

/*
 |--------------------------------------------------------------------------
 | Set the root path
 |--------------------------------------------------------------------------
 */
define('ROOTPATH', realpath(dirname(__DIR__)) . DIRECTORY_SEPARATOR);

/*
 |--------------------------------------------------------------------------
 | Ensure the current directory is pointing to the front controller's directory
 |--------------------------------------------------------------------------
 */
if (getcwd() . DIRECTORY_SEPARATOR !== ROOTPATH) {
    chdir(ROOTPATH);
}

/*
 |--------------------------------------------------------------------------
 | Check for a custom vendor path
 |--------------------------------------------------------------------------
 */
$vendorPath = ROOTPATH . 'vendor/autoload.php';

if (is_file($vendorPath)) {
    require_once $vendorPath;
} else {
    exit('Unable to load dependencies. Run: composer install');
}

/*
 |--------------------------------------------------------------------------
 | Load the bootstrap file
 |--------------------------------------------------------------------------
 */
require ROOTPATH . 'app/Config/Paths.php';
$paths = new Config\Paths();

require ROOTPATH . 'system/bootstrap.php';

// Start the application
$app = Config\Services::codeigniter();
$app->initialize();
$context = is_cli() ? 'php-cli' : 'web';
$app->setContext($context);

$app->run();
