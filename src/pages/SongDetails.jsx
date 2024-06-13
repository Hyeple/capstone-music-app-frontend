import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';
import { DetailsHeader, Error, Loader, RelatedSongs, YoutubeVideo } from '../components';
import { setActiveSong, playPause } from '../redux/features/playerSlice';
import { useGetSongDetailsQuery, useGetSongRelatedQuery, useGetYoutubeVideoQuery, useGetSongDetails2Query } from '../redux/services/shazamCore';
import { addFavorite } from '../redux/features/favoriteSlice';
import { Button } from '@/components/ui/button';
import { initSheet } from './musicUtils';

const SongDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Use useNavigate hook
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
  const [xmlData, setXmlData] = useState('');
  const [key, setKey] = useState('0');
  const osmdRef = useRef(null);
  const audioPlayer = useRef(new AudioPlayer());

  const dummyXml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
    <score-partwise version="3.1">
      <part-list>
        <score-part id="P1">
          <part-name>Music</part-name>
        </score-part>
      </part-list>
      <part id="P1">
        <measure number="1">
          <attributes>
            <divisions>1</divisions>
            <key>
              <fifths>0</fifths>
            </key>
            <time>
              <beats>4</beats>
              <beat-type>4</beat-type>
            </time>
            <clef>
              <sign>G</sign>
              <line>2</line>
            </clef>
          </attributes>
          <note>
            <pitch>
              <step>C</step>
              <octave>4</octave>
            </pitch>
            <duration>4</duration>
            <type>whole</type>
          </note>
        </measure>
      </part>
    </score-partwise>`;

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

  useEffect(() => {
    const renderDummySheet = async () => {
      await initSheet(dummyXml, osmdRef, setKey, setXmlData, audioPlayer);
    };

    renderDummySheet();
  }, []);

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
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log('Server response:', response.data);
      const xmlData = response.data.xml;
      navigate('/musicsheet', { state: { initialXmlData: xmlData } }); // Navigate to practice page with XML data
    } catch (error) {
      console.error('Error sending data to the server:', error);
      navigate('/musicsheet', { state: { initialXmlData: dummyXml } }); // Navigate to practice page with dummy XML data
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-start">
        <div className="flex-1">
          <DetailsHeader artistId={artistId} songData={songData} />
          <YoutubeVideo videoData={youtubeData} onVideoIdExtracted={setVideoId} className="w-full h-auto my-4" />
          {lyricData.length > 0 && (
            <div className="mt-4 text-white p-4 rounded-md">
              {lyricData.map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          )}
        </div>
        <div className="mt-10">
          <h2 className="font-bold text-3xl ml-4 mb-4">Make MusicSheet</h2>
          <div className="p-4  rounded text-white space-y-4 w-128 ml-5">
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
      <div id="score" className="mt-4 w-full h-full" />
    </div>
  );
};

export default SongDetails;
