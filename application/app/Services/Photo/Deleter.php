<?php namespace App\Services\Photo;

use App\Photo;
use App\Folder;
use Auth, Storage, Exception;

class Deleter {

    /**
     * Move file with given id to trash or delete permanently if already in trash.
     *
     * @param  array $items
     * @return int
     */
    public function delete(array $items)
    {
        $folders = []; $photos = [];

        foreach($items as $item) {
            if ($item['type'] === 'folder') {
                $folders[] = $item;
            } else {
                $photos[] = $item;
            }
        }

        return $this->deletePhotos($photos) + $this->deleteFolders($folders);
    }

    /**
     * Permanently delete given folders and associated photos from db and disk.
     *
     * @param array $folders
     * @return int
     */
    public function deleteFolders(array $folders) {
        if ( ! count($folders)) return 0;

        foreach($folders as $folder) {
            $folder = Folder::with('photos')->findOrFail($folder['id']);

            if ($folder->id === Auth::user()->id || Auth::user()->isAdmin) {

                $photos = $folder->photos;

                //delete all files
                foreach ($photos as $photo) {
                    Storage::deleteDirectory($photo->getRelativePath(true));
                }

                //delete all photos from db
                Photo::whereIn('id', $photos->lists('id'))->forceDelete();

                //delete folder from db
                $folder->forceDelete();
            }
        }

        return count($folders);
    }

    /**
     * Permanently delete given photos from db and disk.
     *
     * @param array $photos
     * @return int
     */
    public function deletePhotos(array $photos) {
        if ( ! count($photos)) return 0;

        foreach($photos as $photo) {
            $photo = Photo::withTrashed()->findOrFail($photo['id']);

            if ($photo->id === Auth::user()->id || Auth::user()->isAdmin) {
                try {
                    Storage::deleteDirectory($photo->getRelativePath(true));
                    $photo->forceDelete();
                } catch (Exception $e) {
                    //
                }
            }
        }

        return count($photos);
    }
}