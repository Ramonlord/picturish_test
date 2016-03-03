<?php

use App\Label;
use App\Folder;
use App\Setting;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class DatabaseSeeder extends Seeder {

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		Model::unguard();

		Label::create(['name' => 'favorite']);
        Label::create(['name' => 'trashed']);

        Setting::insert([
            ['name' => 'homeTagline', 'value' => 'Picturish. The new home of your photos.'],
            ['name' => 'homeByline', 'value' => 'Drag and drop anywhere on the homepage to upload and host your images. 5MB Limit. Register or login to access your dashboard, image editor and other features..'],
            ['name' => 'homeButtonText', 'value' => 'Register Now'],
            ['name' => 'homepage', 'value' => 'landing'],
            ['name' => 'validExtensions', 'value' => 'jpg, jpeg, png, gif'],
            ['name' => 'maxFileSize', 'value' => '5'],
            ['name' => 'maxUserSpace', 'value' => 41943040],
            ['name' => 'enableRegistration', 'value' => '1'],
            ['name' => 'siteName', 'value' => 'Picturish'],
            ['name' => 'enableHomeUpload', 'value' => 1],
            ['name' => 'maxSimultUploads', 'value' => 10],
            ['name' => 'enablePushState', 'value' => 0],
            ['name' => 'dateLocale', 'value' => 'en'],
            ['name' => 'pushStateRootUrl', 'value' => '/'],
            ['name' => 'disqusShortname', 'value' => 'pixie'],
        ]);
	}

}
