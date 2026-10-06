// ─────────────────────────────────────────────────────────────────────────────
// Additional venue expansion batch — second rooms in states already covered.
// Same record shape as the in-page VENUE_DB in GigFinder.jsx. Duplicates
// against earlier lists are filtered out at merge time in GigFinder.
// ─────────────────────────────────────────────────────────────────────────────
export const MORE_VENUES = [
  // ── California ──
  { name: "Great Northern", city: "San Francisco, CA", capacity: 600, genres: ["EDM", "Indie", "Hip Hop", "Rock"], pay: "$250-$800", booking_email: "booking@greatnorthernsf.com", type: "Club", notes: "Divisadero club with a big mezzanine." },
  { name: "Neck of the Woods", city: "San Francisco, CA", capacity: 280, genres: ["Indie", "Rock", "Punk", "Electronic"], pay: "$100-$400", booking_email: "booking@neckofthewoods-sf.com", type: "Club", notes: "Richmond district small stage." },
  { name: "Eli's Mile High Club", city: "Oakland, CA", capacity: 200, genres: ["Punk", "Metal", "Rock", "Indie"], pay: "$75-$300", booking_email: "booking@elsimilehigh.com", type: "Bar/Venue", notes: "Oakland punk dive on Park Boulevard." },
  { name: "Sweetwater Music Hall", city: "Mill Valley, CA", capacity: 500, genres: ["Americana", "Rock", "Jam", "Blues"], pay: "$200-$700", booking_email: "booking@sweetwatermusichall.com", type: "Club", notes: "Marin's revived 1972 room, Grateful Dead lineage." },
  { name: "Rio Theatre", city: "Santa Cruz, CA", capacity: 620, genres: ["Indie", "Rock", "Folk", "Pop"], pay: "$250-$800", booking_email: "booking@riotheatre.com", type: "Theater", notes: "1949 Mission Street theater." },
  { name: "Sierra Nevada Big Room", city: "Chico, CA", capacity: 300, genres: ["Americana", "Rock", "Folk", "Jam"], pay: "$200-$600", booking_email: "booking@sierranevada.com", type: "Bar/Venue", notes: "Brewery's gorgeous acoustic hall." },
  { name: "The Wayfarer", city: "Costa Mesa, CA", capacity: 250, genres: ["Indie", "Folk", "Surf", "Rock"], pay: "$100-$400", booking_email: "booking@thewayfareroc.com", type: "Club", notes: "Tustin Avenue bedroom-stage club." },
  { name: "The Coach House", city: "San Juan Capistrano, CA", capacity: 480, genres: ["Rock", "Blues", "Americana", "Tribute"], pay: "$200-$700", booking_email: "booking@thecoachhouse.com", type: "Club", notes: "Dinner-seating South County legend." },
  { name: "House of Blues Anaheim", city: "Anaheim, CA", capacity: 1000, genres: ["Rock", "Blues", "Hip Hop", "Latin"], pay: "$400-$1500", booking_email: "booking@hob.com", type: "Concert Hall", notes: "GardenWalk national-tour room." },
  { name: "SOMA", city: "San Diego, CA", capacity: 700, genres: ["Rock", "Metal", "Punk", "EDM"], pay: "$250-$800", booking_email: "booking@somasd.com", type: "Club", notes: "All-ages San Diego staple since 1992." },
  { name: "Brick by Brick", city: "San Diego, CA", capacity: 300, genres: ["Metal", "Rock", "Punk", "Reggae"], pay: "$100-$400", booking_email: "booking@brickbybrick.com", type: "Bar/Venue", notes: "Sports Arena-area rock bar." },
  { name: "Molly Malone's", city: "Los Angeles, CA", capacity: 150, genres: ["Singer-Songwriter", "Rock", "Indie", "Blues"], pay: "$75-$300", booking_email: "booking@mollymalones.com", type: "Bar/Venue", notes: "Fairfax Irish pub with a back stage." },
  { name: "Silverlake Lounge", city: "Los Angeles, CA", capacity: 200, genres: ["Indie", "Rock", "Punk", "Garage"], pay: "$75-$300", booking_email: "booking@silverlakelounge.com", type: "Bar/Venue", notes: "Sunset Junction dive for loud bills." },

  // ── Arizona ──
  { name: "The Nash", city: "Phoenix, AZ", capacity: 150, genres: ["Jazz", "Blues", "Soul", "Latin Jazz"], pay: "$100-$400", booking_email: "booking@thenash.org", type: "Club", notes: "Phoenix's dedicated jazz room." },

  // ── Colorado ──
  { name: "Aztlan Theater", city: "Denver, CO", capacity: 500, genres: ["EDM", "Rock", "Hip Hop", "Latin"], pay: "$200-$700", booking_email: "booking@aztlantheater.com", type: "Theater", notes: "Old Lincoln Park movie house, loud shows." },

  // ── Connecticut ──
  { name: "Cafe Nine", city: "New Haven, CT", capacity: 150, genres: ["Blues", "Rock", "Indie", "Punk"], pay: "$50-$200", booking_email: "booking@cafenine.com", type: "Bar/Venue", notes: "State Street's neighborhood clubhouse." },

  // ── Washington DC ──
  { name: "Pie Shop", city: "Washington, DC", capacity: 200, genres: ["Indie", "Punk", "Electronic", "Hip Hop"], pay: "$75-$300", booking_email: "booking@pieshopdc.com", type: "Bar/Venue", notes: "Shaw basement venue and bar." },

  // ── Florida ──
  { name: "Ball & Chain", city: "Miami, FL", capacity: 200, genres: ["Latin", "Jazz", "Salsa", "Blues"], pay: "$100-$400", booking_email: "booking@ballandchain.com", type: "Bar/Venue", notes: "1935 Little Havana courtyard club." },
  { name: "The Anderson", city: "Miami, FL", capacity: 200, genres: ["Electronic", "Indie", "Hip Hop", "Pop"], pay: "$100-$350", booking_email: "booking@theandersonmiami.com", type: "Bar/Venue", notes: "Upper Eastside bar with DJs and bands." },
  { name: "1904 Music Hall", city: "Jacksonville, FL", capacity: 200, genres: ["Indie", "Punk", "Rock", "Metal"], pay: "$75-$250", booking_email: "booking@1904musichall.com", type: "Bar/Venue", notes: "Downtown Jax small touring room." },

  // ── Georgia ──
  { name: "Northside Tavern", city: "Atlanta, GA", capacity: 150, genres: ["Blues", "Jam", "Rock", "Soul"], pay: "$50-$200", booking_email: "booking@northsidetavern.com", type: "Bar/Venue", notes: "Howell Mill blues dive, nightly live." },

  // ── Idaho ──
  { name: "The Reef", city: "Boise, ID", capacity: 400, genres: ["Rock", "Reggae", "Jam", "Hip Hop"], pay: "$150-$500", booking_email: "booking@boisereef.com", type: "Club", notes: "Boise river-district concert hall." },

  // ── Illinois ──
  { name: "Concord Music Hall", city: "Chicago, IL", capacity: 1600, genres: ["EDM", "Hip Hop", "Rock", "Latin"], pay: "$800+", booking_email: "booking@concordmusichall.com", type: "Concert Hall", notes: "Logan Square big-format club." },
  { name: "Fitzgerald's", city: "Berwyn, IL", capacity: 300, genres: ["Americana", "Blues", "Cajun", "Rock"], pay: "$100-$400", booking_email: "booking@fitzgeraldsnightclub.com", type: "Club", notes: "Sidewalk-stage Berwyn institution since 1980." },
  { name: "Reggies", city: "Chicago, IL", capacity: 400, genres: ["Rock", "Metal", "Blues", "Jam"], pay: "$150-$500", booking_email: "booking@reggieslive.com", type: "Bar/Venue", notes: "Record bar, chicken and a rock club." },
  { name: "Bottom Lounge", city: "Chicago, IL", capacity: 700, genres: ["Rock", "Metal", "Indie", "Hip Hop"], pay: "$250-$800", booking_email: "booking@bottomlounge.com", type: "Club", notes: "West Loop venue with a rooftop." },

  // ── Iowa ──
  { name: "The Rhythm Room", city: "Davenport, IA", capacity: 250, genres: ["Blues", "Rock", "Jam", "Americana"], pay: "$75-$300", booking_email: "booking@rhythmiqmusic.com", type: "Bar/Venue", notes: "Quad Cities room on the Mississippi." },

  // ── Kansas / Missouri ──
  { name: "Jackpot Saloon", city: "Lawrence, KS", capacity: 250, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$75-$300", booking_email: "booking@jackpotsaloon.com", type: "Bar/Venue", notes: "Downtown Lawrence venue-bar." },
  { name: "The Uptown Theater", city: "Kansas City, MO", capacity: 1000, genres: ["Jam", "Rock", "Indie", "Funk"], pay: "$400-$1200", booking_email: "booking@uptowntheaterkc.com", type: "Theater", notes: "1928 Spanish-revival parkside theater." },

  // ── Louisiana ──
  { name: "Buffa's", city: "New Orleans, LA", capacity: 150, genres: ["Jazz", "Blues", "Funk", "Brass"], pay: "$75-$250", booking_email: "booking@buffas.com", type: "Bar/Venue", notes: "24-hour Esplanade bar with back-room jazz." },
  { name: "Little Gem Saloon", city: "New Orleans, LA", capacity: 150, genres: ["Jazz", "Blues", "Swing", "Funk"], pay: "$100-$300", booking_email: "booking@littlegemsaloon.com", type: "Club", notes: "Rampart Street jazz supper club." },

  // ── Massachusetts ──
  { name: "Cantab Lounge", city: "Cambridge, MA", capacity: 100, genres: ["Blues", "Folk", "Indie", "Punk"], pay: "$50-$200", booking_email: "booking@cantab-lounge.com", type: "Bar/Venue", notes: "Central Square basement, poetry and blues." },

  // ── Michigan ──
  { name: "Mac's Bar", city: "Lansing, MI", capacity: 150, genres: ["Punk", "Indie", "Rock", "Metal"], pay: "$50-$200", booking_email: "booking@macsbar.com", type: "Bar/Venue", notes: "Michigan Avenue dive with loud shows." },
  { name: "The Machine Shop", city: "Flint, MI", capacity: 800, genres: ["Rock", "Metal", "Hardcore", "Jam"], pay: "$250-$800", booking_email: "booking@theshopflint.com", type: "Concert Hall", notes: "Flint's industrial general-admission hall." },

  // ── Minnesota ──
  { name: "331 Club", city: "Minneapolis, MN", capacity: 120, genres: ["Indie", "Rock", "Country", "Folk"], pay: "$50-$200", booking_email: "booking@331club.com", type: "Bar/Venue", notes: "Northeast corner bar with a tiny stage." },

  // ── Montana ──
  { name: "Pub Station Ballroom", city: "Billings, MT", capacity: 900, genres: ["Rock", "Country", "Metal", "EDM"], pay: "$300-$800", booking_email: "booking@pubstation.com", type: "Club", notes: "Billings' main touring stop downtown." },

  // ── North Carolina ──
  { name: "The ArtsCenter", city: "Carrboro, NC", capacity: 250, genres: ["Folk", "Singer-Songwriter", "Americana", "World"], pay: "$100-$400", booking_email: "booking@artscenterlive.org", type: "Arts Venue", notes: "Nonprofit listening room by Cat's Cradle." },
  { name: "Boone Saloon", city: "Boone, NC", capacity: 200, genres: ["Bluegrass", "Rock", "Jam", "Indie"], pay: "$75-$300", booking_email: "booking@boonesaloon.com", type: "Bar/Venue", notes: "Appalachian State college-town bar." },

  // ── New York ──
  { name: "Towne Crier Cafe", city: "Beacon, NY", capacity: 130, genres: ["Folk", "Americana", "Blues", "Jazz"], pay: "$100-$350", booking_email: "booking@townecrier.com", type: "Club", notes: "Hudson Valley folk supper club." },

  // ── Ohio ──
  { name: "Gilly's", city: "Dayton, OH", capacity: 200, genres: ["Jazz", "Blues", "Soul", "Funk"], pay: "$100-$350", booking_email: "booking@gillysjazz.com", type: "Club", notes: "Dayton's jazz and soul lounge." },

  // ── Oregon ──
  { name: "The Domino Room", city: "Bend, OR", capacity: 200, genres: ["Indie", "Rock", "Punk", "Americana"], pay: "$75-$300", booking_email: "booking@dominoroom.com", type: "Club", notes: "Bend's small-room touring stop." },

  // ── Pennsylvania ──
  { name: "The Fire", city: "Philadelphia, PA", capacity: 250, genres: ["Indie", "Rock", "Folk", "Punk"], pay: "$75-$300", booking_email: "booking@thephillyfire.com", type: "Bar/Venue", notes: "Girard Avenue corner stage." },

  // ── Tennessee ──
  { name: "Lafayette's Music Room", city: "Memphis, TN", capacity: 400, genres: ["Rock", "Blues", "Jam", "Soul"], pay: "$150-$500", booking_email: "booking@lafayettesmemphis.com", type: "Bar/Venue", notes: "Overton Square rooftop-adjacent room." },

  // ── Texas ──
  { name: "Broken Spoke", city: "Austin, TX", capacity: 300, genres: ["Country", "Western Swing", "Honky-Tonk", "Americana"], pay: "$150-$500", booking_email: "booking@brokenspokeaustin.com", type: "Bar/Venue", notes: "1964 honky-tonk, true Texas two-step." },
  { name: "Continental Club Houston", city: "Houston, TX", capacity: 300, genres: ["Rockabilly", "Roots", "Country", "Blues"], pay: "$150-$500", booking_email: "booking@continentalclub.com", type: "Club", notes: "The Austin legend's Houston outpost." },
  { name: "The Rustic", city: "Houston, TX", capacity: 500, genres: ["Country", "Rock", "Americana", "Pop"], pay: "$200-$600", booking_email: "booking@therustic.com", type: "Bar/Venue", notes: "Washington Avenue patio party venue." },
  { name: "Panther Island Pavilion", city: "Fort Worth, TX", capacity: 5000, genres: ["Rock", "EDM", "Country", "Hip Hop"], pay: "$800+", booking_email: "booking@pantherislandpavilion.com", type: "Amphitheater", notes: "Riverfront outdoor stage near downtown." },

  // ── Wisconsin ──
  { name: "Majestic Theatre", city: "Madison, WI", capacity: 600, genres: ["Indie", "EDM", "Hip Hop", "Rock"], pay: "$250-$800", booking_email: "booking@majesticmadison.com", type: "Theater", notes: "1906 King Street theater and club." },
];