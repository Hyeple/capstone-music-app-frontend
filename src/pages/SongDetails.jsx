import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { DetailsHeader, Error, Loader, RelatedSongs, YoutubeVideo } from '../components'; // YoutubeVideo 컴포넌트 추가

import { setActiveSong, playPause } from '../redux/features/playerSlice';
import { useGetSongDetailsQuery, useGetSongRelatedQuery, useGetYoutubeVideoQuery } from '../redux/services/shazamCore';
import { addFavorite } from '../redux/features/favoriteSlice';

const SongDetails = () => {
  const dispatch = useDispatch();
  const { songid, id: artistId } = useParams();
  const { activeSong, isPlaying } = useSelector((state) => state.player);

  const { data, isFetching: isFetchingRelatedSongs, error } = useGetSongRelatedQuery({ songid });
  const { data: songData, isFetching: isFetchingSongDetails } = useGetSongDetailsQuery({ songid });
  const { data: youtubeData, isFetching: isFetchingYoutubeVideo } = useGetYoutubeVideoQuery({ songid: songData?.key, name: songData?.title });

  if (isFetchingSongDetails && isFetchingRelatedSongs && isFetchingYoutubeVideo) return <Loader title="Searching song details and video" />;

  console.log(songData);
  console.log(youtubeData);

  if (error) return <Error />;

  const handlePauseClick = () => {
    dispatch(playPause(false));
  };

  const handlePlayClick = (song, i) => {
    dispatch(setActiveSong({ song, data, i }));
    dispatch(playPause(true));
  };

  const handleAddToFavorites = () => {
    dispatch(addFavorite(songData));
  };

  return (
    <div className="flex flex-col">
      <DetailsHeader artistId={artistId} songData={songData} />
      <YoutubeVideo videoData={youtubeData} />
      <button onClick={handleAddToFavorites}>Add to Favorites</button>
      <RelatedSongs
        data={data}
        artistId={artistId}
        isPlaying={isPlaying}
        activeSong={activeSong}
        handlePauseClick={handlePauseClick}
        handlePlayClick={handlePlayClick}
      />
    </div>
  );
};

export default SongDetails;
