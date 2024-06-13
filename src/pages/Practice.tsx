import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';
import { FaFileUpload, FaRedo } from 'react-icons/fa';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

const Practice = ({ initialXmlData = '' }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [xmlData, setXmlData] = useState<string>(initialXmlData);
  const [bpm, setBpm] = useState<number>(100);
  const [key, setKey] = useState<string>('0');
  const [fileSelected, setFileSelected] = useState<boolean>(!!initialXmlData);
  const [model, setModel] = useState<string>('4stems');
  const [instrumentType, setInstrumentType] = useState<string>('guitar');
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
  }, []);

  useEffect(() => {
    if (initialXmlData) {
      initSheet(initialXmlData);
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
            scoreSvg.style.color = 'white';
            const elementsToChange = scoreSvg.querySelectorAll('*');
            elementsToChange.forEach(el => {
                el.setAttribute('fill', 'white');
                el.setAttribute('stroke', 'white');
            });
        }
    } catch (error) {
        console.error("Error loading or rendering sheet:", error);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("model", model);
      formData.append('instrumentType', instrumentType);
      const token = localStorage.getItem("token");

      try {
        const response = await axios.post('/api/ml/separate', formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            "Authorization": `Bearer ${token}`
          }
        });
        console.log(response.data);
        setFileSelected(true);

        // 파일 업로드 후 XML 데이터를 가져오는 요청
        const xmlResponse = await axios.get('/api/ml/get_xml', {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        console.log("XML response received:", xmlResponse.data);
        await initSheet(xmlResponse.data);

      } catch (error) {
        console.error("Error uploading file or fetching XML data:", error);
      }
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

  const handleChangeModel = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(event.target.value);
    if (event.target.value === '4stems' && instrumentType === 'piano') {
      setInstrumentType('guitar');
    }
  };

  const handleChangeInstrumentType = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setInstrumentType(event.target.value);
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
    <div className="bg-gray500 p-4 h-screen flex flex-col items-center justify-center">
      {!fileSelected && !initialXmlData && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-500 z-10">
          <label className="cursor-pointer flex flex-col items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            <FaFileUpload className="text-3xl mb-2" />
            Select Music File
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          </label>
          <div className="flex flex-col items-center mt-4">
            <label className="text-white mb-2">Select Model:</label>
            <select value={model} onChange={handleChangeModel} className="text-black mb-4">
              <option value="4stems">4stems</option>
              <option value="5stems">5stems</option>
            </select>
            <label className="text-white mb-2">Select Instrument Type:</label>
            <select value={instrumentType} onChange={handleChangeInstrumentType} className="text-black">
              <option value="guitar">Guitar</option>
              <option value="base">Base</option>
              <option value="vocal">Vocal</option>
              <option value="drum">Drum</option>
              {model === '5stems' && <option value="piano">Piano</option>}
            </select>
            <div className="mt-4 flex items-center">
              <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" onClick={handleCheckScore}>Check Score</button>
            </div>
          </div>
        </div>
      )}
      {(fileSelected || initialXmlData) && (
        <>
          <div className="flex justify-around items-center mt-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.play()}>Play</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.pause()}>Pause</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.stop()}>Stop</button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={() => setFileSelected(false)}>
              <FaRedo className="inline-block mr-2" />
              Change File
            </button>
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
            <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" onClick={handleCheckScore}>Check Score</button>
          </div>
          <div id="score" className="mt-4 w-full h-full"></div>
        </>
      )}

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

export default Practice;
