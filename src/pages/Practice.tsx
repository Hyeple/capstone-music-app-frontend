import React, { useEffect, useRef, useState } from 'react';
import { OpenSheetMusicDisplay } from "opensheetmusicdisplay";
import AudioPlayer from "osmd-audio-player";
import axios from "axios";

const Practice = () => {
  const osmdContainerRef = useRef(null);
  const [audioPlayer, setAudioPlayer] = useState(null);

  useEffect(() => {
    const loadMusicSheet = async () => {
      if (!osmdContainerRef.current) return;

      osmdContainerRef.current.innerHTML = '';

      const osmd = new OpenSheetMusicDisplay(osmdContainerRef.current, {
        drawingParameters: "default",
        drawPartNames: true,
        drawMeasureNumbers: true,
        drawLyrics: true,
        coloringEnabled: true,
        colorStemsLikeNoteheads: true,
      });

      const player = new AudioPlayer();

      try {
        const response = await axios.get(
          "https://raw.githubusercontent.com/Audiveris/audiveris/2d6796cbdcb263dcfde9ffaad9db861f6f37eb9e/test/cases/01-klavier/target.xml"
        );

        await osmd.load(response.data);
        await osmd.render();
        await player.loadScore(osmd);
        osmd.cursor.cursorElement.style.borderTop = "195px solid red";

        player.on("iteration", (notes) => {
          console.log(notes);
        });

        setAudioPlayer(player);
      } catch (error) {
        console.error("Error loading or rendering score", error);
      }
    };

    loadMusicSheet();

    return () => {
      audioPlayer?.stop();
      osmdContainerRef.current.innerHTML = '';
    };
  }, []);

  const play = () => audioPlayer?.play();
  const pause = () => audioPlayer?.pause();
  const stop = () => audioPlayer?.stop();

  

  return (
    <div className="flex flex-col items-center justify-center p-5">
      <div className="relative z-0 w-full max-w-4xl p-5 bg-white shadow-lg">
        <div id="score" ref={osmdContainerRef} className="z-10"></div>
      </div>
      <div className="space-x-4 mt-4">
        <button onClick={play} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 focus:outline-none">Play</button>
        <button onClick={pause} className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none">Pause</button>
        <button onClick={stop} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 focus:outline-none">Stop</button>
      </div>
    </div>
  );
};

export default Practice;
