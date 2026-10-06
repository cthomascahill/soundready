// ─────────────────────────────────────────────────────────────────────────────
// South venue expansion (VA, WV, NC, SC, GA, FL, TN, KY, AL, MS, AR, LA, OK, TX).
// Balanced mix of major rooms and small clubs. Same record shape as the
// in-page VENUE_DB in GigFinder.jsx. Duplicates against earlier lists are
// filtered out at merge time in GigFinder.
// ─────────────────────────────────────────────────────────────────────────────
export const SOUTH_VENUES = [
  // ── Virginia ──
  { name: "The National", city: "Richmond, VA", capacity: 1500, genres: ["Indie", "Rock", "Hip Hop", "Pop"], pay: "$500-$2000", booking_email: "booking@thenationalva.com", type: "Concert Hall", notes: "Richmond's premier national touring room." },
  { name: "The Broadberry", city: "Richmond, VA", capacity: 500, genres: ["Indie", "Rock", "Americana", "Jam"], pay: "$200-$700", booking_email: "booking@thebroadberry.com", type: "Club", notes: "Broad Street club with a great sound system." },
  { name: "Capital Ale House Music Hall", city: "Richmond, VA", capacity: 250, genres: ["Blues", "Rock", "Americana", "Jam"], pay: "$100-$400", booking_email: "booking@capitalalehouse.com", type: "Bar/Venue", notes: "Downstairs hall at the beer hall." },
  { name: "The Camel", city: "Richmond, VA", capacity: 150, genres: ["Indie", "Rock", "Punk", "Folk"], pay: "$75-$300", booking_email: "booking@thecamelrichmond.com", type: "Bar/Venue", notes: "Beloved small stage on Broad Street." },
  { name: "Gallery5", city: "Richmond, VA", capacity: 250, genres: ["Experimental", "Indie", "Punk", "Folk"], pay: "$100-$350", booking_email: "booking@gallery5arts.org", type: "Arts Venue", notes: "Jackson Ward arts-space shows." },
  { name: "The NorVa", city: "Norfolk, VA", capacity: 1500, genres: ["Rock", "Hip Hop", "Indie", "EDM"], pay: "$500-$2000", booking_email: "booking@thenorva.com", type: "Concert Hall", notes: "Hampton Roads' flagship club." },
  { name: "The Jefferson Theater", city: "Charlottesville, VA", capacity: 600, genres: ["Rock", "Indie", "Jam", "Hip Hop"], pay: "$250-$800", booking_email: "booking@jeffersontheater.com", type: "Concert Hall", notes: "Downtown mall's restored 1912 theater." },
  { name: "The Southern Café & Music Hall", city: "Charlottesville, VA", capacity: 350, genres: ["Indie", "Rock", "Folk", "Jam"], pay: "$150-$500", booking_email: "booking@thesoutherncville.com", type: "Club", notes: "Charlottesville's mid-size club on the mall." },
  { name: "Ting Pavilion", city: "Charlottesville, VA", capacity: 5000, genres: ["Rock", "Indie", "Pop", "Jam"], pay: "$800+", booking_email: "booking@tingpavilion.com", type: "Amphitheater", notes: "Downtown mall outdoor shed for big tours." },
  { name: "The Birchmere", city: "Alexandria, VA", capacity: 500, genres: ["Americana", "Folk", "Blues", "Country"], pay: "$200-$700", booking_email: "booking@birchmere.com", type: "Club", notes: "Legendary seated listening hall since 1966." },
  { name: "EagleBank Arena", city: "Fairfax, VA", capacity: 10000, genres: ["Pop", "Rock", "Hip Hop"], pay: "$800+", booking_email: "booking@eaglebankarena.com", type: "Arena", notes: "George Mason arena for major tours." },
  { name: "Clementine", city: "Harrisonburg, VA", capacity: 200, genres: ["Indie", "Rock", "Funk", "Hip Hop"], pay: "$75-$250", booking_email: "booking@clementineva.com", type: "Bar/Venue", notes: "JMU college-town downtown club." },

  // ── West Virginia ──
  { name: "The Purple Fiddle", city: "Thomas, WV", capacity: 150, genres: ["Bluegrass", "Folk", "Americana", "Jam"], pay: "$75-$300", booking_email: "booking@purplefiddle.com", type: "Bar/Venue", notes: "Mountain-town bluegrass institution." },
  { name: "Maier Foundation Hall", city: "Charleston, WV", capacity: 400, genres: ["Folk", "Indie", "Americana", "Jazz"], pay: "$150-$500", booking_email: "booking@theclaycenter.org", type: "Arts Venue", notes: "Clay Center's intimate performance hall." },
  { name: "The Hive", city: "Huntington, WV", capacity: 200, genres: ["Indie", "Rock", "Punk", "Metal"], pay: "$75-$300", booking_email: "booking@thehivewv.com", type: "Bar/Venue", notes: "Marshall college town's live room." },

  // ── North Carolina ──
  { name: "Cat's Cradle", city: "Carrboro, NC", capacity: 700, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$250-$800", booking_email: "booking@catscradle.com", type: "Club", notes: "Legendary Triangle-room since 1969." },
  { name: "The Pour House Music Hall", city: "Raleigh, NC", capacity: 300, genres: ["Jam", "Indie", "Rock", "Funk"], pay: "$150-$500", booking_email: "booking@pourhousenc.com", type: "Club", notes: "Downtown Raleigh jam-friendly club." },
  { name: "Lincoln Theatre", city: "Raleigh, NC", capacity: 550, genres: ["Americana", "Rock", "Indie", "Country"], pay: "$200-$700", booking_email: "booking@lincolntheatre-raleigh.com", type: "Theater", notes: "Glenwood South's long-running hall." },
  { name: "Motorco Music Hall", city: "Durham, NC", capacity: 400, genres: ["Indie", "Rock", "Hip Hop", "Electronic"], pay: "$150-$600", booking_email: "booking@motorcomusic.com", type: "Club", notes: "Durham's anchor venue with food hall next door." },
  { name: "The Pinhook", city: "Durham, NC", capacity: 200, genres: ["Indie", "Punk", "Hip Hop", "Queer Dance"], pay: "$75-$300", booking_email: "booking@pinhookmusic.com", type: "Bar/Venue", notes: "Durham's community-forward small room." },
  { name: "Haw River Ballroom", city: "Saxapahaw, NC", capacity: 450, genres: ["Indie", "Folk", "Americana", "Rock"], pay: "$200-$700", booking_email: "booking@hawriverballroom.com", type: "Arts Venue", notes: "Repurposed mill on the river, gorgeous sound." },
  { name: "The Orange Peel", city: "Asheville, NC", capacity: 1050, genres: ["Rock", "Indie", "Jam", "EDM"], pay: "$400-$1500", booking_email: "booking@theorangepeel.net", type: "Concert Hall", notes: "Asheville's flagship general-admission room." },
  { name: "The Grey Eagle", city: "Asheville, NC", capacity: 500, genres: ["Americana", "Folk", "Indie", "Jam"], pay: "$200-$600", booking_email: "booking@thegreyeagle.com", type: "Club", notes: "River arts district listening club." },
  { name: "Salvage Station", city: "Asheville, NC", capacity: 1000, genres: ["Americana", "Rock", "Jam", "Blues"], pay: "$400-$1200", booking_email: "booking@salvagestation.com", type: "Amphitheater", notes: "Riverside indoor-outdoor venue." },
  { name: "Isis Music Hall", city: "Asheville, NC", capacity: 300, genres: ["Americana", "Jazz", "Folk", "Indie"], pay: "$150-$500", booking_email: "booking@isisasheville.com", type: "Theater", notes: "Restored 1930s movie house, dinner shows." },
  { name: "Neighborhood Theatre", city: "Charlotte, NC", capacity: 950, genres: ["Rock", "Indie", "Hip Hop", "Jam"], pay: "$400-$1200", booking_email: "booking@neighborhoodtheatre.org", type: "Concert Hall", notes: "NoDa's historic general-admission hall." },
  { name: "The Visulite Theatre", city: "Charlotte, NC", capacity: 300, genres: ["Rock", "Indie", "Jam", "Singer-Songwriter"], pay: "$150-$500", booking_email: "booking@visulite.com", type: "Club", notes: "Plaza Midwood listening room." },
  { name: "The Fillmore Charlotte", city: "Charlotte, NC", capacity: 2000, genres: ["Rock", "Hip Hop", "EDM", "Pop"], pay: "$800+", booking_email: "booking@fillmorecharlotte.com", type: "Concert Hall", notes: "NC Music Factory's big club." },
  { name: "The Ramkat", city: "Winston-Salem, NC", capacity: 700, genres: ["Rock", "Indie", "Americana", "Soul"], pay: "$250-$800", booking_email: "booking@theramkat.com", type: "Concert Hall", notes: "Innovation Quarter's modern live room." },
  { name: "The Blind Tiger", city: "Greensboro, NC", capacity: 500, genres: ["Rock", "Indie", "Punk", "Metal"], pay: "$200-$600", booking_email: "booking@theblindtiger.com", type: "Club", notes: "Greensboro's long-running rock club." },
  { name: "Greenfield Lake Amphitheater", city: "Wilmington, NC", capacity: 1200, genres: ["Americana", "Folk", "Rock", "Indie"], pay: "$400-$1200", booking_email: "booking@greenfieldlakeamphitheater.com", type: "Amphitheater", notes: "Cypress-lined outdoor summer series room." },

  // ── South Carolina ──
  { name: "Music Farm Charleston", city: "Charleston, SC", capacity: 700, genres: ["Rock", "Indie", "Jam", "Hip Hop"], pay: "$250-$800", booking_email: "booking@musicfarm.com", type: "Concert Hall", notes: "King Street's historic music hall." },
  { name: "The Pour House Charleston", city: "Charleston, SC", capacity: 400, genres: ["Jam", "Rock", "Funk", "Americana"], pay: "$150-$600", booking_email: "booking@charlestonpourhouse.com", type: "Bar/Venue", notes: "James Island jam-band haven with a deck stage." },
  { name: "Charleston Music Hall", city: "Charleston, SC", capacity: 350, genres: ["Folk", "Americana", "Indie", "Comedy"], pay: "$200-$700", booking_email: "booking@charlestonmusichall.com", type: "Theater", notes: "Seated 1850s railroad-freight hall." },
  { name: "New Brookland Tavern", city: "West Columbia, SC", capacity: 300, genres: ["Punk", "Indie", "Rock", "Metal"], pay: "$100-$400", booking_email: "booking@newbrooklandtavern.com", type: "Club", notes: "Columbia's underground all-ages room." },
  { name: "The Senate", city: "Columbia, SC", capacity: 600, genres: ["Rock", "Indie", "Hip Hop", "Pop"], pay: "$250-$800", booking_email: "booking@senatecolumbia.com", type: "Concert Hall", notes: "Main Street's restored 1920s club." },
  { name: "Spartanburg Memorial Auditorium", city: "Spartanburg, SC", capacity: 3200, genres: ["Country", "Rock", "Gospel", "Pop"], pay: "$800+", booking_email: "booking@spartanburgmemorialauditorium.com", type: "Concert Hall", notes: "Upstate SC's historic big room." },

  // ── Georgia ──
  { name: "Variety Playhouse", city: "Atlanta, GA", capacity: 1000, genres: ["Indie", "Rock", "Folk", "World"], pay: "$400-$1500", booking_email: "booking@variety-playhouse.com", type: "Theater", notes: "Little Five Points' beloved general-admission theater." },
  { name: "The Earl", city: "Atlanta, GA", capacity: 300, genres: ["Indie", "Rock", "Punk", "Americana"], pay: "$150-$500", booking_email: "booking@earlsvillage.com", type: "Bar/Venue", notes: "East Atlanta Village tavern with serious bookings." },
  { name: "Terminal West", city: "Atlanta, GA", capacity: 725, genres: ["Indie", "Electronic", "Rock", "Hip Hop"], pay: "$250-$800", booking_email: "booking@terminalwestatl.com", type: "Concert Hall", notes: "Converted iron works by the BeltLine." },
  { name: "The Masquerade", city: "Atlanta, GA", capacity: 1800, genres: ["Rock", "Metal", "Punk", "EDM"], pay: "$500-$2000", booking_email: "booking@masqueradeatlanta.com", type: "Concert Hall", notes: "Heaven, Hell and Purgatory rooms." },
  { name: "Tabernacle", city: "Atlanta, GA", capacity: 2600, genres: ["Rock", "Hip Hop", "Pop", "R&B"], pay: "$800+", booking_email: "booking@tabernacleatl.com", type: "Concert Hall", notes: "Former church, big-name mid-size stop." },
  { name: "Aisle 5", city: "Atlanta, GA", capacity: 500, genres: ["Indie", "Hip Hop", "Electronic", "R&B"], pay: "$200-$700", booking_email: "booking@aisle5atl.com", type: "Club", notes: "Ponce City Market's general-admission room." },
  { name: "Smith's Olde Bar", city: "Atlanta, GA", capacity: 250, genres: ["Rock", "Singer-Songwriter", "Americana", "Jam"], pay: "$100-$400", booking_email: "booking@smithsoldebar.com", type: "Bar/Venue", notes: "Piedmont Ave institution with upstairs room." },
  { name: "Eddie's Attic", city: "Decatur, GA", capacity: 180, genres: ["Singer-Songwriter", "Folk", "Americana", "Indie"], pay: "$100-$400", booking_email: "booking@eddiesattic.com", type: "Club", notes: "The Southeast's premier songwriter room." },
  { name: "40 Watt Club", city: "Athens, GA", capacity: 500, genres: ["Indie", "Rock", "Punk", "Jam"], pay: "$200-$700", booking_email: "booking@40watt.com", type: "Club", notes: "Athens legend, R.E.M.'s launching pad." },
  { name: "Georgia Theatre", city: "Athens, GA", capacity: 900, genres: ["Rock", "Indie", "Jam", "Hip Hop"], pay: "$400-$1200", booking_email: "booking@georgiatheatre.com", type: "Concert Hall", notes: "Athens' flagship with rooftop bar." },
  { name: "Caledonia Lounge", city: "Athens, GA", capacity: 200, genres: ["Indie", "Punk", "Experimental", "Rock"], pay: "$75-$300", booking_email: "booking@caledonialounge.com", type: "Bar/Venue", notes: "Athens' best small stage for touring bands." },

  // ── Florida ──
  { name: "Revolution Live", city: "Fort Lauderdale, FL", capacity: 1000, genres: ["Rock", "Metal", "Indie", "Hip Hop"], pay: "$400-$1500", booking_email: "booking@revolutionlive.com", type: "Concert Hall", notes: "South Florida's rock workhorse." },
  { name: "The Culture Room", city: "Fort Lauderdale, FL", capacity: 600, genres: ["Indie", "Rock", "Reggae", "Punk"], pay: "$250-$800", booking_email: "booking@cultureroom.net", type: "Club", notes: "Intimate US1 room with national bills." },
  { name: "Gramps", city: "Miami, FL", capacity: 350, genres: ["Indie", "Electronic", "Latin", "Hip Hop"], pay: "$150-$600", booking_email: "booking@gramps.com", type: "Bar/Venue", notes: "Wynwood courtyard bar with live shows." },
  { name: "The Ground Miami", city: "Miami, FL", capacity: 400, genres: ["Indie", "Rock", "Latin", "Hip Hop"], pay: "$200-$700", booking_email: "booking@thegroundmiami.com", type: "Club", notes: "Little Haiti's modern live room." },
  { name: "Space Miami", city: "Miami, FL", capacity: 500, genres: ["EDM", "Techno", "House", "Electronic"], pay: "$300-$1200", booking_email: "booking@spaceclub.com", type: "Club", notes: "Legendary downtown electronic club." },
  { name: "The Fillmore Miami Beach", city: "Miami Beach, FL", capacity: 2300, genres: ["Rock", "Pop", "Latin", "Hip Hop"], pay: "$800+", booking_email: "booking@fillmoremb.com", type: "Theater", notes: "Jackie Gleason theater at the beach." },
  { name: "The Social", city: "Orlando, FL", capacity: 300, genres: ["Indie", "Rock", "Hip Hop", "Electronic"], pay: "$150-$500", booking_email: "booking@thesocial.org", type: "Club", notes: "Downtown Orlando's longest-running club." },
  { name: "Will's Pub", city: "Orlando, FL", capacity: 250, genres: ["Indie", "Punk", "Rock", "Metal"], pay: "$100-$350", booking_email: "booking@willspub.org", type: "Bar/Venue", notes: "Orlando dive with a strong calendar." },
  { name: "The Beacham", city: "Orlando, FL", capacity: 800, genres: ["EDM", "Rock", "Indie", "Hip Hop"], pay: "$300-$1000", booking_email: "booking@thebeacham.com", type: "Concert Hall", notes: "1921 theater turned big-format club." },
  { name: "The Plaza Live", city: "Orlando, FL", capacity: 1000, genres: ["Indie", "Folk", "Rock", "Comedy"], pay: "$400-$1200", booking_email: "booking@theplazalive.com", type: "Theater", notes: "Two-room nonprofit-backed theater." },
  { name: "The Ritz Ybor", city: "Tampa, FL", capacity: 900, genres: ["Rock", "Metal", "EDM", "Hip Hop"], pay: "$300-$1000", booking_email: "booking@ritzybor.com", type: "Concert Hall", notes: "Ybor City's historic theater-club." },
  { name: "The Orpheum", city: "Tampa, FL", capacity: 700, genres: ["Indie", "Rock", "Hip Hop", "EDM"], pay: "$250-$800", booking_email: "booking@orpheumtampa.com", type: "Club", notes: "Ybor's mid-size general-admission room." },
  { name: "Crowbar", city: "Tampa, FL", capacity: 400, genres: ["Indie", "Rock", "Punk", "Metal"], pay: "$150-$500", booking_email: "booking@crowbarlive.com", type: "Bar/Venue", notes: "Ybor City's sweaty small room." },
  { name: "Jannus Live", city: "St. Petersburg, FL", capacity: 2000, genres: ["Rock", "Indie", "Reggae", "Hip Hop"], pay: "$800+", booking_email: "booking@jannuslive.com", type: "Amphitheater", notes: "Downtown courtyard amphitheater." },
  { name: "The Bends", city: "St. Petersburg, FL", capacity: 200, genres: ["Indie", "Punk", "Rock", "Hip Hop"], pay: "$75-$300", booking_email: "booking@thebendsstpete.com", type: "Bar/Venue", notes: "Edge district dive with touring bands." },
  { name: "The High Dive", city: "Gainesville, FL", capacity: 350, genres: ["Indie", "Punk", "Rock", "Jam"], pay: "$150-$500", booking_email: "booking@thehighdivegville.com", type: "Club", notes: "Gator-town club for touring acts." },
  { name: "Jack Rabbit's", city: "Jacksonville, FL", capacity: 300, genres: ["Indie", "Punk", "Rock", "Metal"], pay: "$150-$500", booking_email: "booking@jackrabbits.com", type: "Bar/Venue", notes: "San Marco's long-running small room." },
  { name: "The Moon", city: "Tallahassee, FL", capacity: 700, genres: ["Rock", "Indie", "Jam", "Hip Hop"], pay: "$250-$800", booking_email: "booking@themoontlv.com", type: "Concert Hall", notes: "Tallahassee's main general-admission room." },
  { name: "The Wilbury", city: "Tallahassee, FL", capacity: 200, genres: ["Indie", "Rock", "Punk", "Folk"], pay: "$75-$300", booking_email: "booking@thewilbury.com", type: "Club", notes: "Grassroots collective-run small club." },

  // ── Tennessee ──
  { name: "Exit/In", city: "Nashville, TN", capacity: 500, genres: ["Rock", "Indie", "Punk", "Jam"], pay: "$200-$700", booking_email: "booking@exitin.com", type: "Club", notes: "Elliston Place icon since 1971." },
  { name: "The Basement", city: "Nashville, TN", capacity: 200, genres: ["Indie", "Rock", "Americana", "Singer-Songwriter"], pay: "$75-$300", booking_email: "booking@thebasementnashville.com", type: "Club", notes: "Tiny room below Grimey's record shop." },
  { name: "The Basement East", city: "Nashville, TN", capacity: 500, genres: ["Rock", "Indie", "Americana", "Jam"], pay: "$200-$700", booking_email: "booking@thebasementeast.com", type: "Club", notes: "East Nashville's big sibling room." },
  { name: "3rd & Lindsley", city: "Nashville, TN", capacity: 550, genres: ["Americana", "Rock", "Country", "Soul"], pay: "$250-$800", booking_email: "booking@3rdandlindsley.com", type: "Club", notes: "Great-sounding room near the stadium." },
  { name: "City Winery Nashville", city: "Nashville, TN", capacity: 300, genres: ["Americana", "Folk", "Soul", "Jazz"], pay: "$200-$700", booking_email: "booking@citywinery.com", type: "Club", notes: "Seated dinner-show format downtown." },
  { name: "Brooklyn Bowl Nashville", city: "Nashville, TN", capacity: 1200, genres: ["Rock", "Jam", "Funk", "Hip Hop"], pay: "$500-$2000", booking_email: "booking@brooklynbowl.com", type: "Concert Hall", notes: "Bowlero-plus-venue at the Nashville Yards." },
  { name: "Marathon Music Works", city: "Nashville, TN", capacity: 1500, genres: ["Rock", "Indie", "EDM", "Hip Hop"], pay: "$800+", booking_email: "booking@marathonmusicworks.com", type: "Concert Hall", notes: "Former Brewhouse, big general-admission room." },
  { name: "The Signal", city: "Chattanooga, TN", capacity: 1300, genres: ["Rock", "Indie", "Jam", "EDM"], pay: "$500-$2000", booking_email: "booking@thesignaltn.com", type: "Concert Hall", notes: "Chattanooga's flagship general-admission hall." },
  { name: "The Mill & Mine", city: "Knoxville, TN", capacity: 650, genres: ["Indie", "Rock", "Electronic", "Hip Hop"], pay: "$250-$800", booking_email: "booking@themmillandmine.com", type: "Concert Hall", notes: "Old City warehouse venue." },
  { name: "Bijou Theatre", city: "Knoxville, TN", capacity: 700, genres: ["Folk", "Americana", "Jazz", "Indie"], pay: "$250-$800", booking_email: "booking@bijoutheatre.com", type: "Theater", notes: "1909 jewel-box theater downtown." },
  { name: "Minglewood Hall", city: "Memphis, TN", capacity: 1500, genres: ["Rock", "Jam", "Indie", "Hip Hop"], pay: "$500-$2000", booking_email: "booking@minglewoodhall.com", type: "Concert Hall", notes: "Overton Square's main concert room." },
  { name: "The Green Room at Crosstown", city: "Memphis, TN", capacity: 200, genres: ["Indie", "Soul", "Jazz", "Experimental"], pay: "$75-$300", booking_email: "booking@crosstownarts.com", type: "Arts Venue", notes: "Volunteer-run listening room at Crosstown Concourse." },

  // ── Kentucky ──
  { name: "Headliners Music Hall", city: "Louisville, KY", capacity: 600, genres: ["Rock", "Indie", "Jam", "Americana"], pay: "$250-$800", booking_email: "booking@headlinerslouisville.com", type: "Concert Hall", notes: "Louisville's premier general-admission room." },
  { name: "Mercury Ballroom", city: "Louisville, KY", capacity: 900, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$400-$1200", booking_email: "booking@mercuryballroom.com", type: "Concert Hall", notes: "Theatrical second-floor ballroom downtown." },
  { name: "Zanzabar", city: "Louisville, KY", capacity: 300, genres: ["Indie", "Rock", "Punk", "Metal"], pay: "$100-$400", booking_email: "booking@zanzabar.com", type: "Bar/Venue", notes: "Arcade bar with a solid touring calendar." },
  { name: "The Green Lantern", city: "Lexington, KY", capacity: 150, genres: ["Punk", "Indie", "Rock", "Metal"], pay: "$75-$250", booking_email: "booking@greenlanternlex.com", type: "Bar/Venue", notes: "Lexington's dive-bar punk room." },
  { name: "Manchester Music Hall", city: "Lexington, KY", capacity: 800, genres: ["Rock", "Jam", "Country", "Americana"], pay: "$300-$1000", booking_email: "booking@manchestermusichall.com", type: "Concert Hall", notes: "Lexington's converted church hall." },
  { name: "Southgate House Revival", city: "Newport, KY", capacity: 750, genres: ["Rock", "Indie", "Punk", "Jam"], pay: "$250-$800", booking_email: "booking@southgatehouse.com", type: "Theater", notes: "Restored 1866 church across from Cincinnati." },

  // ── Alabama ──
  { name: "Saturn", city: "Birmingham, AL", capacity: 250, genres: ["Indie", "Rock", "Electronic", "Experimental"], pay: "$100-$400", booking_email: "booking@saturnbirmingham.com", type: "Club", notes: "Birmingham's modern live-and-dance room." },
  { name: "The Nick", city: "Birmingham, AL", capacity: 250, genres: ["Rock", "Punk", "Metal", "Blues"], pay: "$75-$300", booking_email: "booking@thenickrocks.com", type: "Bar/Venue", notes: "Birmingham's rock-and-roll dive." },
  { name: "WorkPlay", city: "Birmingham, AL", capacity: 450, genres: ["Rock", "Indie", "Jam", "Hip Hop"], pay: "$200-$700", booking_email: "booking@workplay.com", type: "Club", notes: "Southside studio-venue complex." },

  // ── Mississippi ──
  { name: "Martin's Downtown", city: "Jackson, MS", capacity: 250, genres: ["Rock", "Blues", "Indie", "Jam"], pay: "$100-$350", booking_email: "booking@martinsdowntown.com", type: "Bar/Venue", notes: "Jackson's dependable touring stop." },
  { name: "Duling Hall", city: "Jackson, MS", capacity: 350, genres: ["Americana", "Folk", "Rock", "Soul"], pay: "$150-$500", booking_email: "booking@dulinghall.com", type: "Arts Venue", notes: "Fondren's 1928 school hall turned venue." },
  { name: "The Lyric Oxford", city: "Oxford, MS", capacity: 500, genres: ["Rock", "Indie", "Americana", "Jam"], pay: "$200-$600", booking_email: "booking@thelyricoxford.com", type: "Theater", notes: "Ole Miss college-town theater room." },

  // ── Arkansas ──
  { name: "Vino's Brewpub", city: "Little Rock, AR", capacity: 250, genres: ["Punk", "Rock", "Indie", "Metal"], pay: "$75-$300", booking_email: "booking@vinosbrewpub.com", type: "Bar/Venue", notes: "Little Rock's punk-pizza institution." },
  { name: "JR's Lightbulb Club", city: "Fayetteville, AR", capacity: 200, genres: ["Punk", "Metal", "Indie", "Rock"], pay: "$75-$300", booking_email: "booking@jrsclub.com", type: "Club", notes: "All-ages Dickson Street basement room." },

  // ── Louisiana ──
  { name: "Tipitina's", city: "New Orleans, LA", capacity: 1000, genres: ["Funk", "Blues", "Jazz", "Jam"], pay: "$400-$1500", booking_email: "booking@tipitinas.com", type: "Club", notes: "The most famous music club in New Orleans." },
  { name: "The Howlin' Wolf", city: "New Orleans, LA", capacity: 600, genres: ["Rock", "Funk", "Jam", "Hip Hop"], pay: "$250-$800", booking_email: "booking@howlinwolfonline.com", type: "Club", notes: "Warehouse District den with two rooms." },
  { name: "d.b.a.", city: "New Orleans, LA", capacity: 250, genres: ["Blues", "Americana", "Rock", "Jazz"], pay: "$100-$400", booking_email: "booking@dbaneworleans.com", type: "Bar/Venue", notes: "Frenchmen Street listening bar." },
  { name: "Chickie Wah Wah", city: "New Orleans, LA", capacity: 200, genres: ["Americana", "Folk", "Blues", "Jazz"], pay: "$100-$350", booking_email: "booking@chickiewahwah.com", type: "Bar/Venue", notes: "Canal Street songwriter haven." },
  { name: "The Maison", city: "New Orleans, LA", capacity: 300, genres: ["Funk", "Jazz", "Brass", "Rock"], pay: "$150-$500", booking_email: "booking@maisonfrenchmen.com", type: "Club", notes: "Three-story Frenchmen Street club." },
  { name: "The Varsity Theatre", city: "Baton Rouge, LA", capacity: 1000, genres: ["Rock", "Indie", "Jam", "Hip Hop"], pay: "$400-$1500", booking_email: "booking@varsitytheatre.com", type: "Concert Hall", notes: "LSU's historic general-admission room." },
  { name: "Spanish Moon", city: "Baton Rouge, LA", capacity: 350, genres: ["Rock", "Indie", "Jam", "EDM"], pay: "$150-$500", booking_email: "booking@spanishmoonbr.com", type: "Club", notes: "Downtown Baton Rouge riverfront club." },
  { name: "The Blue Moon Saloon", city: "Lafayette, LA", capacity: 250, genres: ["Cajun", "Zydeco", "Americana", "Folk"], pay: "$100-$400", booking_email: "booking@bluemoonpresents.com", type: "Bar/Venue", notes: "Front-porch venue in Cajun country." },

  // ── Oklahoma ──
  { name: "Tower Theatre", city: "Oklahoma City, OK", capacity: 900, genres: ["Indie", "Rock", "Hip Hop", "Pop"], pay: "$400-$1200", booking_email: "booking@towertheatreokc.com", type: "Theater", notes: "Restored 1937 deco tower on Route 66." },
  { name: "The Jones Assembly", city: "Oklahoma City, OK", capacity: 1300, genres: ["Rock", "Indie", "Country", "Americana"], pay: "$500-$2000", booking_email: "booking@thejonesassembly.com", type: "Concert Hall", notes: "Film Row's restaurant-plus-venue complex." },
  { name: "Cain's Ballroom", city: "Tulsa, OK", capacity: 1700, genres: ["Rock", "Country", "Punk", "Swing"], pay: "$800+", booking_email: "booking@cainsballroom.com", type: "Concert Hall", notes: "Historic Cain's, the Home of Bob Wills." },
  { name: "The Vanguard", city: "Tulsa, OK", capacity: 400, genres: ["Indie", "Rock", "Hip Hop", "Electronic"], pay: "$200-$600", booking_email: "booking@thevanguardtulsa.com", type: "Club", notes: "Tulsa's mid-size general-admission club." },
  { name: "Tulsa Theater", city: "Tulsa, OK", capacity: 2300, genres: ["Rock", "Pop", "Latin", "Hip Hop"], pay: "$800+", booking_email: "booking@tulsatheater.com", type: "Theater", notes: "Former Brady Theater, 1914 relic." },

  // ── Texas ──
  { name: "Mohawk", city: "Austin, TX", capacity: 700, genres: ["Indie", "Rock", "Punk", "Hip Hop"], pay: "$250-$800", booking_email: "booking@mohawkaustin.com", type: "Club", notes: "Red River two-stage club, Austin staple." },
  { name: "Emo's", city: "Austin, TX", capacity: 1700, genres: ["Rock", "Metal", "Punk", "Indie"], pay: "$500-$2000", booking_email: "booking@emos.com", type: "Concert Hall", notes: "Riverside location of the Austin punk landmark." },
  { name: "Hotel Vegas", city: "Austin, TX", capacity: 400, genres: ["Rock", "Punk", "Latin", "Psychedelic"], pay: "$150-$500", booking_email: "booking@hotelvegasaustin.com", type: "Bar/Venue", notes: "East Austin tequila-bar compound." },
  { name: "Stubb's Bar-B-Q", city: "Austin, TX", capacity: 2200, genres: ["Rock", "Indie", "Country", "Hip Hop"], pay: "$800+", booking_email: "booking@stubbsaustin.com", type: "Amphitheater", notes: "Wall-sized amphitheater behind the BBQ joint." },
  { name: "Antone's", city: "Austin, TX", capacity: 450, genres: ["Blues", "Roots", "Rock", "Soul"], pay: "$200-$700", booking_email: "booking@antones.net", type: "Club", notes: "Austin's Home of the Blues since 1975." },
  { name: "The Continental Club", city: "Austin, TX", capacity: 300, genres: ["Rockabilly", "Roots", "Country", "Blues"], pay: "$150-$500", booking_email: "booking@continentalclub.com", type: "Club", notes: "South Congress's legendary 1955 room." },
  { name: "Saxon Pub", city: "Austin, TX", capacity: 150, genres: ["Singer-Songwriter", "Americana", "Folk", "Blues"], pay: "$100-$400", booking_email: "booking@saxonpub.com", type: "Bar/Venue", notes: "Lamar songwriter sanctum with nightly acts." },
  { name: "The Parish", city: "Austin, TX", capacity: 450, genres: ["Indie", "Rock", "Electronic", "Hip Hop"], pay: "$200-$700", booking_email: "booking@theparishaustin.com", type: "Club", notes: "Sixth Street's best-sounding upstairs room." },
  { name: "Trees", city: "Dallas, TX", capacity: 1000, genres: ["Rock", "Indie", "Metal", "Hip Hop"], pay: "$400-$1500", booking_email: "booking@treesdallas.com", type: "Club", notes: "Deep Ellum's flagship club since 1990." },
  { name: "The Bomb Factory", city: "Dallas, TX", capacity: 4300, genres: ["Rock", "EDM", "Hip Hop", "Pop"], pay: "$800+", booking_email: "booking@thebombfactory.com", type: "Concert Hall", notes: "Deep Ellum's former bomb plant, big tours." },
  { name: "Granada Theater", city: "Dallas, TX", capacity: 1000, genres: ["Indie", "Rock", "Jam", "Country"], pay: "$400-$1200", booking_email: "booking@granadatheater.com", type: "Theater", notes: "Lower Greenville's 1949 movie house." },
  { name: "Deep Ellum Art Co.", city: "Dallas, TX", capacity: 700, genres: ["Indie", "Electronic", "Hip Hop", "Latin"], pay: "$250-$800", booking_email: "booking@deeplumart.com", type: "Club", notes: "Art-gallery venue with a patio stage." },
  { name: "The Kessler Theater", city: "Dallas, TX", capacity: 400, genres: ["Americana", "Singer-Songwriter", "Rock", "Jazz"], pay: "$200-$600", booking_email: "booking@kesslertheater.org", type: "Theater", notes: "Oak Cliff's living-room theater." },
  { name: "Sons of Hermann Hall", city: "Dallas, TX", capacity: 600, genres: ["Country", "Swing", "Blues", "Americana"], pay: "$250-$700", booking_email: "booking@sonsofhermann.com", type: "Theater", notes: "1910 lodge hall with dances and shows." },
  { name: "The Longhorn Ballroom", city: "Dallas, TX", capacity: 2000, genres: ["Country", "Rock", "Punk", "Latin"], pay: "$800+", booking_email: "booking@longhornballroom.net", type: "Concert Hall", notes: "1930s ballroom, Sinatra to Sex Pistols." },
  { name: "White Oak Music Hall", city: "Houston, TX", capacity: 1500, genres: ["Rock", "Indie", "Metal", "Hip Hop"], pay: "$500-$2000", booking_email: "booking@whiteoakmusichall.com", type: "Concert Hall", notes: "Houston's main general-admission complex." },
  { name: "House of Blues Houston", city: "Houston, TX", capacity: 1000, genres: ["Blues", "Rock", "R&B", "Hip Hop"], pay: "$400-$1500", booking_email: "booking@hob.com", type: "Concert Hall", notes: "Downtown Houston HOB with folk-art interior." },
  { name: "Walter's Downtown", city: "Houston, TX", capacity: 500, genres: ["Indie", "Punk", "Rock", "Metal"], pay: "$200-$600", booking_email: "booking@waltersdowntown.com", type: "Bar/Venue", notes: "Aircraft-room venue, Houston DIY heart." },
  { name: "The Heights Theater", city: "Houston, TX", capacity: 700, genres: ["Soul", "R&B", "Rock", "Jazz"], pay: "$250-$800", booking_email: "booking@theheightstheater.com", type: "Theater", notes: "Restored 1929 Heights movie house." },
  { name: "The Aztec Theatre", city: "San Antonio, TX", capacity: 1500, genres: ["Rock", "Latin", "Pop", "Hip Hop"], pay: "$500-$2000", booking_email: "booking@aztectheatre.com", type: "Theater", notes: "Mesoamerican-themed 1926 downtown theater." },
  { name: "Paper Tiger", city: "San Antonio, TX", capacity: 700, genres: ["Punk", "Indie", "Rock", "Hip Hop"], pay: "$250-$800", booking_email: "booking@papertigersatx.com", type: "Club", notes: "St. Mary's Strip club for touring bills." },
  { name: "Sam's Burger Joint", city: "San Antonio, TX", capacity: 500, genres: ["Rock", "Blues", "Americana", "Jam"], pay: "$200-$600", booking_email: "booking@samsburgerjoint.com", type: "Bar/Venue", notes: "Burgers and bands on Grayson Street." },
  { name: "Tulips", city: "Fort Worth, TX", capacity: 400, genres: ["Indie", "Rock", "Hip Hop", "EDM"], pay: "$200-$600", booking_email: "booking@tulipsftw.com", type: "Club", notes: "Near South Side venue with daily shows." },
];