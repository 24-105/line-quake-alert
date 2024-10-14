import {
  fetchP2pQuakeHistoryResponseDto,
  QuakeHistoryPoints,
} from 'src/application/dto/quakeHistoryDto';
import { convertSeismicIntensityToString } from './seismicIntensity';
import { convertToCustomFormat } from './date';
import { convertDomesticTsunamiToMessage } from './domesticTsunami';
import { FlexBox } from '@line/bot-sdk/dist/messaging-api/model/models';

/**
 * Create main quake message
 * @param history quake history
 * @returns flex message
 */
export const createMainQuakeMessage = async (
  history: fetchP2pQuakeHistoryResponseDto,
): Promise<FlexBox> => {
  return {
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: `最大震度 ${history.earthquake.maxScale ? convertSeismicIntensityToString(history.earthquake.maxScale) : '不明'}`,
        size: 'sm',
        color: '#4ba7b4',
        flex: 0,
        weight: 'bold',
      },
      {
        type: 'text',
        text: '地震が発生しました',
        weight: 'bold',
        size: 'xl',
        margin: 'md',
        offsetStart: 'sm',
      },
      {
        type: 'separator',
        margin: 'xxl',
      },
      {
        type: 'text',
        text: `${convertToCustomFormat(history.earthquake.time)} 発生`,
        size: 'sm',
        color: '#4ba7b4',
        flex: 0,
        weight: 'bold',
        margin: 'md',
      },
      {
        type: 'text',
        text: `震源 ${history.earthquake.hypocenter?.name || '不明'}`,
        weight: 'bold',
        size: 'xl',
        margin: 'md',
        offsetStart: 'sm',
      },
      {
        type: 'separator',
        margin: 'xxl',
      },
      {
        type: 'box',
        layout: 'vertical',
        margin: 'xxl',
        spacing: 'sm',
        contents: [
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: 'マグニチュード',
                size: 'sm',
                color: '#555555',
                flex: 0,
              },
              {
                type: 'text',
                text: `${history.earthquake.hypocenter?.magnitude || '不明'}`,
                size: 'sm',
                color: '#111111',
                align: 'end',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                size: 'sm',
                color: '#555555',
                flex: 0,
                text: '震源の深さ',
              },
              {
                type: 'text',
                text: `${history.earthquake.hypocenter?.depth ? `${history.earthquake.hypocenter.depth} km` : '不明'}`,
                size: 'sm',
                color: '#111111',
                align: 'end',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                size: 'sm',
                color: '#555555',
                flex: 0,
                text: '緯度',
              },
              {
                type: 'text',
                text: `${history.earthquake.hypocenter?.latitude ? `北緯 ${history.earthquake.hypocenter.latitude} 度` : '不明'}`,
                size: 'sm',
                color: '#111111',
                align: 'end',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                size: 'sm',
                color: '#555555',
                flex: 0,
                text: '経度',
              },
              {
                type: 'text',
                text: `${history.earthquake.hypocenter?.longitude ? `東経 ${history.earthquake.hypocenter.longitude} 度` : '不明'}`,
                size: 'sm',
                color: '#111111',
                align: 'end',
              },
            ],
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: '国内への津波の有無',
                size: 'sm',
                color: '#555555',
                flex: 0,
              },
              {
                type: 'text',
                text: `${history.earthquake.domesticTsunami ? convertDomesticTsunamiToMessage(history.earthquake.domesticTsunami) : '不明'}`,
                size: 'sm',
                color: '#111111',
                align: 'end',
              },
            ],
          },
        ],
      },
      {
        type: 'separator',
        margin: 'xxl',
      },
      {
        type: 'box',
        layout: 'horizontal',
        margin: 'md',
        contents: [
          {
            type: 'text',
            text: '日本気象庁 提供',
            color: '#aaaaaa',
            size: 'xs',
            align: 'end',
          },
        ],
      },
    ],
  };
};

/**
 * Create sub quake message
 * @param points quake history points
 * @returns flex message
 */
export const createSubQuakeMessage = async (
  points: QuakeHistoryPoints[],
): Promise<FlexBox> => {
  const texts: { type: 'text'; text: string; margin: string }[] = [];
  for (const point of points) {
    const area = `${point.pref} ${point.addr}`;
    const scale = `震度 ${point.scale ? convertSeismicIntensityToString(point.scale) : '不明'}`;
    const information = `${area} ${scale}`;
    texts.push({
      type: 'text',
      text: information,
      margin: 'md',
    });
  }

  return {
    type: 'box',
    layout: 'vertical',
    contents: [
      {
        type: 'text',
        text: '対象地域',
        size: 'sm',
        color: '#4ba7b4',
        flex: 0,
        weight: 'bold',
      },
      {
        type: 'separator',
        margin: 'xxl',
      },
      ...texts,
    ],
  };
};
