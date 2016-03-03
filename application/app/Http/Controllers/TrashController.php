<?php namespace App\Http\Controllers;

use App\Photo;
use Auth, Input;
use App\Http\Requests;
use App\Services\Photo\Deleter;

class TrashController extends Controller {

    public function __construct(Deleter $deleter)
    {
        $this->middleware('loggedIn');

        $this->deleter = $deleter;
    }

    /**
     * Return currently logged in users trashed photos.
     *
     * @return Collection
     */
    public function getUserTrash()
    {
        return Auth::user()->photos()->onlyTrashed()->get();
    }

    /**
     * Move give photos to trash.
     *
     * @return mixed
     */
    public function put()
    {
        $ids = Input::get('ids');

        return Photo::whereIn('id', $ids)->where('user_id', Auth::user()->id)->delete();
    }

    /**
     * Restore photo with given id from trash.
     *
     * @param string|int $id
     * @return \App\Photo
     */
    public function restore($id)
    {
        $photo = Auth::user()->photos()->onlyTrashed()->findOrFail($id);

        $photo->restore();

        return $photo;
    }
}
