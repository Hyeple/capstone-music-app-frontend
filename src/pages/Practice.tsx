import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';

const Practice = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [xmlData, setXmlData] = useState<string>('');
  const [bpm, setBpm] = useState<number>(100);
  const [key, setKey] = useState<string>('0');
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const audioPlayer = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    audioPlayer.current = new AudioPlayer();
  }, []);

  useEffect(() => {
    const loadScore = async () => {
      const response = await axios.get(
        'https://raw.githubusercontent.com/Audiveris/audiveris/2d6796cbdcb263dcfde9ffaad9db861f6f37eb9e/test/cases/01-klavier/target.xml'
      );
      initSheet(response.data);
    };

    loadScore();
  }, []);

  const initSheet = async (xml: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const keyFifths = xmlDoc.getElementsByTagName('fifths')[0]?.textContent || '0';
    setKey(keyFifths);
    setXmlData(xml);

    if (!osmdRef.current) {
      osmdRef.current = new OpenSheetMusicDisplay('score', {
        autoResize: true,
        backend: 'svg'
      });
    }

    await osmdRef.current.load(xml);
    osmdRef.current.render();
    audioPlayer.current?.loadScore(osmdRef.current);

    if (osmdRef.current.cursor) {
      osmdRef.current.cursor.show();
      if (osmdRef.current.cursor.cursorElement) {
        osmdRef.current.cursor.cursorElement.style.borderTop = "195px solid red";
      }
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          initSheet(e.target.result as string);
        }
      };
      reader.readAsText(files[0]);
    }
  };

  const handleChangeBpm = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(event.target.value, 10) || 100;
    setBpm(newBpm);
    audioPlayer.current?.setBpm(newBpm);
  };

  const handleChangeKey = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = event.target.value;
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlData, 'application/xml');
    xmlDoc.getElementsByTagName('fifths')[0].textContent = newKey;
    const newXmlData = new XMLSerializer().serializeToString(xmlDoc);
    initSheet(newXmlData);
    setKey(newKey);
  };

  return (
    <div className="bg-white p-4">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} />
      <div className="flex justify-around items-center mt-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.play()}>Play</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.pause()}>Pause</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.stop()}>Stop</button>
      </div>
      <div className="mt-4">
        <span className="text-black">bpm:</span>
        <input type="number" value={bpm} onChange={handleChangeBpm} className="text-black" />
        <span className="text-black">key:</span>
        <select value={key} onChange={handleChangeKey} className="ml-2 text-black">
          <option value="5">5</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="-1">-1</option>
          <option value="2">2</option>
          <option value="-2">-2</option>
          {/* Add other options similarly */}
          <option value="-6">-6</option>
        </select>
      </div>
      <div id="score" className="mt-4"></div>
    </div>
  );
};

export default Practice;