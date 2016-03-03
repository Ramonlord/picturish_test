<?php namespace App\Services;

use App\User;
use App\Photo;
use App\Folder;
use Storage, Image;

class DemoContentCreator {

    public function create(User $user)
    {
        $rootFolder = $user->folders->first();
        $this->createPhotosForFolder('root', $user, $rootFolder);

        $winter = Folder::create(['name' => 'Winter', 'description' => 'Photos of the winter.', 'user_id' => $user->id, 'share_id' => str_random(20)]);
        $this->createPhotosForFolder('winter', $user, $winter);

        $summer = Folder::create(['name' => 'Summer', 'description' => 'Photos of the summer.', 'user_id' => $user->id, 'share_id' => str_random(20)]);
        $this->createPhotosForFolder('summer', $user, $summer);

        $spring = Folder::create(['name' => 'Spring', 'description' => 'Photos of the spring.', 'user_id' => $user->id, 'share_id' => str_random(20)]);
        $this->createPhotosForFolder('spring', $user, $spring);

        $fall = Folder::create(['name' => 'Fall', 'description' => 'Photos of the fall.', 'user_id' => $user->id, 'share_id' => str_random(20)]);
        $this->createPhotosForFolder('fall', $user, $fall);

        Folder::create(['name' => 'Holidays', 'description' => 'Photos of the holidays.', 'user_id' => $user->id, 'share_id' => str_random(20)]);
    }

    private function createPhotosForFolder($folderName, User $user, Folder $folder)
    {
        $photos = Storage::files("demo-photos/$folderName");

        foreach($photos as $photo) {
            if (str_contains($photo, 'Thumbs.db')) continue;

            //create model
            $dimensions = getimagesize($photo);
            $fileName   = str_random(10).'.jpg';

            $model = Photo::create([
                'file_name' => $fileName,
                'share_id'  => str_random(20),
                'name'      => basename($photo),
                'folder_id' => $folder->id,
                'file_size' => filesize($photo),
                'width'     => $dimensions[0],
                'height'    => $dimensions[1],
                'user_id'   => $user->id,
            ]);

            $path  = 'uploads/'.$user->id.'/'.$model->id.'/';
            $image = Image::make($photo);

            //save image in original size and extension
            if (Storage::copy($photo, $path.$fileName)) {

                //create original image that will not be affected by editor modifications
                Storage::copy($photo, $path.'original.'.$fileName);

                //create a large thumbnail file
                $largeThumb = $path.'large.'.$fileName;
                Storage::put($largeThumb, (string) $image->fit(300, 200, null, 'top')->encode('jpg'));


                //create a medium thumbnail file
                $mediumThumb = $path.'medium.'.$fileName;
                Storage::put($mediumThumb, (string) $image->fit(160, 160, null, 'top')->encode('jpg'));

                //create a small thumbnail file
                $smallThumb = $path.'small.'.$fileName;
                Storage::put($smallThumb, (string) $image->fit(32, 32, null, 'top')->encode('jpg'));
            }
        }
    }
}
