import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { DetailsHeader, Error, Loader, RelatedSongs, YoutubeVideo } from '../components';

import { setActiveSong, playPause } from '../redux/features/playerSlice';
import { useGetSongDetailsQuery, useGetSongRelatedQuery, useGetYoutubeVideoQuery } from '../redux/services/shazamCore';
import { addFavorite } from '../redux/features/favoriteSlice';
import { Button } from '@/components/ui/button';

const SongDetails = () => {
  const dispatch = useDispatch();
  const { songid, id: artistId } = useParams();
  const { activeSong, isPlaying } = useSelector((state) => state.player);

  const { data, isFetching: isFetchingRelatedSongs, error } = useGetSongRelatedQuery({ songid });
  const { data: songData, isFetching: isFetchingSongDetails } = useGetSongDetailsQuery({ songid });
  const { data: youtubeData, isFetching: isFetchingYoutubeVideo } = useGetYoutubeVideoQuery({ songid: songData?.key, name: songData?.title });

  if (isFetchingSongDetails && isFetchingRelatedSongs && isFetchingYoutubeVideo) return <Loader title="Searching song details and video" />;

  if (error) return <Error />;

  console.log(songData);

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

  const limitedRelatedSongs = data ? data.slice(0, 10) : [];

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-start">
        <div className="flex-1">
          <DetailsHeader artistId={artistId} songData={songData} />
          <YoutubeVideo videoData={youtubeData} className="w-full h-auto my-4" />
          <Button onClick={handleAddToFavorites} className="mt-4 self-end">Add to Favorites</Button>
          <Button className="mt-4 self-end">Make MusicSheet</Button>
          <Button className="mt-4 self-end">Pratice</Button>
        </div>
        <div className="flex-1 ml-10">
          <RelatedSongs
            data={limitedRelatedSongs}
            artistId={artistId}
            isPlaying={isPlaying}
            activeSong={activeSong}
            handlePauseClick={handlePauseClick}
            handlePlayClick={handlePlayClick}
          />
        </div>
      </div>
    </div>
  );
};

export default SongDetails;
