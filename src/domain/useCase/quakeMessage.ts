import {
  fetchP2pQuakeHistoryResponseDto,
  QuakeHistoryPoints,
} from 'src/application/dto/quakeHistoryDto';
import { convertSeismicIntensityToString } from 'src/domain/useCase/seismicIntensity';
import { convertToCustomFormat } from 'src/domain/useCase/date';
import { convertDomesticTsunamiToMessage } from 'src/domain/useCase/domesticTsunami';
import { FlexBox } from '@line/bot-sdk/dist/messaging-api/model/models';
import { HTTP_URL } from 'src/config/constants/http';

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
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'text',
            text: `最大${history.earthquake.maxScale ? convertSeismicIntensityToString(history.earthquake.maxScale) : '震度不明'}`,
            size: 'md',
            color: '#4ba7b4',
            flex: 0,
            weight: 'bold',
          },
          {
            type: 'text',
            text: `${convertToCustomFormat(history.earthquake.time)} 発生`,
            size: 'sm',
            color: '#4ba7b4',
            weight: 'bold',
            align: 'end',
            gravity: 'center',
          },
        ],
      },
      {
        type: 'text',
        text: history.earthquake.hypocenter?.name
          ? `${history.earthquake.hypocenter?.name}を震源とした地震が発生しました`
          : '震源が不明な地震が発生しました',
        weight: 'bold',
        size: 'lg',
        margin: 'md',
        offsetStart: 'sm',
        wrap: true,
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
            text: 'Yahoo!天気・災害',
            color: '#aaaaaa',
            size: 'xs',
            align: 'end',
            action: {
              type: 'uri',
              label: 'Yahoo!天気・災害',
              uri: HTTP_URL.YAHOO_WEATHER_JP_EARTHQUAKE,
            },
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
    const scale = `${point.scale ? convertSeismicIntensityToString(point.scale) : '震度不明'}`;
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
        margin: 'xl',
      },
      ...texts,
    ],
  };
};
