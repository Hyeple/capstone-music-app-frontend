import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';
import { FaFileUpload, FaRedo } from 'react-icons/fa';

const Practice = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [xmlData, setXmlData] = useState<string>('');
  const [bpm, setBpm] = useState<number>(100);
  const [key, setKey] = useState<string>('0');
  const [fileSelected, setFileSelected] = useState<boolean>(false);
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const audioPlayer = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    audioPlayer.current = new AudioPlayer();
  }, []);

  useEffect(() => {
    if (!fileSelected) {
      const loadScore = async () => {
        const response = await axios.get('../../src/assets/init.xml');
        initSheet(response.data);
      };

      loadScore();
    }
  }, [fileSelected]);

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

    const scoreSvg = document.getElementById('score')?.getElementsByTagName('svg')[0];
    if (scoreSvg) {
      scoreSvg.style.color = 'white';
      const elementsToChange = scoreSvg.querySelectorAll('*');
      elementsToChange.forEach(el => {
        el.setAttribute('fill', 'white');
        el.setAttribute('stroke', 'white');
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = async (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          initSheet(e.target.result as string);
          setFileSelected(true);
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
    <div className="bg-gray500 p-4 h-screen flex flex-col items-center justify-center">
      {!fileSelected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-500 z-10">
          <label className="cursor-pointer flex flex-col items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            <FaFileUpload className="text-3xl mb-2" />
            Select Music XML File
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      )}
      <div className={`flex justify-around items-center mt-4 ${fileSelected ? 'z-0' : 'hidden'}`}>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.play()}>Play</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.pause()}>Pause</button>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.stop()}>Stop</button>
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => setFileSelected(false)}>
          <FaRedo className="inline-block mr-2" />
          Change File
        </button>
      </div>
      <div className={`mt-4 flex items-center ${fileSelected ? 'z-0' : 'hidden'}`}>
        <span className="text-white mr-2">bpm:</span>
        <input type="number" value={bpm} onChange={handleChangeBpm} className="text-black" />
        <span className="text-white ml-4 mr-2">key:</span>
        <select value={key} onChange={handleChangeKey} className="ml-2 text-black">
          <option value="5">5</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="-1">-1</option>
          <option value="2">2</option>
          <option value="-2">-2</option>
          <option value="-6">-6</option>
        </select>
      </div>
      <div id="score" className="mt-4 w-full h-full"></div>
    </div>
  );
};

export default Practice;
