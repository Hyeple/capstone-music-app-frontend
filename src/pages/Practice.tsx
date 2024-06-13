import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';
import { Modal } from 'react-responsive-modal';

const Practice = () => {
  const location = useLocation();
  const initialXmlData = location.state?.initialXmlData || '';
  const [xmlData, setXmlData] = useState<string>(initialXmlData);
  const [bpm, setBpm] = useState<number>(100);
  const [key, setKey] = useState<string>('0');
  const [fileSelected, setFileSelected] = useState<boolean>(!!initialXmlData);
  const [loading, setLoading] = useState<boolean>(!initialXmlData);
  const [open, setOpen] = useState<boolean>(false);
  const [scoreData, setScoreData] = useState<{ score: number, incorrectParts: string[] }>({ score: 0, incorrectParts: [] });
  const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
  const audioPlayer = useRef<AudioPlayer | null>(null);

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
    audioPlayer.current = new AudioPlayer();
  }, []);

  useEffect(() => {
    if (initialXmlData) {
      initSheet(initialXmlData);
      setLoading(false);
    } else {
      setLoading(true);
      setTimeout(() => {
        setXmlData(dummyXml);
        initSheet(dummyXml);
        setLoading(false);
      }, 2000);
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

  return (
    <div className="bg-gray500 p-4 h-screen flex flex-col items-center justify-center">
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="loader">Loading...</div>
        </div>
      ) : (
        <>
          <div className="flex justify-around items-center mt-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.play()}>Play</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.pause()}>Pause</button>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={() => audioPlayer.current?.stop()}>Stop</button>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-white mr-2">bpm:</span>
            <input type="number" value={bpm} onChange={(event) => setBpm(parseInt(event.target.value, 10) || 100)} className="text-black" />
            <span className="text-white ml-4 mr-2">key:</span>
            <select value={key} onChange={(event) => setKey(event.target.value)} className="ml-2 text-black">
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
            <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded" onClick={() => setOpen(true)}>Check Score</button>
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
