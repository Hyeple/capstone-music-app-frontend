import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';
import { FaPlay, FaPause, FaStop } from 'react-icons/fa';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Button } from '@/components/ui/button';

const MusicSheet = () => {
  const location = useLocation();
  const initialXmlData = location.state?.initialXmlData || '';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [xmlData, setXmlData] = useState<string>(initialXmlData);
  const [bpm, setBpm] = useState<number>(100);
  const [key, setKey] = useState<string>('0');
  const [open, setOpen] = useState<boolean>(false);
  const [scoreData, setScoreData] = useState<{ score: number, incorrectParts: string[] }>({ score: 0, incorrectParts: [] });
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const audioPlayer = useRef<AudioPlayer | null>(null);

  const exampleScoreData = {
    score: 85,
    incorrectParts: ['Measure 2, Beat 3', 'Measure 5, Beat 1']
  };

  useEffect(() => {
    audioPlayer.current = new AudioPlayer();
    console.log("AudioPlayer initialized");

    const loadInitialXml = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get('/api/ml/get_xml', {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        const text = response.data;
        await initSheet(text);
      } catch (error) {
        console.error('Error loading initial XML file:', error);
      }
    };

    if (initialXmlData) {
      initSheet(initialXmlData);
    } else {
      loadInitialXml();
    }
  }, [initialXmlData]);

  const initSheet = async (xml: string) => {
    console.log("Initializing sheet with XML data:", xml);
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');
    const keyFifths = xmlDoc.getElementsByTagName('fifths')[0]?.textContent || '0';
    setKey(keyFifths);
    setXmlData(xml);

    if (!osmdRef.current) {
      console.log("Creating new OpenSheetMusicDisplay instance");
      osmdRef.current = new OpenSheetMusicDisplay('score', {
        autoResize: true,
        backend: 'svg'
      });
    }

    try {
      await osmdRef.current.load(xml);
      console.log("Sheet loaded successfully");
      osmdRef.current.render();
      console.log("Sheet rendered successfully");
      audioPlayer.current?.loadScore(osmdRef.current);

      if (osmdRef.current.cursor) {
        osmdRef.current.cursor.show();
        if (osmdRef.current.cursor.cursorElement) {
          osmdRef.current.cursor.cursorElement.style.borderTop = "195px solid red";
        }
      }

      const scoreSvg = document.getElementById('score')?.getElementsByTagName('svg')[0];
      if (scoreSvg) {
        //scoreSvg.style.backgroundColor = 'white';
        scoreSvg.style.color = 'white';
        const setColor = () => {
          const elementsToChange = scoreSvg.querySelectorAll('*');
          elementsToChange.forEach(el => {
            el.setAttribute('fill', 'white');
            el.setAttribute('stroke', 'white');
          });
        };
        setColor();

        const observer = new MutationObserver(setColor);
        observer.observe(scoreSvg, { attributes: true, childList: true, subtree: true });
      }

      // Ensure buttons do not disappear
      const buttonsContainer = document.getElementById('buttons-container');
      if (buttonsContainer) {
        buttonsContainer.style.display = 'flex';
      }
    } catch (error) {
      console.error("Error loading or rendering sheet:", error);
    }
  };

  const handleChangeBpm = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(event.target.value, 10) || 100;
    setBpm(newBpm);
    if (audioPlayer.current) {
      console.log("Setting BPM in AudioPlayer:", newBpm);
      audioPlayer.current.setBpm(newBpm);
    }
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

  const handleCheckScore = async () => {
    try {
      const response = await axios.get('/api/getScore', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = response.data || exampleScoreData;
      setScoreData(data);
      setOpen(true);
    } catch (error) {
      console.error('Error fetching score data:', error);
      setScoreData(exampleScoreData);
      setOpen(true);
    }
  };

  return (
    <div className="bg-gray-500 p-4 h-screen flex flex-col items-center justify-center">
      <div id="buttons-container" className="flex justify-around items-center mt-4">
        <Button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-5 flex items-center" onClick={() => {
          console.log("Play button clicked");
          audioPlayer.current?.play();
        }}>
          <FaPlay className="mr-2" />
          Play
        </Button>
        <Button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-5 flex items-center" onClick={() => {
          console.log("Pause button clicked");
          audioPlayer.current?.pause();
        }}>
          <FaPause className="mr-2" />
          Pause
        </Button>
        <Button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-5 flex items-center" onClick={() => {
          console.log("Stop button clicked");
          audioPlayer.current?.stop();
        }}>
          <FaStop className="mr-2" />
          Stop
        </Button>
      </div>
      <div className="mt-4 flex items-center">
        <span className="text-white mr-2">bpm:</span>
        <input type="number" value={bpm} onChange={handleChangeBpm} className="text-black" />
        <span className="text-white ml-4 mr-2">key:</span>
        <select value={key} onChange={handleChangeKey} className="ml-2 text-black">
          <option value="-3">-3</option>
          <option value="-2">-2</option>
          <option value="-1">-1</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
        </select>
      </div>
      <div className="mt-4 flex items-center">
        <button className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded" onClick={handleCheckScore}>Check Score</button>
      </div>
      <div id="score" className="mt-4 w-full h-full"></div>

      <Modal open={open} onClose={() => setOpen(false)} center>
        <h2 className="text-2xl font-bold mb-4 text-black">Practice Score</h2>
        <p className="mb-2 text-black">Score: {scoreData.score}</p>
        <h3 className="text-xl font-bold mb-2 text-black">Incorrect Parts:</h3>
        <ul className="list-disc list-inside text-black">
          {scoreData.incorrectParts.map((part, index) => (
            <li key={index}>{part}</li>
          ))}
        </ul>
      </Modal>
    </div>
  );
};

export default MusicSheet;
