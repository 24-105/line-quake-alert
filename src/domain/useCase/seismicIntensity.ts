import { SeismicIntensityScale } from 'src/domain/enum/common/seismicIntensity';

/**
 * Convert seismicIntensity scale to corresponding enum value
 * @param seismicIntensity seismicIntensity scale
 * @returns corresponding enum value or null if not found
 */
export const convertSeismicIntensityToNumber = (
  seismicIntensity: string,
): number | null => {
  const seismicIntensityEnum =
    SeismicIntensityScale[
      seismicIntensity as keyof typeof SeismicIntensityScale
    ];
  return seismicIntensityEnum !== undefined ? seismicIntensityEnum : null;
};

/**
 * Convert seismicIntensity enum value to corresponding scale
 * @param seismicIntensityEnum seismicIntensity enum value
 * @returns corresponding scale or null if not found
 */
export const convertSeismicIntensityToString = (
  seismicIntensityEnum: number,
): string | null => {
  const seismicIntensity = SeismicIntensityScale[seismicIntensityEnum];
  return seismicIntensity !== undefined ? seismicIntensity : null;
};
