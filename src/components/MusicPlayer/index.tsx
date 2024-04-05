// MusicPlayer.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store'; // 실제 경로에 맞게 조정 필요
import { nextSong, prevSong, playPause } from '../../redux/features/playerSlice';
import Controls from './Controls';
import Player from './Player';
import Seekbar from './Seekbar';
import Track from './Track';
import VolumeBar from './VolumeBar';

const MusicPlayer = () => {
  const { activeSong, currentSongs, currentIndex, isActive, isPlaying } = useSelector((state: RootState) => state.player);
  const [duration, setDuration] = useState(0);
  const [seekTime, setSeekTime] = useState(0);
  const [appTime, setAppTime] = useState(0);
  const [volume, setVolume] = useState(0.3);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (currentSongs.length) dispatch(playPause(true));
  }, [currentIndex, dispatch, currentSongs.length]);

  const handlePlayPause = () => {
    dispatch(playPause(!isPlaying));
  };

  const handleNextSong = () => {
    const nextIndex = !shuffle ? (currentIndex + 1) % currentSongs.length : Math.floor(Math.random() * currentSongs.length);
    dispatch(nextSong(nextIndex));
  };

  const handlePrevSong = () => {
    const prevIndex = currentIndex === 0 ? currentSongs.length - 1 : currentIndex - 1;
    dispatch(prevSong(prevIndex));
  };

  return (
    <div className="relative px-8 w-full flex items-center justify-between">
      <Track isPlaying={isPlaying} activeSong={activeSong} />
      <div className="flex-1 flex flex-col items-center justify-center">
        <Controls
          isPlaying={isPlaying}
          repeat={repeat}
          setRepeat={setRepeat}
          shuffle={shuffle}
          setShuffle={setShuffle}
          currentSongs={currentSongs}
          handlePlayPause={handlePlayPause}
          handlePrevSong={handlePrevSong}
          handleNextSong={handleNextSong}
        />
        <Seekbar
          value={appTime}
          min="0"
          max={duration}
          onInput={(e: React.ChangeEvent<HTMLInputElement>) => setSeekTime(Number(e.target.value))}
          setSeekTime={setSeekTime}
          appTime={appTime}
        />
        <Player
          activeSong={activeSong}
          volume={volume}
          isPlaying={isPlaying}
          seekTime={seekTime}
          repeat={repeat}
          currentIndex={currentIndex}
          onEnded={handleNextSong}
          onTimeUpdate={(e: React.SyntheticEvent<HTMLAudioElement, Event>) => setAppTime(e.currentTarget.currentTime)}
          onLoadedData={(e: React.SyntheticEvent<HTMLAudioElement, Event>) => setDuration(e.currentTarget.duration)}
        />
      </div>
      <VolumeBar value={volume} min="0" max="1" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVolume(Number(e.target.value))} />
    </div>
  );
};

export default MusicPlayer;
