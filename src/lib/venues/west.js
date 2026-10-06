// ─────────────────────────────────────────────────────────────────────────────
// West venue expansion (CA, OR, WA, NV, AZ, UT, CO, NM, ID, MT, WY, AK, HI).
// Balanced mix of major rooms and small clubs. Same record shape as the
// in-page VENUE_DB in GigFinder.jsx. Duplicates against earlier lists are
// filtered out at merge time in GigFinder.
// ─────────────────────────────────────────────────────────────────────────────
export const WEST_VENUES = [
  // ── California ──
  { name: "The Independent", city: "San Francisco, CA", capacity: 500, genres: ["Indie", "Rock", "Electronic", "Hip Hop"], pay: "$200-$700", booking_email: "booking@theindependentsf.com", type: "Club", notes: "Divisadero room, SF's best mid-size club." },
  { name: "Great American Music Hall", city: "San Francisco, CA", capacity: 600, genres: ["Rock", "Indie", "Folk", "Jam"], pay: "$250-$800", booking_email: "booking@musichallsf.com", type: "Concert Hall", notes: "1907 ballroom with balcony and chandeliers." },
  { name: "The Chapel", city: "San Francisco, CA", capacity: 450, genres: ["Indie", "Rock", "Folk", "Electronic"], pay: "$200-$600", booking_email: "booking@thechapelsf.com", type: "Club", notes: "Mission former mortuary chapel with mezzanine." },
  { name: "Rickshaw Stop", city: "San Francisco, CA", capacity: 400, genres: ["Indie", "Electronic", "Pop", "Hip Hop"], pay: "$150-$500", booking_email: "booking@rickshawstop.com", type: "Club", notes: "Small-stage hub for early-career tours." },
  { name: "Bottom of the Hill", city: "San Francisco, CA", capacity: 250, genres: ["Indie", "Rock", "Punk", "Pop"], pay: "$100-$350", booking_email: "booking@bottomofthehill.com", type: "Club", notes: "Potrero Hill club with a respected calendar." },
  { name: "Cafe du Nord", city: "San Francisco, CA", capacity: 300, genres: ["Indie", "Jazz", "Singer-Songwriter", "Soul"], pay: "$150-$500", booking_email: "booking@cafedunord.com", type: "Club", notes: "Basement supper club below the Swedish Hall." },
  { name: "August Hall", city: "San Francisco, CA", capacity: 800, genres: ["Indie", "Electronic", "Rock", "Hip Hop"], pay: "$300-$1000", booking_email: "booking@augusthall.com", type: "Concert Hall", notes: "Former Chronicle building, five floors of sound." },
  { name: "The Fillmore", city: "San Francisco, CA", capacity: 1250, genres: ["Rock", "Jam", "Indie", "Soul"], pay: "$800+", booking_email: "booking@thefillmore.com", type: "Concert Hall", notes: "Bill Graham's 1968 room. Free apples and posters." },
  { name: "The Warfield", city: "San Francisco, CA", capacity: 2300, genres: ["Rock", "Jam", "Hip Hop", "Pop"], pay: "$800+", booking_email: "booking@thewarfieldtheater.com", type: "Theater", notes: "1922 theater, balcony and floor GA." },
  { name: "Bimbo's 365 Club", city: "San Francisco, CA", capacity: 600, genres: ["Pop", "Soul", "Jazz", "Indie"], pay: "$250-$800", booking_email: "booking@bimbos365club.com", type: "Club", notes: "North Beach supper club, 1931." },
  { name: "Swedish American Hall", city: "San Francisco, CA", capacity: 250, genres: ["Folk", "Indie", "Singer-Songwriter", "Chamber"], pay: "$150-$500", booking_email: "booking@swedishamericanhall.com", type: "Theater", notes: "Cafe du Nord's ornate upstairs hall." },
  { name: "Fox Theater Oakland", city: "Oakland, CA", capacity: 2800, genres: ["Rock", "Hip Hop", "Indie", "Pop"], pay: "$800+", booking_email: "booking@anotherplanet.us", type: "Theater", notes: "1928 movie palace, Bay Area's best big room." },
  { name: "The New Parish", city: "Oakland, CA", capacity: 450, genres: ["Hip Hop", "Reggae", "Indie", "Electronic"], pay: "$200-$700", booking_email: "booking@thenewparish.com", type: "Club", notes: "Oakland's club-size workhorse downtown." },
  { name: "Starline Social Club", city: "Oakland, CA", capacity: 400, genres: ["Indie", "Punk", "Hip Hop", "Electronic"], pay: "$150-$500", booking_email: "booking@starlinesocialclub.com", type: "Bar/Venue", notes: "Emeryville-border club with a ballroom." },
  { name: "Freight & Salvage", city: "Berkeley, CA", capacity: 480, genres: ["Folk", "Bluegrass", "Americana", "World"], pay: "$200-$600", booking_email: "booking@freightandsalvage.org", type: "Arts Venue", notes: "Berkeley's nonprofit folk haven since 1968." },
  { name: "The Echo", city: "Los Angeles, CA", capacity: 350, genres: ["Indie", "Rock", "Punk", "Electronic"], pay: "$150-$500", booking_email: "booking@echopark.com", type: "Club", notes: "Echoplex's smaller sibling, LA scene ground zero." },
  { name: "Echoplex", city: "Los Angeles, CA", capacity: 700, genres: ["Indie", "Rock", "EDM", "Hip Hop"], pay: "$250-$800", booking_email: "booking@echoplexla.com", type: "Club", notes: "Glendale Blvd basement under The Echo." },
  { name: "The Troubadour", city: "West Hollywood, CA", capacity: 500, genres: ["Singer-Songwriter", "Rock", "Folk", "Indie"], pay: "$250-$800", booking_email: "booking@troubadour.com", type: "Club", notes: "1960 room that broke Elton and James Taylor." },
  { name: "The Roxy", city: "West Hollywood, CA", capacity: 500, genres: ["Rock", "Indie", "Punk", "Hip Hop"], pay: "$250-$800", booking_email: "booking@theroxy.com", type: "Club", notes: "Sunset Strip 1973 landmark, On the Rox above." },
  { name: "Whisky a Go Go", city: "West Hollywood, CA", capacity: 500, genres: ["Rock", "Metal", "Punk", "Glam"], pay: "$250-$800", booking_email: "booking@whiskyagogo.com", type: "Club", notes: "1964 Sunset Strip club. Doors and Guns roots." },
  { name: "The Viper Room", city: "West Hollywood, CA", capacity: 250, genres: ["Rock", "Indie", "Metal", "Acoustic"], pay: "$100-$400", booking_email: "booking@viperroom.com", type: "Club", notes: "Johnny Depp's former Sunset Strip room." },
  { name: "Largo at the Coronet", city: "Los Angeles, CA", capacity: 280, genres: ["Singer-Songwriter", "Comedy", "Jazz", "Folk"], pay: "$200-$700", booking_email: "booking@largola.com", type: "Theater", notes: "No-phones policy room. Jon Brion's home." },
  { name: "The Hotel Café", city: "Hollywood, CA", capacity: 150, genres: ["Singer-Songwriter", "Folk", "Indie", "Pop"], pay: "$100-$400", booking_email: "booking@hotelcafe.com", type: "Bar/Venue", notes: "The songwriter's rite-of-passage room." },
  { name: "The Mint", city: "Los Angeles, CA", capacity: 200, genres: ["R&B", "Soul", "Funk", "Jazz"], pay: "$100-$350", booking_email: "booking@themintla.com", type: "Club", notes: "Pico Blvd club since 1937." },
  { name: "Lodge Room", city: "Highland Park, CA", capacity: 350, genres: ["Indie", "Folk", "Psych", "Rock"], pay: "$150-$500", booking_email: "booking@lodgeroomhp.com", type: "Theater", notes: "Masonic lodge with a balcony." },
  { name: "Zebulon", city: "Los Angeles, CA", capacity: 400, genres: ["Experimental", "Jazz", "Indie", "World"], pay: "$150-$500", booking_email: "booking@zebulonla.com", type: "Bar/Venue", notes: "Frogtown cine-club for adventurous bills." },
  { name: "Gold Diggers", city: "Los Angeles, CA", capacity: 250, genres: ["Indie", "Rock", "Punk", "Electronic"], pay: "$100-$400", booking_email: "booking@golddiggersla.com", type: "Bar/Venue", notes: "Echo Park bar-hotel-venue combo." },
  { name: "Teragram Ballroom", city: "Los Angeles, CA", capacity: 600, genres: ["Indie", "Rock", "Hip Hop", "Pop"], pay: "$250-$800", booking_email: "booking@teragramballroom.com", type: "Club", notes: "The Stones' rococo ballroom downtown." },
  { name: "Moroccan Lounge", city: "Los Angeles, CA", capacity: 250, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$100-$400", booking_email: "booking@moroccanlounge.com", type: "Club", notes: "Teragram's little sibling next door." },
  { name: "The Belasco", city: "Los Angeles, CA", capacity: 1500, genres: ["EDM", "Rock", "Hip Hop", "Latin"], pay: "$500-$2000", booking_email: "booking@belascolive.com", type: "Theater", notes: "1906 Gothic theater with a ballroom." },
  { name: "The Fonda Theatre", city: "Los Angeles, CA", capacity: 1000, genres: ["Rock", "Indie", "EDM", "Hip Hop"], pay: "$400-$1500", booking_email: "booking@fondatheatre.com", type: "Theater", notes: "Hollywood Boulevard's 1926 Spanish theater." },
  { name: "El Rey Theatre", city: "Los Angeles, CA", capacity: 900, genres: ["Indie", "Rock", "Electronic", "Latin"], pay: "$300-$1000", booking_email: "booking@elreytheatre.com", type: "Theater", notes: "Art-deco former movie house on Wilshire." },
  { name: "The Orpheum Theatre", city: "Los Angeles, CA", capacity: 1500, genres: ["Rock", "Indie", "Pop", "Soul"], pay: "$500-$2000", booking_email: "booking@orpheum-theatre.com", type: "Theater", notes: "1926 downtown vaudeville palace." },
  { name: "Pappy & Harriet's", city: "Pioneertown, CA", capacity: 400, genres: ["Americana", "Rock", "Country", "Folk"], pay: "$200-$800", booking_email: "booking@pappyandharriets.com", type: "Bar/Venue", notes: "High-desert biker saloon. Paul McCartney played." },
  { name: "Soho Restaurant & Music Club", city: "Santa Barbara, CA", capacity: 200, genres: ["Singer-Songwriter", "Rock", "Blues", "Americana"], pay: "$100-$400", booking_email: "booking@sohosb.com", type: "Club", notes: "Upper State Street listening dinner club." },
  { name: "The Lobero Theatre", city: "Santa Barbara, CA", capacity: 600, genres: ["Folk", "Jazz", "Americana", "Indie"], pay: "$250-$800", booking_email: "booking@lobero.org", type: "Theater", notes: "California's oldest theater, 1873." },
  { name: "The Glass House", city: "Pomona, CA", capacity: 800, genres: ["Rock", "Indie", "Punk", "EDM"], pay: "$300-$1000", booking_email: "booking@theglasshouse.us", type: "Concert Hall", notes: "Inland Empire's all-ages rock room." },
  { name: "The Casbah", city: "San Diego, CA", capacity: 250, genres: ["Indie", "Rock", "Punk", "Garage"], pay: "$100-$400", booking_email: "booking@casbahmusic.com", type: "Club", notes: "San Diego's most respected small club." },
  { name: "Observatory North Park", city: "San Diego, CA", capacity: 1000, genres: ["Indie", "Rock", "Latin", "EDM"], pay: "$400-$1200", booking_email: "booking@observatorysd.com", type: "Theater", notes: "1928 North Park theater for national tours." },
  { name: "Soda Bar", city: "San Diego, CA", capacity: 250, genres: ["Indie", "Rock", "Hip Hop", "Electronic"], pay: "$100-$350", booking_email: "booking@sodabarsd.com", type: "Bar/Venue", notes: "North Park upstairs room with a patio." },
  { name: "The Music Box", city: "San Diego, CA", capacity: 1000, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$400-$1500", booking_email: "booking@musicboxsd.com", type: "Concert Hall", notes: "Little Italy's 1920s landmark ballroom." },
  { name: "Harlow's", city: "Sacramento, CA", capacity: 500, genres: ["Rock", "Indie", "Americana", "Soul"], pay: "$200-$700", booking_email: "booking@harlows.com", type: "Club", notes: "Midtown Sacramento's dinner-club venue." },
  { name: "The Ritz", city: "San Jose, CA", capacity: 600, genres: ["Rock", "Metal", "Indie", "Hip Hop"], pay: "$250-$800", booking_email: "booking@theritzsanjose.com", type: "Club", notes: "San Jose's main general-admission room." },
  { name: "Strummer's", city: "Fresno, CA", capacity: 700, genres: ["Rock", "Indie", "Punk", "Latin"], pay: "$250-$800", booking_email: "booking@strummersfresno.com", type: "Club", notes: "Fresno's live-music anchor on the Fulton mall." },
  { name: "Fulton 55", city: "Fresno, CA", capacity: 550, genres: ["Rock", "Indie", "Country", "Hip Hop"], pay: "$200-$700", booking_email: "booking@fulton55.com", type: "Club", notes: "Fresno's downtown mid-size room." },

  // ── Oregon ──
  { name: "Doug Fir Lounge", city: "Portland, OR", capacity: 300, genres: ["Indie", "Rock", "Folk", "Electronic"], pay: "$150-$500", booking_email: "booking@dougfirlounge.com", type: "Bar/Venue", notes: "Log-cabin lounge, Portland's best small room." },
  { name: "Mississippi Studios", city: "Portland, OR", capacity: 300, genres: ["Indie", "Folk", "Singer-Songwriter", "Rock"], pay: "$150-$500", booking_email: "booking@mississippistudios.com", type: "Club", notes: "Former Baptist church with a balcony bar." },
  { name: "McMenamins Crystal Ballroom", city: "Portland, OR", capacity: 875, genres: ["Rock", "Indie", "Jam", "Soul"], pay: "$300-$1000", booking_email: "booking@mcmenamins.com", type: "Concert Hall", notes: "1914 ballroom with a springy floating floor." },
  { name: "Roseland Theater", city: "Portland, OR", capacity: 1400, genres: ["Rock", "Hip Hop", "Indie", "EDM"], pay: "$500-$2000", booking_email: "booking@roselandtheater.com", type: "Theater", notes: "Portland's big general-admission room." },
  { name: "Aladdin Theater", city: "Portland, OR", capacity: 620, genres: ["Folk", "Americana", "Rock", "Indie"], pay: "$250-$800", booking_email: "booking@aladdin-theater.com", type: "Theater", notes: "1927 movie house on Powell Boulevard." },
  { name: "Wonder Ballroom", city: "Portland, OR", capacity: 500, genres: ["Indie", "Rock", "Jam", "Electronic"], pay: "$200-$700", booking_email: "booking@wonderballroompdx.com", type: "Concert Hall", notes: "Alberta District ballroom with a mezzanine." },
  { name: "Dante's", city: "Portland, OR", capacity: 300, genres: ["Rock", "Blues", "Burlesque", "Metal"], pay: "$100-$400", booking_email: "booking@danteslive.com", type: "Bar/Venue", notes: "Burnside C-Beast lounge, sin and cabaret." },
  { name: "Revolution Hall", city: "Portland, OR", capacity: 900, genres: ["Indie", "Rock", "Folk", "Comedy"], pay: "$300-$1000", booking_email: "booking@revolutionhall.com", type: "Theater", notes: "1914 schoolhouse gym turned theater." },
  { name: "WOW Hall", city: "Eugene, OR", capacity: 400, genres: ["Jam", "Reggae", "Indie", "Rock"], pay: "$150-$500", booking_email: "booking@wowhall.org", type: "Arts Venue", notes: "Community-run hall since 1970." },

  // ── Washington ──
  { name: "The Crocodile", city: "Seattle, WA", capacity: 550, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$250-$800", booking_email: "booking@thecrocodile.com", type: "Club", notes: "1991 Belltown room; Nirvana and Pearl Jam history." },
  { name: "Neumos", city: "Seattle, WA", capacity: 550, genres: ["Indie", "Rock", "EDM", "Hip Hop"], pay: "$250-$800", booking_email: "booking@neumos.com", type: "Club", notes: "Capitol Hill's main mid-size club." },
  { name: "Barboza", city: "Seattle, WA", capacity: 200, genres: ["Indie", "Punk", "Electronic", "Hip Hop"], pay: "$100-$350", booking_email: "booking@neumos.com", type: "Club", notes: "Neumos' basement sibling on Pike Street." },
  { name: "The Showbox", city: "Seattle, WA", capacity: 1100, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$400-$1500", booking_email: "booking@showboxpresents.com", type: "Concert Hall", notes: "1939 art-deco ballroom at Pike Place." },
  { name: "The Vera Project", city: "Seattle, WA", capacity: 300, genres: ["Punk", "Indie", "Hip Hop", "Electronic"], pay: "$75-$300", booking_email: "booking@theveraproject.org", type: "Arts Venue", notes: "All-ages volunteer-run Seattle institution." },
  { name: "The Sunset Tavern", city: "Seattle, WA", capacity: 250, genres: ["Indie", "Rock", "Punk", "Garage"], pay: "$75-$300", booking_email: "booking@sunsettavern.com", type: "Bar/Venue", notes: "Ballard Avenue's scruffy small stage." },
  { name: "The Tractor Tavern", city: "Seattle, WA", capacity: 299, genres: ["Americana", "Bluegrass", "Country", "Folk"], pay: "$100-$400", booking_email: "booking@tractortavern.com", type: "Bar/Venue", notes: "Ballard's roots-music landmark." },
  { name: "Columbia City Theater", city: "Seattle, WA", capacity: 340, genres: ["Blues", "Soul", "Indie", "Jazz"], pay: "$150-$500", booking_email: "booking@columbiacitytheatre.com", type: "Theater", notes: "1920 Rainier Valley speakeasy relic." },
  { name: "Madame Lou's", city: "Seattle, WA", capacity: 300, genres: ["Indie", "Rock", "Electronic", "Soul"], pay: "$150-$500", booking_email: "booking@neumos.com", type: "Club", notes: "Eastlake's former Neumo's Underworld, reborn 2022." },
  { name: "Wild Buffalo", city: "Bellingham, WA", capacity: 400, genres: ["Rock", "Indie", "Jam", "Hip Hop"], pay: "$150-$500", booking_email: "booking@wildbuffalobillings.com", type: "Club", notes: "College town's live-music loft." },
  { name: "Capitol Theater", city: "Olympia, WA", capacity: 800, genres: ["Punk", "Indie", "Experimental", "Rock"], pay: "$250-$800", booking_email: "booking@capitoltheater.org", type: "Theater", notes: "Olympia's 1924 home of grunge and K-music." },
  { name: "The Bartlett", city: "Spokane, WA", capacity: 300, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$100-$400", booking_email: "booking@thebartlettspokane.com", type: "Club", notes: "Spokane's all-ages general-admission room." },

  // ── Nevada ──
  { name: "The Space", city: "Las Vegas, NV", capacity: 300, genres: ["Indie", "Rock", "Jazz", "Comedy"], pay: "$150-$500", booking_email: "booking@thespacelv.com", type: "Arts Venue", notes: "Nonprofit performing-arts lab east of the Strip." },
  { name: "Brooklyn Bowl Las Vegas", city: "Las Vegas, NV", capacity: 2000, genres: ["Rock", "Jam", "Funk", "EDM"], pay: "$800+", booking_email: "booking@brooklynbowl.com", type: "Concert Hall", notes: "Lanes, bands and Blue Ribbon at the LINQ." },
  { name: "House of Blues Las Vegas", city: "Las Vegas, NV", capacity: 1800, genres: ["Blues", "Rock", "Hip Hop", "Latin"], pay: "$800+", booking_email: "booking@hob.com", type: "Concert Hall", notes: "Mandalay Bay's folk-art music hall." },
  { name: "Cargo Concert Hall", city: "Reno, NV", capacity: 550, genres: ["Rock", "Hip Hop", "EDM", "Indie"], pay: "$250-$800", booking_email: "booking@cargoconcerthall.com", type: "Club", notes: "Whitney Peak Hotel's rooftop room." },

  // ── Arizona ──
  { name: "The Van Buren", city: "Phoenix, AZ", capacity: 1800, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$800+", booking_email: "booking@thevanburenphx.com", type: "Concert Hall", notes: "1931 car-dealership-turned ballroom downtown." },
  { name: "Crescent Ballroom", city: "Phoenix, AZ", capacity: 550, genres: ["Indie", "Rock", "Latin", "Americana"], pay: "$250-$800", booking_email: "booking@crescentphx.com", type: "Club", notes: "Cocina downstairs, ballroom stage." },
  { name: "The Rebel Lounge", city: "Phoenix, AZ", capacity: 300, genres: ["Punk", "Indie", "Rock", "Metal"], pay: "$100-$400", booking_email: "booking@therebellounge.com", type: "Club", notes: "Former Mason Jar, now the underground hub." },
  { name: "The Rialto Theatre", city: "Tucson, AZ", capacity: 1300, genres: ["Rock", "Indie", "Latin", "Jam"], pay: "$500-$2000", booking_email: "booking@rialtotheatre.com", type: "Theater", notes: "1920 Congress Street theater." },
  { name: "Club Congress", city: "Tucson, AZ", capacity: 400, genres: ["Indie", "Rock", "Americana", "Electronic"], pay: "$150-$500", booking_email: "booking@hotelcongress.com", type: "Bar/Venue", notes: "Historic Hotel Congress taproom, 1919." },
  { name: "191 Toole", city: "Tucson, AZ", capacity: 300, genres: ["Indie", "Punk", "Rock", "Hip Hop"], pay: "$100-$400", booking_email: "booking@191toole.com", type: "Club", notes: "Downtown warehouse room for touring bands." },

  // ── Utah ──
  { name: "Urban Lounge", city: "Salt Lake City, UT", capacity: 300, genres: ["Indie", "Rock", "Punk", "Metal"], pay: "$100-$400", booking_email: "booking@urbanloungeslc.com", type: "Bar/Venue", notes: "SLC's scruffy home for underground tours." },
  { name: "Kilby Court", city: "Salt Lake City, UT", capacity: 200, genres: ["Indie", "Folk", "Punk", "Rock"], pay: "$75-$300", booking_email: "booking@kilbycourt.com", type: "Arts Venue", notes: "All-ages garage venue, Salt Lake DIY anchor." },
  { name: "Metro Music Hall", city: "Salt Lake City, UT", capacity: 550, genres: ["Rock", "Indie", "EDM", "Hip Hop"], pay: "$200-$800", booking_email: "booking@metromusichall.com", type: "Club", notes: "Downtown mid-size club with a mezzanine." },
  { name: "The Royal", city: "Salt Lake City, UT", capacity: 700, genres: ["Rock", "Indie", "Hip Hop", "Pop"], pay: "$250-$800", booking_email: "booking@theroyalslc.com", type: "Concert Hall", notes: "Former In the Venue space, reworked 2017." },

  // ── Colorado ──
  { name: "Bluebird Theater", city: "Denver, CO", capacity: 500, genres: ["Indie", "Rock", "Hip Hop", "EDM"], pay: "$200-$700", booking_email: "booking@bluebirdtheater.net", type: "Theater", notes: "1913 Colfax theater with a balcony." },
  { name: "Ogden Theatre", city: "Denver, CO", capacity: 1100, genres: ["Rock", "Indie", "EDM", "Hip Hop"], pay: "$400-$1500", booking_email: "booking@ogdentheater.com", type: "Theater", notes: "1919 Colfax jewel, general admission." },
  { name: "Hi-Dive", city: "Denver, CO", capacity: 250, genres: ["Indie", "Rock", "Punk", "Country"], pay: "$75-$300", booking_email: "booking@hi-dive.com", type: "Bar/Venue", notes: "South Broadway dive with a jukebox soul." },
  { name: "The Gothic Theatre", city: "Englewood, CO", capacity: 1100, genres: ["Rock", "Metal", "Indie", "EDM"], pay: "$400-$1200", booking_email: "booking@gothictheatre.com", type: "Theater", notes: "1920s art-deco movie house resurrected." },
  { name: "Summit Music Hall", city: "Denver, CO", capacity: 1100, genres: ["Metal", "Rock", "Hip Hop", "EDM"], pay: "$400-$1200", booking_email: "booking@summitmusichall.com", type: "Concert Hall", notes: "Downtown room for heavy and hip bills." },
  { name: "Cervantes' Masterpiece Ballroom", city: "Denver, CO", capacity: 900, genres: ["Jam", "Funk", "EDM", "Hip Hop"], pay: "$300-$1000", booking_email: "booking@cervantesmasterpiece.com", type: "Club", notes: "Two-stage complex: ballroom and Other Side." },
  { name: "Fox Theatre", city: "Boulder, CO", capacity: 625, genres: ["Rock", "Jam", "Indie", "EDM"], pay: "$250-$800", booking_email: "booking@foxtheatre.com", type: "Theater", notes: "CU college town's 1911 landmark." },
  { name: "Boulder Theater", city: "Boulder, CO", capacity: 850, genres: ["Folk", "Indie", "Jazz", "Film"], pay: "$300-$1000", booking_email: "booking@bouldertheater.com", type: "Theater", notes: "1906 opera house on 14th Street." },
  { name: "Aggie Theatre", city: "Fort Collins, CO", capacity: 700, genres: ["Rock", "Indie", "EDM", "Jam"], pay: "$250-$800", booking_email: "booking@aggietheatre.com", type: "Concert Hall", notes: "Old Town's 1912 theater-club." },
  { name: "Black Sheep", city: "Colorado Springs, CO", capacity: 450, genres: ["Rock", "Metal", "Punk", "Indie"], pay: "$150-$500", booking_email: "booking@blacksheeprockbar.com", type: "Club", notes: "Underground room with house lodging upstairs." },
  { name: "Levitt Pavilion Denver", city: "Denver, CO", capacity: 7500, genres: ["Americana", "Rock", "Latin", "Funk"], pay: "$800+", booking_email: "booking@levittdenver.org", type: "Amphitheater", notes: "Ruby Hill's free and ticketed outdoor series." },

  // ── New Mexico ──
  { name: "Launchpad", city: "Albuquerque, NM", capacity: 300, genres: ["Metal", "Punk", "Rock", "Indie"], pay: "$100-$400", booking_email: "booking@launchpadrocks.com", type: "Club", notes: "Downtown ABQ's underground anchor." },
  { name: "Sister Bar", city: "Albuquerque, NM", capacity: 250, genres: ["Indie", "Electronic", "Rock", "Hip Hop"], pay: "$100-$350", booking_email: "booking@sisterbar.com", type: "Bar/Venue", notes: "Casa hopping on Gold Street with a patio." },
  { name: "El Rey Theater", city: "Albuquerque, NM", capacity: 700, genres: ["Rock", "Latin", "Reggae", "Funk"], pay: "$250-$800", booking_email: "booking@elreyabq.com", type: "Theater", notes: "1941 movie house on Central Avenue." },
  { name: "The Lensic", city: "Santa Fe, NM", capacity: 750, genres: ["Folk", "World", "Indie", "Jazz"], pay: "$300-$1000", booking_email: "booking@lensic.org", type: "Theater", notes: "1931 performing-arts anchor on the plaza." },

  // ── Idaho ──
  { name: "Neurolux", city: "Boise, ID", capacity: 250, genres: ["Indie", "Experimental", "Rock", "Electronic"], pay: "$75-$300", booking_email: "booking@neurolux.com", type: "Bar/Venue", notes: "Boise's long-running oddball clubhouse." },
  { name: "The Shredder", city: "Boise, ID", capacity: 200, genres: ["Metal", "Punk", "Hardcore", "Rock"], pay: "$75-$250", booking_email: "booking@shredderboise.com", type: "Club", notes: "All-ages heavy-music den downtown." },
  { name: "Visual Arts Collective", city: "Garden City, ID", capacity: 200, genres: ["Jazz", "Electronic", "Experimental", "Indie"], pay: "$75-$300", booking_email: "booking@vacboise.com", type: "Arts Venue", notes: "Art-gallery venue on the Boise river bend." },

  // ── Montana ──
  { name: "The Top Hat", city: "Missoula, MT", capacity: 900, genres: ["Rock", "Indie", "Jam", "Hip Hop"], pay: "$300-$1000", booking_email: "booking@tophatmissoula.com", type: "Club", notes: "Missoula's main club since 1976." },
  { name: "The Wilma", city: "Missoula, MT", capacity: 1100, genres: ["Rock", "Indie", "Folk", "Pop"], pay: "$400-$1500", booking_email: "booking@thewilma.com", type: "Theater", notes: "1921 riverside theater, balcony and all." },
  { name: "The ELM", city: "Bozeman, MT", capacity: 1100, genres: ["Rock", "Indie", "EDM", "Hip Hop"], pay: "$400-$1200", booking_email: "booking@theelmbozeman.com", type: "Concert Hall", notes: "Bozeman's 2021 flagship live room." },
  { name: "The Filling Station", city: "Bozeman, MT", capacity: 300, genres: ["Rock", "Jam", "Indie", "Americana"], pay: "$100-$400", booking_email: "booking@fillingstationbozeman.com", type: "Bar/Venue", notes: "Dive with a stage next to the rail yard." },

  // ── Wyoming ──
  { name: "The Occidental", city: "Buffalo, WY", capacity: 250, genres: ["Americana", "Rock", "Folk", "Country"], pay: "$100-$400", booking_email: "booking@occidentalhotel.com", type: "Bar/Venue", notes: "1880 saloon that never lost its stage." },

  // ── Alaska ──
  { name: "Bear Tooth Theatrepub", city: "Anchorage, AK", capacity: 300, genres: ["Rock", "Folk", "Americana", "Jam"], pay: "$100-$400", booking_email: "booking@beartooththeatrepub.com", type: "Bar/Venue", notes: "Anchorage's restaurant-brewery show room." },
  { name: "Williwaw Social", city: "Anchorage, AK", capacity: 520, genres: ["Rock", "Hip Hop", "EDM", "Indie"], pay: "$200-$700", booking_email: "booking@williwawsocial.com", type: "Club", notes: "Downtown Anchorage's modern concert space." },

  // ── Hawaii ──
  { name: "The Republik", city: "Honolulu, HI", capacity: 600, genres: ["Rock", "Indie", "Hip Hop", "Reggae"], pay: "$250-$800", booking_email: "booking@therepublik.com", type: "Club", notes: "Honolulu's main general-admission club." },
  { name: "Mulligans on the Blue", city: "Kihei, HI", capacity: 300, genres: ["Reggae", "Jawaiian", "Blues", "Rock"], pay: "$100-$400", booking_email: "booking@mulligansontheblue.com", type: "Bar/Venue", notes: "Maui's longest-running live music bar." },
];