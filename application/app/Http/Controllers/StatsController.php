<?php namespace App\Http\Controllers;

use App\User;
use App\Photo;

class StatsController extends Controller {

    public function __construct()
    {
        $this->middleware('loggedIn');

        if ( ! IS_DEMO) {
            $this->middleware('admin');
        }
    }

    /**
     * Return site stats for analytics page.
     *
     * @return array
     */
    public function analytics()
	{
        $stats = [];

        $stats['users']  = User::count();
        $stats['photos'] = Photo::count();
        $stats['photos_size'] = Photo::sum('file_size');

        return $stats;
	}
}
