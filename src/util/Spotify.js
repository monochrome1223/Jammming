const secret = 'ec46fa55d7ec40e49830bbfd00ba1675';
const clientId = 'c0279c6e4a844d7992be47398db54c26'; // Replace with your own Client ID
const redirectUri = encodeURIComponent('http://localhost:3000'); // Replace with your own redirect URI

let accessToken;

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }

    const urlAccessToken = window.location.href.match(/access_token=([^&]*)/);
    const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);

    if (urlAccessToken && urlExpiresIn) {
      accessToken = urlAccessToken[1];
      const expiresIn = urlExpiresIn[1];

      window.setTimeout(() => (accessToken = ''), expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=playlist-modify-public`;
      window.location = accessUrl;
    }
  },

  async search(term) {
    const accessToken = Spotify.getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const jsonResponse = await response.json();
    if (!jsonResponse.tracks) {
      return [];
    }
    return jsonResponse.tracks.items.map((track) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      uri: track.uri,
    }));
  },

  async savePlaylist(name, trackUris) {
    if (!name || !trackUris || trackUris.length === 0) {
      return;
    }

    const accessToken = Spotify.getAccessToken();
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };
    let userId;

    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: headers,
    });
    const jsonResponse = await response.json();
    userId = jsonResponse.id;

    const response_1 = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        name: name,
      }),
    });
    const jsonResponse_1 = await response_1.json();
    const playlistID = jsonResponse_1.id;

    await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
      headers: headers,
      method: 'POST',
      body: JSON.stringify({
        uris: trackUris,
      }),
    });
  },
};

export default Spotify;
