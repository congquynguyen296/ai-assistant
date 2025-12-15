import { OAuth2Client } from "google-auth-library";

let client;

export const getGoogleClient = () => {
  if (!client) {
    client = new OAuth2Client(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_REDIRECT
    );
  }
  return client;
};
