import {
  convertSeismicIntensityToNumber,
  convertSeismicIntensityToString,
} from 'src/domain/useCase/seismicIntensity';
import { SeismicIntensityScale } from 'src/domain/enum/common/seismicIntensity';

describe('convertSeismicIntensityToNumber', () => {
  it('should return the correct enum value for a valid seismic intensity string', () => {
    expect(convertSeismicIntensityToNumber('震度4')).toBe(
      SeismicIntensityScale.震度4,
    );
  });

  it('should return null for an invalid seismic intensity string', () => {
    expect(convertSeismicIntensityToNumber('INVALID')).toBeNull();
    expect(convertSeismicIntensityToNumber('')).toBeNull();
  });
});

describe('convertSeismicIntensityToString', () => {
  it('should return the correct seismic intensity string for a valid enum value', () => {
    expect(convertSeismicIntensityToNumber('震度4')).toBe(
      SeismicIntensityScale.震度4,
    );
  });

  it('should return null for an invalid enum value', () => {
    expect(convertSeismicIntensityToString(-1)).toBeNull();
    expect(convertSeismicIntensityToString(999)).toBeNull();
  });
});
