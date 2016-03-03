<?php

if ( ! App::make('Settings')->get('installed', false)) {
    Route::get('/', 'InstallController@index');
    Route::post('/check-compat', 'InstallController@compat');
    Route::post('/create-db', 'InstallController@createDb');
    Route::post('/create-admin', 'InstallController@createAdmin');
} else {
    Route::get('/', 'HomeController@index');
}

//FOLDERS
Route::resource('folders', 'FoldersController', ['except' => ['destroy', 'create']]);
Route::get('folder/{id}/download', 'FolderDownloadController@download');

//PHOTOS
Route::get('photo/{id}/download', 'PhotoDownloadController@download');
Route::get('photos/recent', 'PhotosController@recent');
Route::post('photos/{id}/copy', 'PhotoCopyController@copy');
Route::post('photo/attach-to-user', 'PhotoAttachController@attach');
Route::resource('photos', 'PhotosController', ['except' => ['destroy', 'create']]);

//DELETE FOLDERS AND PHOTOS
Route::post('delete-items', 'DeleteItemsController@delete');

//TRASH
Route::get('user-trash', 'TrashController@getUserTrash');
Route::post('trash/restore/{id}', 'TrashController@restore');
Route::post('trash/put', 'TrashController@put');

//USERS
Route::get('users/space-usage', 'UsersController@getSpaceUsage');
Route::resource('users', 'UsersController', ['only' => ['update', 'index', 'destroy']]);
Route::post('users', 'UsersController@destroyAll');
Route::post('users/{id}/avatar', 'AvatarController@change');
Route::delete('users/{id}/avatar', 'AvatarController@remove');

//STATS
Route::get('stats', 'StatsController@analytics');

//Settings
Route::post('settings', 'SettingsController@updateSettings');

//ACTIVITY
Route::resource('activity', 'ActivityController', ['only' => ['store', 'index', 'destroy']]);

//SEARCH
Route::get('search/{query}', 'SearchController@findFoldersAndPhotos');

//SOCIAL AUTHENTICATION
Route::get('auth/social/{provider}', 'SocialAuthController@connectToProvider');
Route::get('auth/social/{provider}/login', 'SocialAuthController@loginCallback');
Route::post('auth/social/request-email-callback', 'SocialAuthController@requestEmailCallback');
Route::post('auth/social/connect-accounts', 'SocialAuthController@connectAccounts');

//LABELS
Route::post('labels/attach', 'LabelsController@attach');
Route::post('labels/detach', 'LabelsController@detach');
Route::get('labels/{label}', 'LabelsController@getPhotosLabeled');

//shareable (folder or photo)
Route::post('shareable-password/add', 'ShareableController@addPassword');
Route::post('shareable-password/remove', 'ShareableController@removePassword');
Route::post('shareable-password/check', 'ShareableController@checkPassword');
Route::post('shareable/preview', 'ShareableController@show');

Route::post('password/change', 'Auth\PasswordChangeController@change');

Route::controllers([
	'auth' => 'AuthController',
	'password' => 'Auth\PasswordController',
]);

if (IS_DEMO) {
    Route::get('delete-old-accounts', 'OldAccountsDeleteController@delete');
}

//if html5 push state is enabled catch all urls and redirect to home controller
//TODO: Make sure route is registered with angular before redirecting home
if (App::make('Settings')->get('enablePushState', false)) {

    Route::group(['middleware' => 'prerender'], function () {
        Route::get('view/{type}/{share_id}/{name}', 'HomeController@index');
    });

    Route::any('{all}', 'HomeController@index')->where('all', '.*');
}