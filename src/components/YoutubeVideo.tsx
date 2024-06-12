import React, { useEffect } from 'react';

const YoutubeVideo = ({ videoData, onVideoIdExtracted }) => {
  if (!videoData || !videoData.actions || !videoData.actions[0].uri) {
    return <div>No video found</div>;
  }

  const videoUrl = new URL(videoData.actions[0].uri);
  const videoId = videoUrl.pathname.split('/')[1];

  useEffect(() => {
    if (videoId) {
      console.log(videoId);
      onVideoIdExtracted(videoId);
    }
  }, [videoId, onVideoIdExtracted]);

  if (!videoId) {
    return <div>Invalid video ID</div>;
  }

  const videoSrc = `https://www.youtube.com/embed/${videoId}?&enablejsapi=1`;

  return (
    <div className="video-container">
      <iframe
        width="90%"
        height="500px"
        src={videoSrc}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default YoutubeVideo;
