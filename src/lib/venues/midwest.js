// ─────────────────────────────────────────────────────────────────────────────
// Midwest venue expansion (OH, MI, IN, IL, WI, MN, IA, MO, KS, NE, SD, ND).
// Balanced mix of major rooms and small clubs. Same record shape as the
// in-page VENUE_DB in GigFinder.jsx. Duplicates against earlier lists are
// filtered out at merge time in GigFinder.
// ─────────────────────────────────────────────────────────────────────────────
export const MIDWEST_VENUES = [
  // ── Ohio ──
  { name: "The Bluestone", city: "Columbus, OH", capacity: 600, genres: ["Country", "Rock", "Pop", "Hip Hop"], pay: "$250-$800", booking_email: "booking@thebluestone.com", type: "Club", notes: "Converted 1850s church near OSU." },
  { name: "Newport Music Hall", city: "Columbus, OH", capacity: 1700, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$800+", booking_email: "booking@promowestlive.com", type: "Concert Hall", notes: "America's longest continuously running rock club." },
  { name: "Ace of Cups", city: "Columbus, OH", capacity: 300, genres: ["Indie", "Punk", "Metal", "Rock"], pay: "$100-$400", booking_email: "booking@aceofcupsbus.com", type: "Bar/Venue", notes: "East Franklinton dive with a great stage." },
  { name: "Woodlands Tavern", city: "Columbus, OH", capacity: 300, genres: ["Jam", "Indie", "Americana", "Rock"], pay: "$100-$400", booking_email: "booking@woodlandstavern.com", type: "Bar/Venue", notes: "Grandview fixture for touring bands." },
  { name: "Skully's", city: "Columbus, OH", capacity: 500, genres: ["Indie", "EDM", "Hip Hop", "Rock"], pay: "$200-$600", booking_email: "booking@skullys.org", type: "Club", notes: "High Street club with themed dance nights." },
  { name: "The Basement", city: "Columbus, OH", capacity: 300, genres: ["Rock", "Metal", "Punk", "Indie"], pay: "$150-$500", booking_email: "booking@thebasementcolumbus.com", type: "Club", notes: "Small stage under the Newport complex." },
  { name: "Beachland Ballroom", city: "Cleveland, OH", capacity: 500, genres: ["Indie", "Rock", "Americana", "Punk"], pay: "$200-$700", booking_email: "booking@beachlandballroom.com", type: "Concert Hall", notes: "Cleveland's club-plus-tavern North Shore anchor." },
  { name: "The Grog Shop", city: "Cleveland, OH", capacity: 300, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$150-$500", booking_email: "booking@grogshop.com", type: "Club", notes: "Coventry Street's long-running small room." },
  { name: "House of Blues Cleveland", city: "Cleveland, OH", capacity: 1000, genres: ["Blues", "Rock", "Hip Hop", "R&B"], pay: "$400-$1500", booking_email: "booking@hob.com", type: "Concert Hall", notes: "Flats East Bank national-tour room." },
  { name: "Agora Theatre", city: "Cleveland, OH", capacity: 1000, genres: ["Rock", "Metal", "Punk", "Hip Hop"], pay: "$400-$1200", booking_email: "booking@agoracleveland.com", type: "Concert Hall", notes: "1966 ballroom that broke Metallica and Grand Funk." },
  { name: "Happy Dog", city: "Cleveland, OH", capacity: 200, genres: ["Indie", "Punk", "Experimental", "Rock"], pay: "$75-$300", booking_email: "booking@happydogcleveland.com", type: "Bar/Venue", notes: "Gordon Square hot-dog bar with serious bookings." },
  { name: "Bogart's", city: "Cincinnati, OH", capacity: 1500, genres: ["Rock", "Indie", "Hip Hop", "Metal"], pay: "$500-$2000", booking_email: "booking@bogarts.com", type: "Concert Hall", notes: "Corryville's legendary 1980 room." },
  { name: "The Woodward Theater", city: "Cincinnati, OH", capacity: 300, genres: ["Indie", "Rock", "Americana", "Folk"], pay: "$150-$500", booking_email: "booking@woodwardtheater.com", type: "Theater", notes: "Over-the-Rhine's 1891 storefront theater." },
  { name: "MOTR Pub", city: "Cincinnati, OH", capacity: 200, genres: ["Indie", "Americana", "Rock", "Punk"], pay: "$75-$300", booking_email: "booking@motrpub.com", type: "Bar/Venue", notes: "OTR corner bar, free shows most nights." },
  { name: "Musica", city: "Akron, OH", capacity: 300, genres: ["Indie", "Rock", "Punk", "Metal"], pay: "$100-$400", booking_email: "booking@musicainakron.com", type: "Club", notes: "Akron's modern general-admission room." },
  { name: "The Union", city: "Athens, OH", capacity: 250, genres: ["Indie", "Punk", "Rock", "Jam"], pay: "$75-$300", booking_email: "booking@unionathens.com", type: "Bar/Venue", notes: "OU college town's 1970s music den." },

  // ── Michigan ──
  { name: "Saint Andrew's Hall", city: "Detroit, MI", capacity: 1000, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$400-$1500", booking_email: "booking@andrewsonthehill.com", type: "Concert Hall", notes: "Detroit's premier rock room; Shelter below." },
  { name: "The Shelter", city: "Detroit, MI", capacity: 400, genres: ["Rock", "Punk", "Indie", "Hip Hop"], pay: "$150-$500", booking_email: "booking@theshelterdetroit.com", type: "Club", notes: "Basement stage beneath Saint Andrew's." },
  { name: "El Club", city: "Detroit, MI", capacity: 400, genres: ["Indie", "Punk", "Electronic", "Latin"], pay: "$150-$500", booking_email: "booking@elclubdetroit.com", type: "Club", notes: "Southwest Detroit's modern club with patio." },
  { name: "PJ's Lager House", city: "Detroit, MI", capacity: 250, genres: ["Indie", "Rock", "Country", "Punk"], pay: "$75-$300", booking_email: "booking@lagerhouse.com", type: "Bar/Venue", notes: "Corktown institution near old Tiger Stadium." },
  { name: "Third Man Records Cass Corridor", city: "Detroit, MI", capacity: 200, genres: ["Rock", "Blues", "Country", "Garage"], pay: "$100-$400", booking_email: "booking@thirdmanrecords.com", type: "Arts Venue", notes: "Jack White's record-store blue room." },
  { name: "The Crofoot", city: "Pontiac, MI", capacity: 1000, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$400-$1500", booking_email: "booking@thecrofoot.com", type: "Concert Hall", notes: "Four-stage Pontiac complex." },
  { name: "The Pike Room", city: "Pontiac, MI", capacity: 250, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$100-$350", booking_email: "booking@thecrofoot.com", type: "Club", notes: "The Crofoot's intimate smaller stage." },
  { name: "Pyramid Scheme", city: "Grand Rapids, MI", capacity: 400, genres: ["Rock", "Indie", "Metal", "Comedy"], pay: "$150-$500", booking_email: "booking@pyramidschemebar.com", type: "Club", notes: "Arcade bar with a loud, loyal crowd." },
  { name: "The Intersection", city: "Grand Rapids, MI", capacity: 1700, genres: ["Rock", "Hip Hop", "EDM", "Indie"], pay: "$800+", booking_email: "booking@sectionlive.com", type: "Concert Hall", notes: "Grand Rapids' main national touring stop." },
  { name: "Bell's Eccentric Café", city: "Kalamazoo, MI", capacity: 400, genres: ["Indie", "Rock", "Americana", "Jam"], pay: "$150-$500", booking_email: "booking@bellsbeer.com", type: "Bar/Venue", notes: "Brewery venue with the Upjohn Room." },
  { name: "Kalamazoo State Theatre", city: "Kalamazoo, MI", capacity: 1500, genres: ["Rock", "Indie", "Folk", "Pop"], pay: "$500-$2000", booking_email: "booking@kalamazoostatetheatre.com", type: "Theater", notes: "1927 atmospheric theater downtown." },
  { name: "The Blind Pig", city: "Ann Arbor, MI", capacity: 400, genres: ["Rock", "Indie", "Punk", "Jam"], pay: "$150-$500", booking_email: "booking@blindpignight.com", type: "Club", notes: "Nirvana's Detroit-area stop. Ann Arbor icon." },
  { name: "The Ark", city: "Ann Arbor, MI", capacity: 400, genres: ["Folk", "Singer-Songwriter", "Americana", "Bluegrass"], pay: "$150-$500", booking_email: "booking@theark.org", type: "Club", notes: "Folk sanctuary since 1965." },

  // ── Indiana ──
  { name: "The Vogue", city: "Indianapolis, IN", capacity: 700, genres: ["Rock", "Indie", "Jam", "Pop"], pay: "$250-$800", booking_email: "booking@thevogue.com", type: "Concert Hall", notes: "Broad Ripple's 1938 theater-turned-club." },
  { name: "Hi-Fi", city: "Indianapolis, IN", capacity: 300, genres: ["Indie", "Rock", "Hip Hop", "Electronic"], pay: "$100-$400", booking_email: "booking@hifiindy.com", type: "Club", notes: "Fountain Square's modern small room." },
  { name: "Old National Centre", city: "Indianapolis, IN", capacity: 2400, genres: ["Rock", "Metal", "Pop", "Hip Hop"], pay: "$800+", booking_email: "booking@oldnationalcentre.com", type: "Theater", notes: "Murat Shrine's Egyptian Room and theater." },
  { name: "The Melody Inn", city: "Indianapolis, IN", capacity: 200, genres: ["Punk", "Indie", "Rock", "Jam"], pay: "$75-$250", booking_email: "booking@melodyindy.com", type: "Bar/Venue", notes: "Dive bar hosting punk since 1934." },
  { name: "The Bluebird", city: "Bloomington, IN", capacity: 500, genres: ["Rock", "Indie", "Jam", "Americana"], pay: "$200-$600", booking_email: "booking@thebluebirdnightclub.com", type: "Club", notes: "IU college town's legendary small stage." },
  { name: "The Bishop", city: "Bloomington, IN", capacity: 300, genres: ["Indie", "Rock", "Folk", "Electronic"], pay: "$100-$400", booking_email: "booking@thebishopindy.com", type: "Bar/Venue", notes: "Converted church venue near the square." },
  { name: "The Clyde Theatre", city: "Fort Wayne, IN", capacity: 2200, genres: ["Rock", "Indie", "Metal", "Hip Hop"], pay: "$800+", booking_email: "booking@clydetheatre.com", type: "Concert Hall", notes: "1941 Art Moderne former movie palace." },

  // ── Illinois ──
  { name: "Metro", city: "Chicago, IL", capacity: 1100, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$400-$1500", booking_email: "booking@metrochicago.com", type: "Concert Hall", notes: "Wrigleyville room that broke the Smashing Pumpkins." },
  { name: "Schubas", city: "Chicago, IL", capacity: 165, genres: ["Indie", "Folk", "Singer-Songwriter", "Rock"], pay: "$75-$300", booking_email: "booking@schubas.com", type: "Club", notes: "Tied-house tavern with a famous back room." },
  { name: "Lincoln Hall", city: "Chicago, IL", capacity: 500, genres: ["Indie", "Rock", "Folk", "Pop"], pay: "$200-$700", booking_email: "booking@lincolnhallchicago.com", type: "Club", notes: "Schubas' bigger sibling, superb sound." },
  { name: "Empty Bottle", city: "Chicago, IL", capacity: 250, genres: ["Indie", "Experimental", "Punk", "Jazz"], pay: "$75-$300", booking_email: "booking@emptybottle.com", type: "Bar/Venue", notes: "Ukrainian Village icon for underground bills." },
  { name: "The Hideout", city: "Chicago, IL", capacity: 150, genres: ["Indie", "Alt-Country", "Folk", "Rock"], pay: "$75-$300", booking_email: "booking@hideoutchicago.com", type: "Bar/Venue", notes: "Two-tap shack hideaway, Chicago institution." },
  { name: "Sleeping Village", city: "Chicago, IL", capacity: 340, genres: ["Indie", "Rock", "Punk", "Electronic"], pay: "$150-$500", booking_email: "booking@sleepingvillage.com", type: "Bar/Venue", notes: "Avondale roadhouse with a big patio." },
  { name: "Subterranean", city: "Chicago, IL", capacity: 350, genres: ["Hip Hop", "Indie", "EDM", "Rock"], pay: "$100-$400", booking_email: "booking@subchicago.com", type: "Club", notes: "Wicker Park multi-floor club." },
  { name: "Chop Shop", city: "Chicago, IL", capacity: 400, genres: ["Rock", "Metal", "Punk", "Jam"], pay: "$150-$500", booking_email: "booking@chopshopchicago.com", type: "Bar/Venue", notes: "Wicker Park barbershop-themed venue." },
  { name: "Thalia Hall", city: "Chicago, IL", capacity: 400, genres: ["Indie", "Folk", "Soul", "Rock"], pay: "$200-$600", booking_email: "booking@thaliahallchicago.com", type: "Theater", notes: "1892 Bohemian hall in Pilsen." },
  { name: "Vic Theatre", city: "Chicago, IL", capacity: 1400, genres: ["Rock", "Indie", "EDM", "Hip Hop"], pay: "$500-$2000", booking_email: "booking@victheatre.com", type: "Theater", notes: "Belmont Avenue's 1910 gem." },
  { name: "Park West", city: "Chicago, IL", capacity: 1000, genres: ["Indie", "Rock", "Jazz", "Pop"], pay: "$400-$1500", booking_email: "booking@jamusa.com", type: "Theater", notes: "Lincoln Park seated-plus-GA theater." },
  { name: "Aragon Ballroom", city: "Chicago, IL", capacity: 4900, genres: ["Rock", "EDM", "Hip Hop", "Latin"], pay: "$800+", booking_email: "booking@aragon.com", type: "Concert Hall", notes: "Uptown's celestial-painted ballroom." },
  { name: "Cubby Bear", city: "Chicago, IL", capacity: 1000, genres: ["Rock", "Jam", "Country", "Hip Hop"], pay: "$400-$1200", booking_email: "booking@cubbybear.com", type: "Bar/Venue", notes: "Across from Wrigley Field since 1953." },
  { name: "The Canopy Club", city: "Urbana, IL", capacity: 500, genres: ["Jam", "EDM", "Hip Hop", "Indie"], pay: "$200-$600", booking_email: "booking@canopyclub.com", type: "Club", notes: "UIUC college town's main club." },
  { name: "Space", city: "Evanston, IL", capacity: 250, genres: ["Singer-Songwriter", "Folk", "Jazz", "Americana"], pay: "$100-$400", booking_email: "booking@evanstonspace.com", type: "Arts Venue", notes: "Listening-room showcase north of Chicago." },

  // ── Wisconsin ──
  { name: "The Sylvee", city: "Madison, WI", capacity: 2300, genres: ["Rock", "Indie", "Hip Hop", "Pop"], pay: "$800+", booking_email: "booking@thesylvee.com", type: "Concert Hall", notes: "Madison's 2019 flagship general-admission hall." },
  { name: "High Noon Saloon", city: "Madison, WI", capacity: 400, genres: ["Americana", "Rock", "Jam", "Indie"], pay: "$150-$500", booking_email: "booking@high-noon.com", type: "Bar/Venue", notes: "East side roadhouse with a busy calendar." },
  { name: "The Rave/Eagles Ballroom", city: "Milwaukee, WI", capacity: 3400, genres: ["Rock", "Metal", "EDM", "Hip Hop"], pay: "$800+", booking_email: "booking@therave.com", type: "Concert Hall", notes: "Multi-level complex of ballrooms and halls." },
  { name: "Shank Hall", city: "Milwaukee, WI", capacity: 300, genres: ["Rock", "Metal", "Indie", "Blues"], pay: "$100-$400", booking_email: "booking@shankhall.com", type: "Club", notes: "Named for a Spinal Tap venue. Milwaukee classic." },
  { name: "Turner Hall Ballroom", city: "Milwaukee, WI", capacity: 900, genres: ["Indie", "Rock", "Folk", "Americana"], pay: "$300-$1000", booking_email: "booking@turnerhallballroom.com", type: "Theater", notes: "1863 German-heritage ballroom." },
  { name: "House of Rock", city: "Eau Claire, WI", capacity: 400, genres: ["Rock", "Indie", "Jam", "Americana"], pay: "$150-$500", booking_email: "booking@houseofrockec.com", type: "Bar/Venue", notes: "Bon Iver hometown listening room." },

  // ── Minnesota ──
  { name: "First Avenue", city: "Minneapolis, MN", capacity: 1550, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$800+", booking_email: "booking@first-avenue.com", type: "Concert Hall", notes: "The Purple Rain club. A career milestone." },
  { name: "7th Street Entry", city: "Minneapolis, MN", capacity: 250, genres: ["Indie", "Punk", "Rock", "Hip Hop"], pay: "$100-$350", booking_email: "booking@first-avenue.com", type: "Club", notes: "First Ave's legendary 250-cap side room." },
  { name: "Fine Line Music Café", city: "Minneapolis, MN", capacity: 700, genres: ["Rock", "Indie", "Hip Hop", "R&B"], pay: "$250-$800", booking_email: "booking@finelinemusic.com", type: "Club", notes: "Warehouse District room, renovated 2018." },
  { name: "Amsterdam Bar & Hall", city: "Saint Paul, MN", capacity: 350, genres: ["Indie", "Rock", "Punk", "Brass"], pay: "$150-$500", booking_email: "booking@amsterdambarandhall.com", type: "Bar/Venue", notes: "Lowertown hall with a billiards vibe." },
  { name: "The Turf Club", city: "Saint Paul, MN", capacity: 300, genres: ["Rock", "Americana", "Indie", "Blues"], pay: "$150-$400", booking_email: "booking@turfclub.net", type: "Bar/Venue", notes: "1940s supper club with a clown-lounge basement." },
  { name: "The Cabooze", city: "Minneapolis, MN", capacity: 400, genres: ["Reggae", "Jam", "Rock", "Blues"], pay: "$150-$500", booking_email: "booking@cabooze.com", type: "Bar/Venue", notes: "Cedar-Riverside barn for groove-heavy bills." },
  { name: "Sacred Heart Music Center", city: "Duluth, MN", capacity: 400, genres: ["Folk", "Indie", "Classical", "Americana"], pay: "$150-$500", booking_email: "booking@sacredheartmusic.org", type: "Arts Venue", notes: "1896 cathedral with divine acoustics." },

  // ── Iowa ──
  { name: "Vaudeville Mews", city: "Des Moines, IA", capacity: 250, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$75-$300", booking_email: "booking@vaudevillemews.com", type: "Club", notes: "Small downtown room for underground tours." },
  { name: "The Mill", city: "Iowa City, IA", capacity: 300, genres: ["Folk", "Singer-Songwriter", "Indie", "Jazz"], pay: "$100-$350", booking_email: "booking@ictheatre.com", type: "Club", notes: "Iowa City's listening-room landmark since 1962." },
  { name: "Gabe's", city: "Iowa City, IA", capacity: 200, genres: ["Rock", "Indie", "Punk", "Metal"], pay: "$75-$250", booking_email: "booking@gabesic.com", type: "Bar/Venue", notes: "Oasis Tavern's scruffy descendant." },

  // ── Missouri ──
  { name: "recordBar", city: "Kansas City, MO", capacity: 400, genres: ["Indie", "Rock", "Americana", "Soul"], pay: "$150-$500", booking_email: "booking@therecordbar.com", type: "Club", notes: "Brookside's modern small-stage hub." },
  { name: "Uptown Theater", city: "Kansas City, MO", capacity: 1000, genres: ["Rock", "Indie", "Jam", "Pop"], pay: "$400-$1500", booking_email: "booking@uptowntheater.com", type: "Theater", notes: "1928 Spanish-Moorish movie palace." },
  { name: "The Truman", city: "Kansas City, MO", capacity: 900, genres: ["Indie", "Rock", "Hip Hop", "EDM"], pay: "$400-$1200", booking_email: "booking@thetrumankc.com", type: "Concert Hall", notes: "East Crossroads' ballroom-style club." },
  { name: "The Madrid Theatre", city: "Kansas City, MO", capacity: 700, genres: ["Latin", "Rock", "Pop", "R&B"], pay: "$250-$800", booking_email: "booking@madridtheatre.com", type: "Theater", notes: "Argentine-neighborhood restored 1925 movie house." },
  { name: "Knuckleheads", city: "Kansas City, MO", capacity: 900, genres: ["Americana", "Blues", "Rock", "Country"], pay: "$300-$800", booking_email: "booking@knuckleheads.com", type: "Arts Venue", notes: "River-market saloon with indoor-outdoor stages." },
  { name: "The Pageant", city: "St. Louis, MO", capacity: 2000, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$800+", booking_email: "booking@thepageant.com", type: "Concert Hall", notes: "Delmar Loop's flagship concert theater." },
  { name: "Delmar Hall", city: "St. Louis, MO", capacity: 750, genres: ["Rock", "Indie", "Americana", "Pop"], pay: "$300-$1000", booking_email: "booking@delmarhall.com", type: "Concert Hall", notes: "The Pageant's mid-size sibling." },
  { name: "Old Rock House", city: "St. Louis, MO", capacity: 400, genres: ["Rock", "Americana", "Jam", "Blues"], pay: "$150-$500", booking_email: "booking@oldrockhouse.com", type: "Bar/Venue", notes: "Riverfront venue with a great restaurant." },
  { name: "Blueberry Hill Duck Room", city: "St. Louis, MO", capacity: 340, genres: ["Rock", "Punk", "Indie", "Jam"], pay: "$150-$500", booking_email: "booking@blueberryhill.com", type: "Club", notes: "Chuck Berry's monthly home. Loop landmark." },
  { name: "The Blue Note", city: "Columbia, MO", capacity: 700, genres: ["Rock", "Indie", "Hip Hop", "Jam"], pay: "$250-$800", booking_email: "booking@thebluenote.com", type: "Concert Hall", notes: "Mizzou college town's premier club." },
  { name: "Rose Music Hall", city: "Columbia, MO", capacity: 500, genres: ["Jam", "Rock", "Indie", "EDM"], pay: "$200-$600", booking_email: "booking@rosemanhattan.com", type: "Club", notes: "The Blue Note's scruffier sibling." },

  // ── Kansas ──
  { name: "The Bottleneck", city: "Lawrence, KS", capacity: 650, genres: ["Rock", "Indie", "Punk", "Alternative"], pay: "$250-$800", booking_email: "booking@thebottlenecklive.com", type: "Club", notes: "KU college town's rock mainstay." },
  { name: "Liberty Hall", city: "Lawrence, KS", capacity: 500, genres: ["Indie", "Folk", "Rock", "Comedy"], pay: "$200-$600", booking_email: "booking@libertyhall.net", type: "Theater", notes: "1856 building, one of Kansas' oldest venues." },
  { name: "The Cotillion Ballroom", city: "Wichita, KS", capacity: 1500, genres: ["Rock", "Metal", "Country", "EDM"], pay: "$500-$2000", booking_email: "booking@thecotillion.net", type: "Concert Hall", notes: "1960s ballroom for national mid-level tours." },
  { name: "Kirby's Beer Store", city: "Wichita, KS", capacity: 150, genres: ["Punk", "Indie", "Experimental", "Rock"], pay: "$50-$200", booking_email: "booking@kirbysbeerstore.com", type: "Bar/Venue", notes: "College-hill dive for DIY touring bands." },

  // ── Nebraska ──
  { name: "The Slowdown", city: "Omaha, NE", capacity: 500, genres: ["Indie", "Rock", "Hip Hop", "Electronic"], pay: "$200-$700", booking_email: "booking@slowedown.com", type: "Club", notes: "Saddle Creek's flagship Omaha room." },
  { name: "The Waiting Room", city: "Omaha, NE", capacity: 400, genres: ["Indie", "Rock", "Punk", "Americana"], pay: "$150-$500", booking_email: "booking@waitingroomlounge.com", type: "Club", notes: "Benson's general-admission workhorse." },
  { name: "Bourbon Theatre", city: "Lincoln, NE", capacity: 600, genres: ["Rock", "Metal", "Indie", "EDM"], pay: "$250-$800", booking_email: "booking@bourbontheatre.com", type: "Theater", notes: "1930s downtown Lincoln theater." },

  // ── South Dakota / North Dakota ──
  { name: "The District", city: "Sioux Falls, SD", capacity: 600, genres: ["Rock", "Country", "Pop", "Hip Hop"], pay: "$250-$800", booking_email: "booking@districtprairierose.com", type: "Club", notes: "Sioux Falls' main general-admission venue." },
  { name: "The Aquarium", city: "Fargo, ND", capacity: 300, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$100-$400", booking_email: "booking@theaquariumfargo.com", type: "Bar/Venue", notes: "Downtown Fargo room above a bar, strong bills." },
  { name: "Fargo Theatre", city: "Fargo, ND", capacity: 870, genres: ["Indie", "Folk", "Rock", "Comedy"], pay: "$300-$800", booking_email: "booking@fargotheatre.org", type: "Theater", notes: "1926 art-deco downtown movie palace." },
];