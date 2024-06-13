// musicUtils.js
import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';
import AudioPlayer from 'osmd-audio-player';

const initSheet = async (xml, osmdRef, setKey, setXmlData, audioPlayer) => {
  console.log('Initializing sheet with XML data:', xml);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xml, 'text/xml');
  const keyFifths = xmlDoc.getElementsByTagName('fifths')[0]?.textContent || '0';
  setKey(keyFifths);
  setXmlData(xml);

  if (!osmdRef.current) {
    console.log('Creating new OpenSheetMusicDisplay instance');
    osmdRef.current = new OpenSheetMusicDisplay('score', {
      autoResize: true,
      backend: 'svg',
    });
  }

  try {
    await osmdRef.current.load(xml);
    console.log('Sheet loaded successfully');
    osmdRef.current.render();
    console.log('Sheet rendered successfully');
    audioPlayer.current?.loadScore(osmdRef.current);

    if (osmdRef.current.cursor) {
      osmdRef.current.cursor.show();
      if (osmdRef.current.cursor.cursorElement) {
        osmdRef.current.cursor.cursorElement.style.borderTop = '195px solid red';
      }
    }

    const scoreSvg = document.getElementById('score')?.getElementsByTagName('svg')[0];
    if (scoreSvg) {
      scoreSvg.style.color = 'white';
      const elementsToChange = scoreSvg.querySelectorAll('*');
      elementsToChange.forEach((el) => {
        el.setAttribute('fill', 'white');
        el.setAttribute('stroke', 'white');
      });
    }
  } catch (error) {
    console.error('Error loading or rendering sheet:', error);
  }
};

export { initSheet };
