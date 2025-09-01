import "./App.css";
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Card,
  Row,
  Alert,
} from "react-bootstrap";
import { useState, useEffect } from "react";

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [error, setError] = useState(""); // <-- new state for error messages

  useEffect(() => {
    let authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };

    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        setAccessToken(data.access_token);
      });
  }, []);

  async function search() {
    setError(""); // clear old errors
    setAlbums([]); // clear old results

    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    try {
      // 🔹 Get Artist
      const artistData = await fetch(
        "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
        artistParams
      ).then((result) => result.json());

      if (!artistData.artists.items.length) {
        setError("No artist found with that name. Please try again!");
        return;
      }

      const artistID = artistData.artists.items[0].id;

      // 🔹 Get Artist Albums
      const albumData = await fetch(
        `https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=US&limit=50`,
        artistParams
      ).then((result) => result.json());

      setAlbums(albumData.items);
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    }
  }

  return (
    <>
      {/* Heading */}
      <Container className="text-center my-4">
        <h1 className="album-hunt-heading">🎵 Album Hunt 🎵</h1>
      </Container>

      {/* Search bar */}
      <Container className="mb-4">
        <InputGroup className="search-bar">
          <FormControl
            placeholder="Search For Artist"
            type="input"
            aria-label="Search for an Artist"
            value={searchInput}
            onKeyDown={(event) => {
              if (event.key === "Enter") search();
            }}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <Button className="search-btn" onClick={search}>
            Search
          </Button>
        </InputGroup>
      </Container>

<br></br>
      {/* 🔹 Error Popup */}
      {error && (
        <div className="custom-alert">
    <span>{error}</span>
    <button className="close-btn" onClick={() => setError("")}>
      &times;
    </button>
  </div>
      )}

      {/* Album Cards */}
      <Container>
        <Row className="album-row">
          {albums.map((album) => (
            <Card className="album-card" key={album.id}>
              <Card.Img className="album-img" src={album.images[0].url} />
              <Card.Body>
                <Card.Title className="album-title">{album.name}</Card.Title>
                <Card.Text className="album-date">
                  Release Date: <br /> {album.release_date}
                </Card.Text>
                <Button
                  className="album-link"
                  href={album.external_urls.spotify}
                  target="_blank"
                >
                  Open in Spotify
                </Button>
              </Card.Body>
            </Card>
          ))}
        </Row>
      </Container>

      <footer className="footer">
        <h5>Made with 🩵 in India</h5>
        <h5>© Vaidehi Goel</h5>
      </footer>
    </>
  );
}

export default App;
