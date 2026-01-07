<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class Home extends Controller
{
    public function index()
    {
        helper('auth');

        if (is_authenticated()) {
            return redirect()->to('/app');
        }

        return redirect()->to('/login');
    }
}
