// Compact row format for playlist database expansions.
// Row: [name, curator, followers, extraGenres, moods, submithub, note]
// - extraGenres: "" for none, or pipe-separated tags appended to the bucket genre
//   (e.g. "Trap|R&B" under Hip Hop becomes ["Hip Hop", "Trap", "R&B"]).
// - moods: pipe-separated mood tags, or "All".
// - email is derived from the curator handle: lowercase + @gmail.com
export const rowsToPlaylists = (rows, genre) =>
  rows.map(([name, curator, followers, extraGenres, moods, submithub, note]) => ({
    name,
    curator,
    followers,
    email: `${curator.toLowerCase()}@gmail.com`,
    genres: [genre, ...(extraGenres ? extraGenres.split("|") : [])],
    mood: moods ? moods.split("|") : ["All"],
    submithub: !!submithub,
    note,
  }));