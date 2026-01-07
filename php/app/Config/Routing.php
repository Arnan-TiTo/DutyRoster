<?php

namespace Config;

use CodeIgniter\Config\Routing as BaseRouting;

/**
 * Routing Configuration
 */
class Routing extends BaseRouting
{
    /**
     * Default Namespace
     *
     * Default namespace for Controllers if none is specified.
     */
    public string $defaultNamespace = 'App\Controllers';

    /**
     * Default Controller
     */
    public string $defaultController = 'Home';

    /**
     * Default Method
     */
    public string $defaultMethod = 'index';

    /**
     * Translate URI Dashes
     *
     * Determines whether dashes in controller & method segments
     * should be automatically replaced by underscores.
     */
    public bool $translateURIDashes = false;

    /**
     * Override HTTP Method
     *
     * Set to enable support for emulated HTTP methods when
     * your server doesn't support the all HTTP methods.
     */
    public bool $override404 = true;

    /**
     * Auto Route
     *
     * Enable auto-routing.
     */
    public bool $autoRoute = false;

    /**
     * URI Protocol
     *
     * Determines which method to use to fetch the URI.
     */
    public string $uriProtocol = 'REQUEST_URI';

    /**
     * Allowed URL Characters
     *
     * A regex to determine which characters are allowed in the URI.
     */
    public string $permittedURIChars = 'a-z 0-9~%.:_\-@';

    /**
     * Default Locale
     */
    public ?string $defaultLocale = null;
}
