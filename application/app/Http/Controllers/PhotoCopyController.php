<?php namespace App\Http\Controllers;

use App;
use Auth;
use Image;
use App\Photo;
use App\Services\PhotosSaver;

class PhotoCopyController extends Controller {

    /**
     * Create new PhotoCopyController Instance.
     *
     * @param PhotosSaver $saver
     */
    public function __construct(PhotosSaver $saver)
    {
        $this->middleware('spaceUsage', ['only' => 'copy']);

        $this->saver = $saver;
    }

    /**
     * Create photos matching given share id download response.
     *
     * @param  int|string $id
     * @return Photo
     */
	public function copy($id)
	{
        $photo = Auth::user()->photos()->findOrFail($id);

        $newPhoto = $photo->replicate();
        $fileName = str_random(20).'.'.$photo->extension;

        $newPhoto->share_id = str_random(20);
        $newPhoto->file_name = $fileName;
        $newPhoto->name = $photo->name.' Copy';
        $newPhoto->save();

        $this->saver->saveFile($newPhoto, $fileName, Image::make($photo->absoluteUrl), $photo->extension);

        return $newPhoto;
	}
}
