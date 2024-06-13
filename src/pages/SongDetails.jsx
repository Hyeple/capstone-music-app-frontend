import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
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
  const [model, setModel] = useState('');
  const [instrumentType, setInstrumentType] = useState('');
  const [instrumentOptions, setInstrumentOptions] = useState([]);
  const [showDropdowns, setShowDropdowns] = useState(false);
  const [videoId, setVideoId] = useState('');

  useEffect(() => {
    if (additionalSongData && additionalSongData.resources && additionalSongData.resources.lyrics) {
      const firstLyricKey = Object.keys(additionalSongData.resources.lyrics)[0];
      const lyrics = additionalSongData.resources.lyrics[firstLyricKey].attributes.text;
      setLyricData(lyrics);
    }
  }, [additionalSongData]);

  useEffect(() => {
    if (model === '4stem') {
      setInstrumentOptions(['Guitar', 'Vocal', 'Drum', 'Bass']);
    } else if (model === '5stem') {
      setInstrumentOptions(['Guitar', 'Vocal', 'Drum', 'Bass', 'Piano']);
    } else {
      setInstrumentOptions([]);
    }
    setInstrumentType('');
  }, [model]);

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

  const handleShowDropdowns = () => {
    setShowDropdowns(!showDropdowns);
  };

  const handleMakeItClick = async () => {
    console.log(`Model: ${model}, Instrument Type: ${instrumentType}, Video ID: ${videoId}`);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.post('/api/sheet/generate', {
        model,
        instrumentType,
        videoId,
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Server response:', response.data);
    } catch (error) {
      console.error('Error sending data to the server:', error);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-start">
        <div className="flex-1">
          <DetailsHeader artistId={artistId} songData={songData} />
          <YoutubeVideo videoData={youtubeData} onVideoIdExtracted={setVideoId} className="w-full h-auto my-4" />
          {lyricData.length > 0 && (
            <div className="mt-4 bg-gray-800 text-white p-4 rounded-md">
              {lyricData.map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          )}
        </div>
        <div className="mt-10">
          <h2 className="font-bold text-3xl ml-4 mb-4">Make MusicSheet</h2>
          <div className="p-4  rounded bg-gray-800 text-white space-y-4 w-128 ml-5">
            <select value={model} onChange={(e) => setModel(e.target.value)} className="p-2 mb-4 rounded w-full bg-gray-500 text-white">
              <option value="">Select Model</option>
              <option value="4stem">4stem</option>
              <option value="5stem">5stem</option>
            </select>
            {model && (
              <select value={instrumentType} onChange={(e) => setInstrumentType(e.target.value)} className="p-2 border rounded w-full bg-gray-500 text-white">
                <option value="">Instrument</option>
                {instrumentOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}
            <div className="flex justify-end">
              <Button onClick={handleMakeItClick} disabled={!model || !instrumentType} className="bg-gray-500 text-white mt-4">Make it!</Button>
            </div>
          </div>
          <div className="flex-1 ml-5 mt-10 text-base">
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
