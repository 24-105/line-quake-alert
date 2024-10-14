/**
 * Create request parameters for the fetch channel access token request
 * @param jwt JWT
 * @returns URLSearchParams object
 */
export const createChannelAccessTokenRequestParams = (
  jwt: string,
): URLSearchParams => {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append(
    'client_assertion_type',
    'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
  );
  params.append('client_assertion', jwt);
  return params;
};
