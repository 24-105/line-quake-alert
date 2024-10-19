import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from '@nestjs/class-validator';

import {
  EarthquakeDomesticTsunami,
  EarthquakeForeignTsunami,
} from 'src/domain/enum/quakeHistory/earthquakeEnum';
import {
  IssueType,
  IssueCorrect,
} from 'src/domain/enum/quakeHistory/issueEnum';
import { PointsScale } from 'src/domain/enum/quakeHistory/pointsEnum';

// Quake history issue
export class QuakeHistoryIssue {
  @IsString()
  source?: string;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsNotEmpty()
  @IsString()
  type: IssueType;

  @IsString()
  correct?: IssueCorrect;
}

// Quake history hypocenter
class QuakeHistoryHypocenter {
  @IsString()
  name?: string;

  @IsNumber()
  latitude?: number;

  @IsNumber()
  longitude?: number;

  @IsNumber()
  depth?: number;

  @IsNumber()
  magnitude?: number;
}

// Quake history earthquake
export class QuakeHistoryEarthquake {
  @IsNotEmpty()
  @IsString()
  time: string;

  hypocenter?: QuakeHistoryHypocenter;

  @IsNumber()
  maxScale?: number;

  @IsString()
  domesticTsunami?: EarthquakeDomesticTsunami;

  @IsString()
  foreignTsunami?: EarthquakeForeignTsunami;
}

// Quake history points
export class QuakeHistoryPoints {
  @IsNotEmpty()
  @IsString()
  pref: string;

  @IsNotEmpty()
  @IsString()
  addr: string;

  @IsNotEmpty()
  @IsBoolean()
  isArea: boolean;

  @IsNotEmpty()
  @IsNumber()
  scale: PointsScale;
}

// Quake history comments
export class QuakeHistoryComments {
  @IsNotEmpty()
  @IsString()
  freeFormComment: string;
}

// P2P地震情報 API quake history response Dto
export class fetchP2pQuakeHistoryResponseDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsNumber()
  code: number;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsNotEmpty()
  issue: QuakeHistoryIssue;

  @IsNotEmpty()
  earthquake: QuakeHistoryEarthquake;

  points?: QuakeHistoryPoints[];

  @IsNotEmpty()
  comments: QuakeHistoryComments;
}

// P2P地震情報 API quake history request Dto
export class FetchP2pQuakeHistoryRequestDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  codes: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  limit: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  offset: number;
}
