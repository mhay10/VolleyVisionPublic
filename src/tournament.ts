import fs from "fs";

export class TournamentManager {
  private dbDir = "tournaments";
  readonly tournaments: Tournament[];

  constructor(dbDir?: string) {
    // Set dbDir if provided
    if (dbDir) this.dbDir = dbDir;

    // Load tournaments from database
    const loadedTournaments = fs.readdirSync(this.dbDir);
    this.tournaments = loadedTournaments.map((tournament) => {
      // Load tournament data from file
      const tournamentData = fs.readFileSync(`${this.dbDir}/${tournament}`);
      const parsed = JSON.parse(tournamentData.toString());

      // Convert ISO strings to dates
      return {
        ...parsed,
        dateStart: new Date(parsed.dateStart),
        dateEnd: new Date(parsed.dateEnd),
        deadline: new Date(parsed.deadline),
      };
    });
  }

  createTournament(tournament: Tournament) {
    this.tournaments.push(tournament);
    this.saveTournaments();
  }

  updateTournament(id: string, newTournament: Tournament) {
    // Find tournament, return if not found
    const index = this.tournaments.findIndex(
      (tournament) => tournament.id === id
    );
    if (index === -1) return;

    // Update tournament
    this.tournaments[index] = newTournament;

    // Save tournaments
    this.saveTournaments();
  }

  saveTournaments() {
    this.tournaments.forEach((tournament) => {
      // Convert dates to ISO strings
      const tournamentData = JSON.stringify({
        ...tournament,
        dateStart: tournament.dateStart.toISOString(),
        dateEnd: tournament.dateEnd.toISOString(),
        deadline: tournament.deadline.toISOString(),
      });

      // Write to file
      fs.writeFileSync(`${this.dbDir}/${tournament.id}.json`, tournamentData);
    });
  }
}

export interface Tournament {
  id: string;
  location: string;
  place: string;
  dateStart: Date;
  dateEnd: Date;
  price: number;
  deadline: Date;
  count: {
    guys: number;
    girls: number;
  };
  people: {
    guys: string[];
    girls: string[];
  };
}
