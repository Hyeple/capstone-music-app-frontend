import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { DetailsHeader, Error, Loader, RelatedSongs, YoutubeVideo } from '../components';
import { setActiveSong, playPause } from '../redux/features/playerSlice';
import { useGetSongDetailsQuery, useGetSongRelatedQuery, useGetYoutubeVideoQuery, useGetSongDetails2Query } from '../redux/services/shazamCore';
import { addFavorite } from '../redux/features/favoriteSlice';
import { Button } from '@/components/ui/button';

const SongDetails = () => {
  const dispatch = useDispatch();
  const { songid, id: artistId } = useParams();
  const { activeSong, isPlaying } = useSelector((state) => state.player);

  const { data, isFetching: isFetchingRelatedSongs, error } = useGetSongRelatedQuery({ songid });
  const { data: songData, isFetching: isFetchingSongDetails } = useGetSongDetailsQuery({ songid });
  const { data: youtubeData, isFetching: isFetchingYoutubeVideo } = useGetYoutubeVideoQuery({ songid: songData?.key, name: songData?.title });
  const { data: additionalSongData, isFetching: isFetchingAdditionalDetails } = useGetSongDetails2Query({ songid: songData?.trackadamid });

  const [lyricData, setLyricData] = useState([]);

  useEffect(() => {
    if (additionalSongData && additionalSongData.resources && additionalSongData.resources.lyrics) {
      const firstLyricKey = Object.keys(additionalSongData.resources.lyrics)[0];
      const lyrics = additionalSongData.resources.lyrics[firstLyricKey].attributes.text;
      setLyricData(lyrics);
    }
  }, [additionalSongData]);

  if (isFetchingSongDetails && isFetchingRelatedSongs && isFetchingYoutubeVideo && isFetchingAdditionalDetails) return <Loader title="Searching song details and video" />;

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

  const handleInvisibleClick = () => {
    console.log('Invisible button clicked');
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-start">
        <div className="flex-1">
          <DetailsHeader artistId={artistId} songData={songData} />
          <YoutubeVideo videoData={youtubeData} className="w-full h-auto my-4" />
          <div className="flex justify-end space-x-10 mt-4">
            <Button onClick={handleAddToFavorites} className="self-end">Add to Favorites</Button>
            <Button className="self-end">Make MusicSheet</Button>
            <Button className="self-end">Practice</Button>
            <button onClick={handleInvisibleClick} style={{ opacity: 0, cursor: 'pointer', width: '150px', height: '40px' }}>
              Invisible
            </button>
          </div>
          {lyricData.length > 0 && (
            <div className="mt-4 bg-gray-100 p-4 rounded-md">
              {lyricData.map((line, index) => (
                <p key={index} className="text-gray-800 mb-2">{line}</p>
              ))}
            </div>
          )}
        </div>
        <div className="mt-10">
          <div className="flex-1 ml-10 mt-10 text-base">
            <RelatedSongs
              data={data}
              artistId={artistId}
              isPlaying={isPlaying}
              activeSong={activeSong}
              handlePauseClick={handlePauseClick}
              handlePlayClick={handlePlayClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongDetails;
