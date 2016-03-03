<?php namespace App\Http\Controllers;

use App;
use App\Photo;
use App\Http\Requests;
use Input, Auth, Storage;
use App\Services\PhotosSaver;
use App\Services\Photo\Deleter;

class PhotosController extends Controller {

    public function __construct(PhotosSaver $saver, Deleter $deleter)
    {
        $this->middleware('loggedIn', ['except' => 'store']);
        $this->middleware('spaceUsage', ['only' => 'store']);

        $this->saver = $saver;
        $this->deleter = $deleter;
        $this->user = Auth::user();
    }

    /**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        if (Input::get('all') === 'true' && ($this->user->isAdmin || IS_DEMO)) {
            return Photo::withTrashed()->orderBy('updated_at', 'desc')->limit(1000)->get();
        } else {
            return Auth::user()->photos()->get(['name', 'description', 'file_name', 'folder_id', 'id', 'user_id']);
        }
	}

	/**
	 * Find photo with given id.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
        return Auth::user()->photos()->findOrFail($id);
	}

    public function store()
    {
        //store photo from uploaded file
        if (Input::file()) {
            return $this->saver->savePhotos(Input::file(), Input::get('folder'), Input::get('attach_id'));
        }

        //create a new photo from given params
        if (Input::has('width') && Input::has('height')) {
            $fileName = str_random().'.png';

            $model = Auth::user()->photos()->create([
                'width' => Input::get('width'),
                'height' => Input::get('height'),
                'share_id' => str_random(),
                'folder_id' => Input::get('folder_id'),
                'file_name' => $fileName,
                'file_size' => 0,
                'name' => Input::get('name'),
            ]);

            $this->saver->saveFile($model, $fileName, \Image::canvas(Input::get('width'), Input::get('height')));

            $model->file_size = Storage::size($model->getRelativePath());
            $model->save();

            return $model;
        }
    }

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		$photo = Auth::user()->photos()->findOrFail($id);
        $input = Input::all();
        $extension = isset($input['extension']) ? $input['extension'] : $photo->extension;

        if (isset($input['imageData'])) {
            $this->saver->saveFile($photo, $photo->file_name, $input['imageData'], $extension, true);

            //get image file size
            $input['file_size'] = Storage::size($photo->getRelativePath());

            //remove image data from input array so we don't try to save it to database
            unset($input['imageData']);
        }

        unset($input['extension']);
        $photo->update($input);

        return $photo;
	}

    /**
     * Return photos user has recently uploaded or modified.
     *
     * @return mixed
     */
    public function recent()
    {
        return Auth::user()->photos()->orderBy('updated_at', 'desc')->limit(30)->get();
    }
}
