import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Error, Loader, SongCard } from '../components';
import { useGetSongsBySearchQuery } from '../redux/services/shazamCore';

const AroundYou = () => {
  const { activeSong, isPlaying } = useSelector((state) => state.player);
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isFetching, error } = useGetSongsBySearchQuery(searchTerm);

  useEffect(() => {
    const searchTerms = ['beatles', 'coldplay', 'nirvana', 'queen', 'oasis', 'snow patrol', 'muse', 'radiohead', 'green day'];
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    setSearchTerm(randomTerm);
  }, []);

  const songs = data?.tracks?.hits.map((song) => song.track);

  if (isFetching) return <Loader title={`Loading...`} />;

  if (error) return <Error />;

  return (
    <div className="flex flex-col">

      <div className="flex flex-wrap justify-center gap-8">
        {songs.map((song, i) => (
          <SongCard
            key={song.key}
            song={song}
            isPlaying={isPlaying}
            activeSong={activeSong}
            data={data}
            i={i}
          />
        ))}
      </div>
    </div>
  );
};

export default AroundYou;
