const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

module.exports = app;

app.get("/players/", async (request, response) => {
  const getPlayersList = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const PlayersArray = await db.all(getPlayersList);
  response.send(
    PlayersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerList = `SELECT * FROM cricket_team WHERE player_Id= ${playerId};`;
  const PlayersArray = await db.get(getPlayerList);
  const finalResult=convertDbObjectToResponseObject(PlayersArray);
  response.send(finalResult)
    )
  );
});

app.post("/players", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerList = `INSERT INTO cricket_team { "playerName", "jerseyNumber", "role" } VALUES ('Vishal', '17', 'Bowler' )`;
  const playersArray = await db.run(addPlayerList);
  response.send("Player Added to Team");
});

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerDetails = `UPDATE cricket_team SET playerName='${playerName}',jerseyNumber='${jerseyNumber}',role='${role} WHERE player_Id = ${playerId};`;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayer = `DELETE FROM cricket_team WHERE player_Id = ${playerId}`;
  db.run(deletePlayer);
  response.send("Player Removed");
});

initializeDBAndServer();
