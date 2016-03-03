<?php namespace App\Http\Controllers;

use Auth;
use Input;

class SearchController extends Controller {

    public function __construct()
    {
        $this->middleware('loggedIn');
    }

    /**
     * Find folders and photos matching given search text.
     *
     * @param string $searchText
     * @return Collection
     */
    public function findFoldersAndPhotos($searchText)
    {
        $folders = Auth::user()->folders()->where('name', 'like', '%'.$searchText.'%')->get();
        $photos = Auth::user()->photos()->where('name', 'like', '%'.$searchText.'%')->get();

        return $folders->merge($photos);
    }
}
