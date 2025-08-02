import React from 'react';

export default function YouTubePlayer() {
  // Extract video ID from the YouTube URL
  const videoId = 'Q-sYGd4D8gI';
  
  // YouTube embed URL with autoplay and other parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&rel=0&modestbranding=1`;

  return (
    <div className="flex flex-col items-center justify-center  bg-white-400 p-4 pt-10 relative">
      {/* Left top logo */}
        {/* <div className="absolute top-4 left-4 z-10">
          <img 
            src="/assets/images/dgr1.webp" 
            alt="Logo 1" 
            className="w-16 h-16 md:w-40 md:h-40 object-contain"
          />
        </div> */}
      
      {/* Right top logo */}
      {/* <div className="absolute top-4 right-4 z-10">
        <img 
          src="/assets/images/dgr2.webp" 
          alt="Logo 2" 
          className="w-16 h-16 md:w-40 md:h-40 object-contain"
        />
      </div> */}

      <div className="w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title="YouTube Video Player"
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}