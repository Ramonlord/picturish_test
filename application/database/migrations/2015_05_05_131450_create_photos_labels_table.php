<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePhotosLabelsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('photos_labels', function(Blueprint $table)
		{
			$table->increments('id');
            $table->integer('photo_id');
            $table->integer('label_id');
			$table->timestamps();

            $table->index('photo_id');
            $table->index('label_id');
            $table->unique(array('photo_id', 'label_id'));
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('photos_labels');
	}

}
