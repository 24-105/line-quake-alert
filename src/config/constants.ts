// export const QUAKE_HISTORY_VALID_TIME = 60 * 1; // 1 minutes
export const QUAKE_HISTORY_VALID_TIME = 60 * 60 * 24 * 365;
export const QUAKE_ID_VALID_TIME = 60 * 2; // 2 minutes

export const CHANNEL_ACCESS_TOKEN_VALID_TIME = 60 * 60 * 24 * 3; // 3 days
export const JWT_EXPIRATION_TIME = 60 * 60 * 24 * 30; // 30 days

export const PRIVATE_KEY_FILE_PATH = 'key/private.key';
export const ADMIN_PRIVATE_KEY_FILE_PATH = 'key/admin-private.key';

export const P2P_GET_QUAKE_HISTORY_URL = 'https://api.p2pquake.net/v2/history';
export const P2P_GET_QUAKE_HISTORY_CODE = 551;

export const LINE_API_BASE_URL = 'https://api.line.me/';
export const LINE_API_OAUTH_TOKEN_URL = 'https://api.line.me/oauth2/v2.1/token';
export const LINE_API_OAUTH_VERIFY_URL =
  'https://api.line.me/oauth2/v2.1/verify';
export const LINE_API_GET_USER_PROFILE_URL =
  'https://api.line.me/v2/bot/profile/';
export const LINE_API_PUSH_MESSAGE_URL =
  'https://api.line.me/v2/bot/message/push';

export const YAHOO_WEATHER_JP_EARTHQUAKE =
  'https://typhoon.yahoo.co.jp/weather/jp/earthquake/';

export const LINE_SIGNATURE_HEADER = 'x-line-signature';

export const LINE_EVENT_TYPE = {
  MESSAGE: 'message',
  FOLLOW: 'follow',
  UNFOLLOW: 'unfollow',
};

export const LINE_MESSAGE_TYPE = {
  TEXT: 'text',
};

export const RESPONSE_MESSAGE_TRIGGER = {
  WHERE_YOU_LIVE_REGEX:
    /^(北海道|青森県|岩手県|宮城県|秋田県|山形県|福島県|茨城県|栃木県|群馬県|埼玉県|千葉県|東京都|神奈川県|新潟県|富山県|石川県|福井県|山梨県|長野県|岐阜県|静岡県|愛知県|三重県|滋賀県|京都府|大阪府|兵庫県|奈良県|和歌山県|鳥取県|島根県|岡山県|広島県|山口県|徳島県|香川県|愛媛県|高知県|福岡県|佐賀県|長崎県|熊本県|大分県|宮崎県|鹿児島県|沖縄県)を選択しました。$/,
  QUAKE_SEISMIC_INTENSITY_REGEX:
    /^(震度4|震度5弱|震度5強|震度6弱|震度6強)以上を選択しました。$/,
  CONTACT_ME_BY_CHAT_REGEX: /チャットで問い合わせます。$/,
};

export const QUAKE_ALT_MESSAGE = 'お住まいの地域で地震が発生しました。';

export const QUAKE_HISTORY_TABLE_NAME = 'QuakeHistory';
export const CHANNEL_ACCESS_TOKEN_TABLE_NAME = 'ChannelAccessToken';

export const ENCRYPTION_ALGORITHM_AES_256_GCM = 'aes-256-gcm';
export const ENCRYPTION_HASH_ALGORITHM_SHA256 = 'sha256';
export const SIGNATURE_ALGORITHM_RS256 = 'RS256';

export const JWT_FORMAT_COMPACT = 'compact';

export const BASE64 = 'base64';
export const JWT = 'JWT';
export const UTF8 = 'utf8';
export const HEX = 'hex';

export const JAPAN_TIMEZONE = 'Asia/Tokyo';
