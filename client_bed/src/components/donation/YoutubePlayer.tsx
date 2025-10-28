import React from 'react';

export default function YouTubePlayer() {
  const videoId = 'Q-sYGd4D8gI';

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1&autoplay=1&mute=1&playsinline=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`;

  return (
    <div className="flex flex-col items-center justify-center bg-white p-4 pt-10 relative">
      <div className="w-full max-w-4xl rounded-lg shadow-lg overflow-hidden">
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            title="YouTube Video Player"
            className="w-full h-full"
            style={{ border: 0 }}
            allow="autoplay; accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
