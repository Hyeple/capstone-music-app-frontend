import React from 'react';

const YoutubeVideo = ({ videoData }) => {
  if (!videoData || !videoData.actions || !videoData.actions[0].uri) {
    return <div>No video found</div>;
  }

  // URL 객체를 사용하여 비디오 ID 추출
  const videoUrl = new URL(videoData.actions[0].uri);
  const videoId = videoUrl.pathname.split('/')[1]; // 'https://youtu.be/sH1W7XU8Sh8' 형식의 링크를 처리

  // 비디오 ID가 없다면 에러 메시지 출력
  if (!videoId) {
    return <div>Invalid video ID</div>;
  }

  const videoSrc = `https://www.youtube.com/embed/${videoId}?&enablejsapi=1`; // 'enablejsapi=1'은 YouTube IFrame Player API를 활성화

  return (
    <div className="video-container">
      <iframe
        width="40%"
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
