import { fetchP2pQuakeHistoryResponseDto } from 'src/application/dto/quakeHistoryDto';
import { PointsScale } from '../enum/quakeHistory/pointsEnum';
import { RESPONSE_MESSAGE_TRIGGER } from 'src/config/constants/lineWebhook';

/**
 * Extract prefecture name from received text
 * @param text received text
 * @return extracted prefecture name
 */
export const extractPrefectureName = (text: string): string | null => {
  const match = text.match(RESPONSE_MESSAGE_TRIGGER.WHERE_YOU_LIVE_REGEX);
  return match ? match[1] : null;
};

/**
 * Extract seismic intensity from received text
 * @param text received text
 * @return extracted seismic intensity
 */
export const extractSeismicIntensity = (text: string): string | null => {
  const match = text.match(
    RESPONSE_MESSAGE_TRIGGER.QUAKE_SEISMIC_INTENSITY_REGEX,
  );
  return match ? match[1] : null;
};

/**
 * Extract prefectures by points
 * @param history Quake history object
 * @returns prefectures
 */
export const extractPrefecturesByPoints = async (
  history: fetchP2pQuakeHistoryResponseDto,
): Promise<string[]> => {
  const prefectures: string[] = [];

  if (history.points) {
    history.points
      .filter((point) => point.scale >= PointsScale.SCALE10)
      .forEach((point) => {
        if (!prefectures.includes(point.pref)) {
          prefectures.push(point.pref);
        }
      });
  }

  return prefectures;
};
