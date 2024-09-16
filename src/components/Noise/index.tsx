import * as styles from './Noise.module.css';
import { observer } from 'mobx-react-lite';
import state from '../../stores/state';
import {
  CalciteLabel,
  CalciteLoader,
  CalciteSegmentedControl,
  CalciteSegmentedControlItem,
  CalciteSwitch
} from '@esri/calcite-components-react';
import '@esri/calcite-components/dist/components/calcite-loader';
import '@esri/calcite-components/dist/components/calcite-switch';
import '@esri/calcite-components/dist/components/calcite-label';
import '@esri/calcite-components/dist/components/calcite-segmented-control';
import '@esri/calcite-components/dist/components/calcite-segmented-control-item';
import { getView } from '../Map/view';
import { useEffect, useRef, useState } from 'react';

const mapVolume = (value: number): number => {
  if (value === 0) return 0;
  if (value < 35) return 0.1;
  if (value > 60) return 1;
  return (value - 30) / (60 - 30);
};

export const Noise = observer(() => {
  const { viewLoaded } = state;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [layer, setLayer] = useState<__esri.VoxelLayer>(null);
  const [volume, setVolume] = useState<number>(0);
  const [color, setColor] = useState<Array<number>>([0, 0, 0, 0]);
  const [allowSound, setAllowSound] = useState<boolean>(false);

  useEffect(() => {
    if (audioRef.current) {
      if (allowSound) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [allowSound, audioRef]);

  useEffect(() => {
    if (audioRef.current) {
      console.log(audioRef.current.volume, volume);
      audioRef.current.volume = mapVolume(volume);
    }
  }, [volume, audioRef]);

  useEffect(() => {
    if (viewLoaded) {
      const view = getView();
      const voxelLayer = view.map.layers.find(
        (layer) => layer.title === 'zurich_noise_day_night_test'
      ) as __esri.VoxelLayer;
      setLayer(voxelLayer);
      view.on('pointer-move', (evt: __esri.ViewPointerMoveEvent) => {
        view.hitTest(evt, { include: [voxelLayer] }).then((result) => {
          if (result.results && result.results.length > 0) {
            const attr = result.results[0].graphic.attributes;
            console.log(attr);
            const volume = parseInt(attr['Voxel.ServiceValue']);
            const color = voxelLayer
              .getColorForContinuousDataValue(voxelLayer.currentVariableId, volume, false)
              .toRgba();
            setVolume(volume);
            setColor(color);
          } else {
            setVolume(0);
            setColor([0, 0, 0, 0]);
          }
        });
      });
    }
  }, [viewLoaded]);

  return (
    <div className={styles.container}>
      {!viewLoaded ? (
        <CalciteLoader label='Loading data..'></CalciteLoader>
      ) : (
        <>
          <CalciteSegmentedControl
            width='full'
            onCalciteSegmentedControlChange={(evt) => {
              if (layer) {
                const variableId = parseInt(evt.target.value);
                layer.currentVariableId = variableId;
              }
            }}
          >
            <CalciteSegmentedControlItem value='0'>Day</CalciteSegmentedControlItem>
            <CalciteSegmentedControlItem value='1'>Night</CalciteSegmentedControlItem>
          </CalciteSegmentedControl>
          <div
            className={styles.indicator}
            style={{
              backgroundColor: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`
            }}
          >
            {volume} dB
          </div>
          <audio ref={audioRef} autoPlay loop>
            <source src='./assets/CityNoise.mp3' type='audio/mp3'></source>
          </audio>
          <CalciteLabel layout='inline-space-between'>
            Sound on
            <CalciteSwitch onCalciteSwitchChange={(evt) => setAllowSound(evt.target.checked)}></CalciteSwitch>
          </CalciteLabel>
        </>
      )}
    </div>
  );
});
