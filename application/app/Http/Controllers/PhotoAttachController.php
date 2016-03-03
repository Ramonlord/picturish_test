<?php namespace App\Http\Controllers;

use App\Photo;
use Input, Auth, Storage;
use League\Flysystem\FileExistsException;

class PhotoAttachController extends Controller {

    public function __construct()
    {
        $this->middleware('loggedIn');
    }

    /**
     * Attach photos with given ids to current logged in user.
     *
     * @return string
     */
    public function attach()
    {
        if (Input::has('ids')) {

            //get users root folder id
            $folderId = Auth::user()->folders()->where('name', 'root')->first()->id;

            $photos = Photo::whereIn('attach_id', Input::get('ids'))->whereNull('user_id')->get();

            //move photos to users folder in filesystem
            foreach($photos as $photo) {

                $folderPath = $photo->getRelativePath(true);

                //get all files in photos directory
                $paths = Storage::files($folderPath);

                //move files from no-auth folder to folder named after user id in database
                foreach ($paths as $path) {
                    try {
                        Storage::move($path, str_replace('no-auth', Auth::user()->id, $path));
                    } catch(FileExistsException $e) {
                        //
                    }
                }

                Storage::deleteDirectory($folderPath);
            }

            //attach photos to user in database
            foreach(Input::get('ids') as $id) {
                Photo::where('attach_id', $id)->whereNull('user_id')->update(array('user_id' => Auth::user()->id, 'folder_id' => $folderId));
            }

            if ($number = count($photos)) {
                return trans('app.photoAttachSuccess', ['number' => $number]);
            }
        }
    }
}
