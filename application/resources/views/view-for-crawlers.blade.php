<!DOCTYPE html>
<html>

    <head>
        <title>Pixie - Image Editor</title>
        <meta charset="UTF-8">


        <title>{{ $model->name }} - {{ $settings->get('siteName') }}</title>
        <meta name="description" content="{{ $model->description ? $model->description : $settings->get('metaDescription') }}" />

        <!-- Schema.org markup for Google+ -->
        <meta itemprop="name" content="{{ $model->name }}">
        <meta itemprop="description" content="{{ $model->description ? $model->description : $settings->get('metaDescription') }}">
        <meta itemprop="image" content="{{ $model->type === 'photo' ? $model->absoluteUrl : $model->photos->first()->absoluteUrl  }}">

        <!-- Twitter Card data -->
        <meta name="twitter:card" content="{{ $model->type === 'photo' ? 'photo' : 'gallery'  }}">
        <meta name="twitter:title" content="{{ $model->name }} - {{ $settings->get('siteName') }}">
        <meta name="twitter:description" content="{{ $model->description ? $model->description : $settings->get('metaDescription') }}">
        <meta name="twitter:url" content="{{ Request::fullUrl() }}">
        <meta name="twitter:image" content="{{ $model->type === 'photo' ? $model->absoluteUrl : $model->photos->first()->absoluteUrl  }}">

        <!-- Open Graph data -->
        <meta property="og:title" content="{{ $model->name }} - {{ $settings->get('siteName') }}" />
        <meta property="og:url" content="{{ Request::fullUrl() }}" />
        <meta property="og:image" content="{{ $model->type === 'photo' ? $model->absoluteUrl : $model->photos->first()->absoluteUrl  }}" />
        <meta property="og:description" content="{{ $model->description ? $model->description : $settings->get('metaDescription') }}" />
        <meta property="og:site_name" content="{{ $settings->get('siteName') }}" />
    </head>

    <body>
        <h1>{{ $model->name }}</h1>
        <h2>{{ $model->description }}</h2>

        @if($model->type === 'photo')
            <img src="{{ $model->absoluteUrl  }}" alt="{{ $model->name }}"/>
        @else
            @foreach($model->photos as $photo)
                <img src="{{ $photo->absoluteUrl  }}" alt="{{ $photo->name }}"/>
            @endforeach
        @endif
    </body>
</html>
