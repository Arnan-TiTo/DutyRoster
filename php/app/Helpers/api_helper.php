<?php

if (!function_exists('json_success')) {
    /**
     * Standard JSON success response
     *
     * @param mixed $data
     * @param int $status
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    function json_success($data = null, int $status = 200)
    {
        $response = ['ok' => true];

        if ($data !== null) {
            if (is_array($data) && isset($data['data'])) {
                $response = array_merge($response, $data);
            } else {
                $response['data'] = $data;
            }
        }

        return service('response')
            ->setJSON($response)
            ->setStatusCode($status);
    }
}

if (!function_exists('json_error')) {
    /**
     * Standard JSON error response
     *
     * @param string $message
     * @param int $status
     * @param mixed $details
     * @return \CodeIgniter\HTTP\ResponseInterface
     */
    function json_error(string $message, int $status = 400, $details = null)
    {
        $response = [
            'ok' => false,
            'message' => $message,
        ];

        if ($details !== null) {
            $response['details'] = $details;
        }

        return service('response')
            ->setJSON($response)
            ->setStatusCode($status);
    }
}

if (!function_exists('validate_request')) {
    /**
     * Validate request data
     *
     * @param array $rules
     * @param array $data
     * @return array|null Returns null if valid, error array if invalid
     */
    function validate_request(array $rules, array $data = null)
    {
        $validation = service('validation');

        if ($data === null) {
            $data = service('request')->getJSON(true) ?? service('request')->getPost();
        }

        $validation->setRules($rules);

        if (!$validation->run($data)) {
            return $validation->getErrors();
        }

        return null;
    }
}

if (!function_exists('get_uuid')) {
    /**
     * Generate UUID v4
     *
     * @return string
     */
    function get_uuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
        $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}
