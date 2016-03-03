<?php

namespace App\Services;

use App\Photo;
use Auth, Image, Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class PhotosSaver {

    private $validExtensions = ['png', 'jpg', 'jpeg', 'svg', 'gif'];

    public function savePhotos(array $files, $folderId, $attachId)
    {
        $uploaded = []; $rejected = [];

        foreach ($files as $uploadedFile) {

            //check if file was uploaded properly first as
            //otherwise extension guessing will error out
            if ( ! $uploadedFile->isValid()) {
                $rejected[] = $this->makeClientName($uploadedFile); continue;
            }

            $extension = $uploadedFile->guessExtension();

            if ( ! $this->extensionIsValid($extension)) {
                $rejected[] = $this->makeClientName($uploadedFile); continue;
            }

            $fileName = strtolower(Str::quickRandom()).".$extension";
            $fileModel = $this->createReferenceToPhotoInDB($fileName, $uploadedFile, $folderId, $attachId);

            if ($this->saveFile($fileModel, $fileName, $uploadedFile, $extension)) {
                $uploaded[] = $fileModel;
            } else {
                $fileModel->delete();
            }
        }

        return [ 'uploaded' => $uploaded, 'rejected' => $rejected ];
    }

    /**
     * Save given image to file system and create needed thumbnails for it.
     *
     * @param  \App\Photo  $fileModel
     * @param  string  $fileName
     * @param  \Symfony\Component\HttpFoundation\File\UploadedFile  $uploadedImage
     * @param  string  $extension
     * @param  boolean  $skipOriginal
     *
     * @return string|null
     */
    public function saveFile($fileModel, $fileName, $uploadedImage, $extension = 'png', $skipOriginal = false)
    {
        //path to this image folder
        if (Auth::check()) {
            $path = 'uploads/'.Auth::user()->id.'/'.$fileModel->id.'/';
        } else {
            $path = 'uploads/no-auth/'.$fileModel->id.'/';
        }

        //Intervention doesn't support gif resizing yet so we'll just
        //copy the original file if it's a gif
        if ($extension === 'gif' && ! is_string($uploadedImage)) {

            if ( ! is_dir($path)) {
                mkdir($path);
            }

            copy($uploadedImage->getRealPath(), $path.$fileName);

            return $path.$fileModel->name;
        }

        //save image in original size and extension
        if (Storage::put($path.$fileName, (string) Image::make($uploadedImage)->encode($extension))) {

            //create original image that will not be affected by editor modifications
            if ( ! $skipOriginal) {
                Storage::put($path.'original.'.$fileName, (string) Image::make($uploadedImage)->encode($extension));
            }

            //create a large thumbnail file
            $largeThumb = $path.'large.'.$fileName;
            Storage::put($largeThumb, $this->fitImage($uploadedImage, 300, 200, $extension));

            //create a medium thumbnail file
            $mediumThumb = $path.'medium.'.$fileName;
            Storage::put($mediumThumb, $this->fitImage($uploadedImage, 160, 160, $extension));

            //create a small thumbnail file
            $smallThumb = $path.'small.'.$fileName;
            Storage::put($smallThumb, $this->fitImage($uploadedImage, 32, 32, $extension));

            return $path.$fileModel->name;
        }
    }

    private function fitImage($uploadedImage, $toWidth, $toHeight, $extension)
    {
        $image       = Image::make($uploadedImage);
        $imageWidth  = $image->width();
        $imageHeight = $image->height();

        //if image is alread smaller when the size we need we can bail
        if ($imageWidth <= $toWidth && $imageHeight <= $toHeight) {
            return (string) $image->encode($extension);
        }

        return (string) $image->fit($toWidth, $toHeight, function ($constraint) {
            $constraint->upsize();
        }, 'top')->encode($extension);
    }

    private function createReferenceToPhotoInDB($fileName, $photo, $folderId, $attachId)
    {
        $dimensions = getimagesize($photo);
        preg_match('/(.+?)\./', $fileName, $matches);

        //if we've got no folder id passed attach this upload to users root folder
        if ( ! $folderId && Auth::check()) {
            $folderId = Auth::user()->folders()->where('name', 'root')->first()->id;
        } else if ( ! $folderId) {
            $folderId = null;
        }

        return Photo::create([
            'file_name' => $fileName,
            'share_id'  => $matches[1],
            'name'      => $this->makeTitleFromOriginalName($photo),
            'folder_id' => $folderId,
            'attach_id' => $attachId ? $attachId : null,
            'file_size' => $photo->getClientSize(),
            'width'     => $dimensions[0],
            'height'    => $dimensions[1],
            'user_id'   => Auth::check() ? Auth::user()->id : null,
        ]);
    }

    private function makeTitleFromOriginalName(UploadedFile $photo)
    {
        return e(ucfirst($photo->getClientOriginalName()));
    }

    private function makeClientName(UploadedFile $photo)
    {
        return e($photo->getClientOriginalName());
    }

    private function extensionIsValid($extension)
    {
        return in_array($extension, $this->validExtensions);
    }
}