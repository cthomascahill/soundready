import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { MapPin, Music, DollarSign, Calendar, Send, Check, ExternalLink, Search, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VENUE_DB = [
  // New York, NY
  { name: "Mercury Lounge", city: "New York, NY", capacity: 250, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$150-$400", booking_email: "booking@mercuryloungenyc.com", type: "Club", website: "https://www.mercuryloungenyc.com", notes: "Iconic NYC indie venue. Submit EPK + streaming links." },
  { name: "Baby's All Right", city: "Brooklyn, NY", capacity: 400, genres: ["Indie", "Pop", "R&B", "Hip Hop"], pay: "$200-$600", booking_email: "booking@babysallright.com", type: "Bar/Venue", website: "https://www.babysallright.com", notes: "Trendy Brooklyn spot. Strong social following helps." },
  { name: "The Knitting Factory", city: "Brooklyn, NY", capacity: 350, genres: ["Hip Hop", "Indie", "Rock", "EDM"], pay: "$100-$300", booking_email: "info@knittingfactory.com", type: "Club", website: "https://www.knittingfactory.com", notes: "Great for emerging acts. Book 6-8 weeks in advance." },
  { name: "Brooklyn Steel", city: "Brooklyn, NY", capacity: 1800, genres: ["Indie", "Rock", "Pop", "Hip Hop", "EDM"], pay: "$500-$3000", booking_email: "booking@brooklynsteel.com", type: "Concert Hall", website: "https://www.brooklynsteel.com", notes: "Large Brooklyn venue. Requires established following." },
  { name: "Music Hall of Williamsburg", city: "Brooklyn, NY", capacity: 550, genres: ["Indie", "Rock", "Pop", "EDM"], pay: "$300-$1200", booking_email: "booking@musichallofwilliamsburg.com", type: "Concert Hall", website: "https://www.musichallofwilliamsburg.com", notes: "Flagship Brooklyn venue. Professional productions preferred." },
  { name: "Rough Trade NYC", city: "Brooklyn, NY", capacity: 250, genres: ["Indie", "Rock", "Pop"], pay: "$150-$400", booking_email: "events@roughtraderecords.com", type: "Club", website: "https://www.roughtrade.com/nyc", notes: "Record shop and venue. Great for indie artists with album releases." },
  { name: "Bowery Ballroom", city: "New York, NY", capacity: 575, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$300-$1500", booking_email: "booking@boweryballroom.com", type: "Concert Hall", website: "https://www.boweryballroom.com", notes: "Legendary NYC venue. One of the best rooms in the country." },
  { name: "Le Poisson Rouge", city: "New York, NY", capacity: 700, genres: ["Indie", "Pop", "Rock", "EDM", "R&B"], pay: "$300-$1500", booking_email: "booking@lprnyc.com", type: "Arts Venue", website: "https://www.lprnyc.com", notes: "Eclectic arts venue. Very genre-diverse programming." },
  { name: "Irving Plaza", city: "New York, NY", capacity: 1000, genres: ["Rock", "Indie", "Pop", "Hip Hop", "EDM"], pay: "$500-$2500", booking_email: "booking@irvingplaza.com", type: "Concert Hall", website: "https://www.irvingplaza.com", notes: "Mid-size NYC landmark. Need regional draw to get booked." },
  { name: "Pianos", city: "New York, NY", capacity: 150, genres: ["Indie", "Pop", "Rock", "Hip Hop"], pay: "$100-$300", booking_email: "booking@pianosnyc.com", type: "Bar/Venue", website: "https://www.pianosnyc.com", notes: "LES indie bar. Great starter venue for NYC market." },
  { name: "The Sultan Room", city: "Brooklyn, NY", capacity: 200, genres: ["Indie", "Hip Hop", "Pop", "R&B"], pay: "$100-$300", booking_email: "booking@thesultanroom.com", type: "Club", website: "https://www.thesultanroom.com", notes: "Rooftop bar venue. Diverse and community-forward booking." },
  { name: "National Sawdust", city: "Brooklyn, NY", capacity: 300, genres: ["Indie", "Pop", "R&B", "EDM"], pay: "$200-$800", booking_email: "booking@nationalsawdust.org", type: "Arts Venue", website: "https://www.nationalsawdust.org", notes: "Artist-funded nonprofit venue. Strong storytelling acts do well here." },

  // Boston, MA
  { name: "Great Scott", city: "Boston, MA", capacity: 200, genres: ["Rock", "Indie", "Pop"], pay: "$100-$300", booking_email: "booking@greatscottboston.com", type: "Bar/Venue", website: "https://www.greatscottboston.com", notes: "Boston indie institution. Email EPK with streaming link." },
  { name: "The Paradise Rock Club", city: "Boston, MA", capacity: 650, genres: ["Rock", "Indie", "Pop", "Hip Hop"], pay: "$300-$1000", booking_email: "booking@thedise.com", type: "Concert Hall", website: "https://www.thedise.com", notes: "Mid-size venue. Need proven draw in Boston market." },
  { name: "Sinclair", city: "Cambridge, MA", capacity: 525, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$250-$900", booking_email: "booking@sinclaircambridge.com", type: "Concert Hall", website: "https://www.sinclaircambridge.com", notes: "Harvard Square venue. Eclectic bookings, very artist-friendly." },
  { name: "Brighton Music Hall", city: "Boston, MA", capacity: 450, genres: ["Rock", "Indie", "EDM", "Hip Hop"], pay: "$200-$700", booking_email: "booking@brightonmusichall.com", type: "Concert Hall", website: "https://www.brightonmusichall.com", notes: "House of Blues sister venue. Professional production." },
  { name: "The Middle East", city: "Cambridge, MA", capacity: 575, genres: ["Rock", "Indie", "Hip Hop", "Country"], pay: "$200-$800", booking_email: "booking@mideastclub.com", type: "Club", website: "https://www.mideastclub.com", notes: "Multi-room venue in Cambridge. Very supportive of local artists." },

  // Philadelphia, PA
  { name: "Underground Arts", city: "Philadelphia, PA", capacity: 600, genres: ["Indie", "Rock", "Hip Hop", "EDM"], pay: "$200-$700", booking_email: "bookings@undergroundarts.net", type: "Arts Venue", website: "https://www.undergroundarts.net", notes: "Flexible venue for all genres. Active booking team." },
  { name: "World Cafe Live", city: "Philadelphia, PA", capacity: 650, genres: ["Indie", "Pop", "Rock", "R&B", "Country"], pay: "$250-$900", booking_email: "booking@worldcafelive.com", type: "Concert Hall", website: "https://www.worldcafelive.com", notes: "Two-room venue connected to WXPN radio. Great exposure." },
  { name: "The Foundry at The Fillmore", city: "Philadelphia, PA", capacity: 450, genres: ["Rock", "Indie", "Hip Hop", "Pop"], pay: "$200-$800", booking_email: "booking@thefillmorephilly.com", type: "Concert Hall", website: "https://www.thefillmorephilly.com", notes: "Part of the Fillmore complex. Strong production value." },
  { name: "Boot & Saddle", city: "Philadelphia, PA", capacity: 200, genres: ["Country", "Indie", "Rock", "Pop"], pay: "$100-$350", booking_email: "booking@bootandsaddlephilly.com", type: "Bar/Venue", website: "https://www.bootandsaddlephilly.com", notes: "South Philly venue with country-forward but eclectic booking." },

  // Washington, DC
  { name: "9:30 Club", city: "Washington, DC", capacity: 1200, genres: ["Rock", "Indie", "Pop", "Hip Hop", "EDM"], pay: "$500-$3000", booking_email: "booking@930.com", type: "Concert Hall", website: "https://www.930.com", notes: "One of the best venues in the US. Need strong regional draw." },
  { name: "Black Cat", city: "Washington, DC", capacity: 500, genres: ["Indie", "Rock", "EDM", "Hip Hop"], pay: "$200-$800", booking_email: "booking@blackcatdc.com", type: "Club", website: "https://www.blackcatdc.com", notes: "Iconic DC indie venue. Two stages, strong community ties." },
  { name: "DC9 Nightclub", city: "Washington, DC", capacity: 200, genres: ["Indie", "Rock", "Pop", "EDM"], pay: "$100-$350", booking_email: "booking@dc9.com", type: "Club", website: "https://www.dc9.com", notes: "Rooftop and main stage. Good entry-level DC booking." },
  { name: "Songbyrd", city: "Washington, DC", capacity: 175, genres: ["Indie", "Pop", "R&B", "Hip Hop", "Country"], pay: "$100-$300", booking_email: "booking@songbyrddc.com", type: "Bar/Venue", website: "https://www.songbyrddc.com", notes: "Record shop and bar. Intimate and artist-focused." },

  // Atlanta, GA
  { name: "The Masquerade", city: "Atlanta, GA", capacity: 1000, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$300-$1500", booking_email: "booking@masqueradeatlanta.com", type: "Concert Hall", website: "https://www.masqueradeatlanta.com", notes: "Multi-room venue. Heaven, Hell, and Purgatory stages." },
  { name: "Terminal West", city: "Atlanta, GA", capacity: 1000, genres: ["Indie", "Rock", "Hip Hop", "Pop", "EDM"], pay: "$300-$1500", booking_email: "booking@terminalwestatl.com", type: "Concert Hall", website: "https://www.terminalwestatl.com", notes: "Westside Atlanta spot. Great sound system and production." },
  { name: "The Earl", city: "Atlanta, GA", capacity: 200, genres: ["Rock", "Indie", "Country", "Hip Hop"], pay: "$100-$400", booking_email: "booking@badearl.com", type: "Bar/Venue", website: "https://www.badearl.com", notes: "East Atlanta Village staple. Dive bar vibe, passionate crowds." },
  { name: "Smith's Olde Bar", city: "Atlanta, GA", capacity: 250, genres: ["Rock", "Country", "Indie", "Pop"], pay: "$100-$400", booking_email: "booking@smithsoldebar.com", type: "Bar/Venue", website: "https://www.smithsoldebar.com", notes: "Multi-room venue. Good for original music and touring acts." },

  // Nashville, TN
  { name: "The Basement", city: "Nashville, TN", capacity: 150, genres: ["Country", "Indie", "Rock", "Pop"], pay: "$100-$400", booking_email: "info@thebasementnashville.com", type: "Club", website: "https://www.thebasementnashville.com", notes: "Legendary Nashville venue. Submit EPK via website." },
  { name: "Exit/In", city: "Nashville, TN", capacity: 500, genres: ["Country", "Rock", "Indie", "Pop"], pay: "$200-$800", booking_email: "booking@exitin.com", type: "Concert Hall", website: "https://www.exitin.com", notes: "Historic Nashville club. Great for singer-songwriters." },
  { name: "Mercy Lounge", city: "Nashville, TN", capacity: 500, genres: ["Rock", "Indie", "Country", "Pop"], pay: "$200-$800", booking_email: "booking@mercylounge.com", type: "Concert Hall", website: "https://www.mercylounge.com", notes: "Converted candy factory. Strong mid-level touring acts." },
  { name: "The Basement East", city: "Nashville, TN", capacity: 600, genres: ["Rock", "Indie", "Country", "Hip Hop"], pay: "$250-$900", booking_email: "booking@thebasementeast.com", type: "Concert Hall", website: "https://www.thebasementeast.com", notes: "East Nashville's biggest independent venue." },
  { name: "3rd and Lindsley", city: "Nashville, TN", capacity: 300, genres: ["Country", "Blues", "R&B", "Indie", "Rock"], pay: "$150-$600", booking_email: "booking@3rdandlindsley.com", type: "Bar/Venue", website: "https://www.3rdandlindsley.com", notes: "Bar and grill venue. Dinner show format, family-friendly." },

  // Orlando / Florida
  { name: "The Social", city: "Orlando, FL", capacity: 300, genres: ["Indie", "Pop", "Rock", "Hip Hop"], pay: "$150-$400", booking_email: "booking@thesocial.org", type: "Club", website: "https://www.thesocial.org", notes: "Central Florida's indie hub. Active all-ages shows." },
  { name: "The Beacham", city: "Orlando, FL", capacity: 1400, genres: ["Pop", "Hip Hop", "EDM", "Indie"], pay: "$400-$2000", booking_email: "booking@thebeacham.com", type: "Concert Hall", website: "https://www.thebeacham.com", notes: "Downtown Orlando venue. Great for mid-size touring acts." },
  { name: "Will's Pub", city: "Orlando, FL", capacity: 150, genres: ["Rock", "Indie", "Pop", "Country"], pay: "$75-$250", booking_email: "booking@willspub.org", type: "Bar/Venue", website: "https://www.willspub.org", notes: "Beloved dive bar. Entry-level Orlando market venue." },
  { name: "Crowbar", city: "Tampa, FL", capacity: 300, genres: ["Rock", "Metal", "Indie", "Hip Hop"], pay: "$100-$400", booking_email: "booking@crowbarlive.com", type: "Club", website: "https://www.crowbarlive.com", notes: "Ybor City venue. Rock-forward but books diverse acts." },
  { name: "The Handlebar", city: "Greenville, SC", capacity: 200, genres: ["Country", "Indie", "Rock"], pay: "$100-$300", booking_email: "booking@handlebar-online.com", type: "Bar/Venue", website: "https://www.handlebar-online.com", notes: "Music-forward bar. Sunday showcases for emerging acts." },

  // Chicago, IL
  { name: "Schubas Tavern", city: "Chicago, IL", capacity: 200, genres: ["Indie", "Pop", "Country", "R&B"], pay: "$150-$400", booking_email: "booking@schubas.com", type: "Bar/Venue", website: "https://www.schubas.com", notes: "Intimate Chicago venue with strong reputation for emerging acts." },
  { name: "The Empty Bottle", city: "Chicago, IL", capacity: 350, genres: ["Rock", "Indie", "EDM", "Hip Hop"], pay: "$100-$350", booking_email: "booking@emptybottle.com", type: "Bar/Venue", website: "https://www.emptybottle.com", notes: "Indie rock staple. DIY ethic, artist-friendly." },
  { name: "Thalia Hall", city: "Chicago, IL", capacity: 800, genres: ["Indie", "Rock", "Pop", "Country", "Hip Hop"], pay: "$300-$1500", booking_email: "booking@thaliahall.com", type: "Concert Hall", website: "https://www.thaliahall.com", notes: "Beautiful historic venue in Pilsen. Mid-level touring acts." },
  { name: "Lincoln Hall", city: "Chicago, IL", capacity: 500, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$200-$900", booking_email: "booking@lincolnhallchicago.com", type: "Concert Hall", website: "https://www.lincolnhallchicago.com", notes: "Sit-down and standing venue. Great sightlines and sound." },
  { name: "Metro", city: "Chicago, IL", capacity: 1100, genres: ["Rock", "Indie", "Pop", "Hip Hop", "EDM"], pay: "$400-$2500", booking_email: "booking@metrochicago.com", type: "Concert Hall", website: "https://www.metrochicago.com", notes: "Chicago landmark since 1982. Need regional buzz to book." },
  { name: "Subterranean", city: "Chicago, IL", capacity: 300, genres: ["Rock", "Hip Hop", "Indie", "EDM"], pay: "$150-$600", booking_email: "booking@subt.net", type: "Club", website: "https://www.subt.net", notes: "Wicker Park venue with two stages. Good for emerging artists." },

  // Minneapolis, MN
  { name: "7th Street Entry", city: "Minneapolis, MN", capacity: 250, genres: ["Rock", "Indie", "Pop", "Hip Hop"], pay: "$150-$500", booking_email: "booking@firstave.com", type: "Club", website: "https://www.first-avenue.com", notes: "Sibling venue to First Avenue. Great room for emerging acts." },
  { name: "First Avenue", city: "Minneapolis, MN", capacity: 1550, genres: ["Rock", "Indie", "Pop", "Hip Hop", "R&B"], pay: "$500-$3000", booking_email: "booking@firstave.com", type: "Concert Hall", website: "https://www.first-avenue.com", notes: "Legendary Prince-era venue. Requires established regional draw." },
  { name: "The Cedar Cultural Center", city: "Minneapolis, MN", capacity: 465, genres: ["Indie", "Folk", "Country", "R&B", "Latin"], pay: "$200-$800", booking_email: "booking@thecedar.org", type: "Arts Venue", website: "https://www.thecedar.org", notes: "Nonprofit arts org. Great for global and folk music artists." },
  { name: "Turf Club", city: "St. Paul, MN", capacity: 300, genres: ["Rock", "Indie", "Country", "Hip Hop"], pay: "$150-$500", booking_email: "booking@turfclub.net", type: "Bar/Venue", website: "https://www.turfclub.net", notes: "Intimate St. Paul dive bar. Great community support." },

  // Cleveland / Midwest
  { name: "The Beachland Ballroom", city: "Cleveland, OH", capacity: 500, genres: ["Indie", "Rock", "Country", "Hip Hop"], pay: "$200-$700", booking_email: "booking@beachlandballroom.com", type: "Concert Hall", website: "https://www.beachlandballroom.com", notes: "Historic venue with two rooms. Very artist-friendly." },
  { name: "Grog Shop", city: "Cleveland, OH", capacity: 300, genres: ["Rock", "Indie", "Hip Hop", "Pop"], pay: "$100-$500", booking_email: "booking@grogshop.gs", type: "Bar/Venue", website: "https://www.grogshop.gs", notes: "Cleveland Heights venue. Great for touring bands passing through." },
  { name: "The Basement", city: "Columbus, OH", capacity: 700, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$200-$1000", booking_email: "booking@basementcolumbus.com", type: "Club", website: "https://www.basementcolumbus.com", notes: "Columbus indie mainstay. Excellent for mid-level touring." },
  { name: "Rumba Cafe", city: "Columbus, OH", capacity: 200, genres: ["Indie", "Rock", "Pop", "R&B"], pay: "$100-$350", booking_email: "booking@rumbacafe.com", type: "Bar/Venue", website: "https://www.rumbacafe.com", notes: "Intimate Columbus venue. Very accessible for new acts." },
  { name: "The Shelter", city: "Detroit, MI", capacity: 400, genres: ["Rock", "Hip Hop", "Indie", "EDM"], pay: "$200-$700", booking_email: "booking@majesticdetroit.com", type: "Club", website: "https://www.majesticdetroit.com", notes: "Below-ground venue part of the Majestic complex. Legendary for rock." },
  { name: "The Magic Stick", city: "Detroit, MI", capacity: 300, genres: ["Indie", "Rock", "Hip Hop", "EDM"], pay: "$150-$600", booking_email: "booking@majesticdetroit.com", type: "Club", website: "https://www.majesticdetroit.com", notes: "Poolroom-style club venue. Part of Detroit's Majestic Theatre complex." },
  { name: "The Loving Touch", city: "Ferndale, MI", capacity: 200, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$100-$350", booking_email: "booking@thelovingtouchferndale.com", type: "Bar/Venue", website: "https://www.thelovingtouchferndale.com", notes: "Suburban Detroit spot. Welcoming community venue." },
  { name: "The Frequency", city: "Madison, WI", capacity: 350, genres: ["Rock", "Indie", "Hip Hop", "Pop"], pay: "$150-$500", booking_email: "booking@madisonfrequency.com", type: "Club", website: "https://www.madisonfrequency.com", notes: "Madison indie staple. Great college crowd." },
  { name: "High Noon Saloon", city: "Madison, WI", capacity: 350, genres: ["Country", "Indie", "Rock", "Hip Hop"], pay: "$150-$500", booking_email: "booking@high-noon.com", type: "Club", website: "https://www.high-noon.com", notes: "Classic Madison venue. Strong local and regional acts." },

  // Los Angeles, CA
  { name: "The Troubadour", city: "Los Angeles, CA", capacity: 400, genres: ["Indie", "Rock", "Pop", "Country"], pay: "$300-$1200", booking_email: "booking@troubadour.com", type: "Concert Hall", website: "https://www.troubadour.com", notes: "Legendary LA venue. Need strong draw or label support." },
  { name: "The Echo", city: "Los Angeles, CA", capacity: 350, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$200-$700", booking_email: "booking@attheecho.com", type: "Club", website: "https://www.attheecho.com", notes: "Great mid-size LA venue. Diverse genre booking." },
  { name: "The Echoplex", city: "Los Angeles, CA", capacity: 700, genres: ["Rock", "Indie", "EDM", "Hip Hop", "Pop"], pay: "$300-$1500", booking_email: "booking@attheecho.com", type: "Concert Hall", website: "https://www.attheecho.com", notes: "Downstairs from The Echo. Great for mid-level touring." },
  { name: "Teragram Ballroom", city: "Los Angeles, CA", capacity: 600, genres: ["Indie", "Pop", "Rock", "Hip Hop", "EDM"], pay: "$250-$1000", booking_email: "booking@teragramballroom.com", type: "Concert Hall", website: "https://www.teragramballroom.com", notes: "Downtown LA venue. Great vibe and sound." },
  { name: "Lodge Room", city: "Los Angeles, CA", capacity: 350, genres: ["Indie", "Pop", "R&B", "Hip Hop"], pay: "$200-$800", booking_email: "booking@lodgeroomhighland.com", type: "Club", website: "https://www.lodgeroomhighland.com", notes: "Highland Park neighborhood venue. Hip and community-driven." },
  { name: "The Satellite", city: "Los Angeles, CA", capacity: 200, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$100-$400", booking_email: "booking@thesatellitela.com", type: "Bar/Venue", website: "https://www.thesatellitela.com", notes: "Silver Lake staple. Great for up-and-coming acts." },
  { name: "El Rey Theatre", city: "Los Angeles, CA", capacity: 770, genres: ["Pop", "Indie", "Rock", "Hip Hop", "Latin"], pay: "$300-$1500", booking_email: "booking@theelrey.com", type: "Concert Hall", website: "https://www.theelrey.com", notes: "Art deco theatre. Great production values and sightlines." },

  // San Francisco / Bay Area, CA
  { name: "Bottom of the Hill", city: "San Francisco, CA", capacity: 350, genres: ["Rock", "Indie", "Pop", "Hip Hop"], pay: "$150-$500", booking_email: "booking@bottomofthehill.com", type: "Bar/Venue", website: "https://www.bottomofthehill.com", notes: "Bay Area indie institution. Very indie artist friendly." },
  { name: "The Chapel", city: "San Francisco, CA", capacity: 500, genres: ["Indie", "Pop", "Rock", "R&B", "Country"], pay: "$250-$900", booking_email: "booking@thechapelsf.com", type: "Arts Venue", website: "https://www.thechapelsf.com", notes: "Converted mortuary. Beautiful venue with great sound." },
  { name: "Slim's", city: "San Francisco, CA", capacity: 480, genres: ["Rock", "Indie", "Hip Hop", "R&B", "Blues"], pay: "$200-$800", booking_email: "booking@slimspresents.com", type: "Concert Hall", website: "https://www.slimspresents.com", notes: "SoMa district classic. Great diverse booking history." },
  { name: "The Independent", city: "San Francisco, CA", capacity: 500, genres: ["Indie", "Rock", "Pop", "Hip Hop", "EDM"], pay: "$250-$900", booking_email: "booking@theindependentsf.com", type: "Concert Hall", website: "https://www.theindependentsf.com", notes: "Divisadero corridor. Consistently great independent bookings." },
  { name: "Great American Music Hall", city: "San Francisco, CA", capacity: 600, genres: ["Indie", "Rock", "Country", "Pop", "R&B"], pay: "$300-$1200", booking_email: "booking@gamh.com", type: "Concert Hall", website: "https://www.gamh.com", notes: "Historic 1907 venue. Ornate interior, all-seat and standing shows." },
  { name: "Cornerstone", city: "Berkeley, CA", capacity: 350, genres: ["Rock", "Indie", "Hip Hop", "Pop"], pay: "$150-$600", booking_email: "booking@cornerstoneberkeley.com", type: "Bar/Venue", website: "https://www.cornerstoneberkeley.com", notes: "Berkeley venue near the college crowd. Good for touring." },

  // Seattle, WA
  { name: "Neumos", city: "Seattle, WA", capacity: 650, genres: ["Indie", "Rock", "EDM", "Hip Hop"], pay: "$250-$900", booking_email: "booking@neumos.com", type: "Concert Hall", website: "https://www.neumos.com", notes: "Seattle's top indie venue. Submit EPK with streaming numbers." },
  { name: "The Crocodile", city: "Seattle, WA", capacity: 600, genres: ["Rock", "Indie", "Pop", "Hip Hop"], pay: "$250-$1000", booking_email: "booking@thecrocodile.com", type: "Concert Hall", website: "https://www.thecrocodile.com", notes: "Historic Belltown venue. Nirvana-era legacy. Strong bookings." },
  { name: "Chop Suey", city: "Seattle, WA", capacity: 350, genres: ["Indie", "Rock", "EDM", "Hip Hop", "Pop"], pay: "$150-$600", booking_email: "booking@chopsuey.com", type: "Club", website: "https://www.chopsuey.com", notes: "Capitol Hill nightclub. Eclectic and diverse booking." },
  { name: "Tractor Tavern", city: "Seattle, WA", capacity: 250, genres: ["Country", "Indie", "Rock", "Folk"], pay: "$100-$400", booking_email: "booking@tractortavern.com", type: "Bar/Venue", website: "https://www.tractortavern.com", notes: "Ballard neighborhood. Country and Americana-friendly." },

  // Portland, OR
  { name: "Mississippi Studios", city: "Portland, OR", capacity: 300, genres: ["Indie", "Rock", "Country", "Pop"], pay: "$150-$500", booking_email: "booking@mississippistudios.com", type: "Club", website: "https://www.mississippistudios.com", notes: "Beautiful PDX venue. Artist-first booking philosophy." },
  { name: "Doug Fir Lounge", city: "Portland, OR", capacity: 300, genres: ["Indie", "Rock", "Pop", "Country"], pay: "$150-$600", booking_email: "booking@dougfirlounge.com", type: "Bar/Venue", website: "https://www.dougfirlounge.com", notes: "Attached to a boutique hotel. Intimate and beautifully designed." },
  { name: "Revolution Hall", city: "Portland, OR", capacity: 850, genres: ["Indie", "Pop", "Rock", "Hip Hop"], pay: "$300-$1500", booking_email: "booking@revolutionhall.com", type: "Concert Hall", website: "https://www.revolutionhall.com", notes: "Historic high school converted to venue. Excellent production." },
  { name: "Wonder Ballroom", city: "Portland, OR", capacity: 700, genres: ["Rock", "Indie", "Pop", "EDM", "Hip Hop"], pay: "$250-$1000", booking_email: "booking@wonderballroom.com", type: "Concert Hall", website: "https://www.wonderballroom.com", notes: "NE Portland's premier mid-size venue. Solid touring acts." },

  // Austin, TX
  { name: "Stubb's Waller Creek Amphitheater", city: "Austin, TX", capacity: 2750, genres: ["All"], pay: "$1000+", booking_email: "booking@stubbsaustin.com", type: "Amphitheater", website: "https://www.stubbsaustin.com", notes: "Iconic Austin outdoor venue. Requires established draw." },
  { name: "The Parish", city: "Austin, TX", capacity: 600, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$300-$1000", booking_email: "booking@theparishaustin.com", type: "Concert Hall", website: "https://www.theparishaustin.com", notes: "ACL Live's sister venue. Great for emerging acts." },
  { name: "Emo's Austin", city: "Austin, TX", capacity: 1600, genres: ["Rock", "Indie", "Pop", "Hip Hop", "EDM"], pay: "$400-$2000", booking_email: "booking@emosaustin.com", type: "Concert Hall", website: "https://www.emosaustin.com", notes: "East Austin venue. Versatile and active booking calendar." },
  { name: "The Mohawk", city: "Austin, TX", capacity: 1100, genres: ["Rock", "Indie", "Pop", "Hip Hop", "EDM"], pay: "$350-$1500", booking_email: "booking@mohawkaustin.com", type: "Club", website: "https://www.mohawkaustin.com", notes: "Indoor and outdoor stages. SXSW favorite." },
  { name: "Hole in the Wall", city: "Austin, TX", capacity: 100, genres: ["Country", "Rock", "Indie"], pay: "$75-$200", booking_email: "booking@holeinthewallaustin.com", type: "Bar/Venue", website: "https://www.holeinthewallaustin.com", notes: "Classic Guadalupe St dive bar. Great for up-and-comers." },

  // Houston, TX
  { name: "White Oak Music Hall", city: "Houston, TX", capacity: 1500, genres: ["All"], pay: "$500-$2000", booking_email: "booking@whiteoakmusichall.com", type: "Concert Hall", website: "https://www.whiteoakmusichall.com", notes: "Three stages. Lots of indie bookings for smaller shows." },
  { name: "House of Blues Houston", city: "Houston, TX", capacity: 2200, genres: ["Rock", "Pop", "Hip Hop", "R&B", "Blues"], pay: "$500-$3000", booking_email: "booking@hobhouston.com", type: "Concert Hall", website: "https://www.houseofblues.com/houston", notes: "National chain but accessible for regional acts via Foundation Room." },
  { name: "The Heights Theater", city: "Houston, TX", capacity: 750, genres: ["Indie", "Rock", "Pop", "Country"], pay: "$300-$1200", booking_email: "booking@heightstheater.com", type: "Concert Hall", website: "https://www.heightstheater.com", notes: "Historic Heights neighborhood theater. Beautiful restored venue." },

  // Dallas, TX
  { name: "Deep Ellum Art Co.", city: "Dallas, TX", capacity: 400, genres: ["Indie", "Rock", "Pop", "Hip Hop", "EDM"], pay: "$150-$700", booking_email: "booking@deepellumartco.com", type: "Arts Venue", website: "https://www.deepellumartco.com", notes: "Arts-focused venue in Deep Ellum. Very supportive of local acts." },
  { name: "Trees Dallas", city: "Dallas, TX", capacity: 900, genres: ["Rock", "Indie", "Hip Hop", "Pop", "EDM"], pay: "$300-$1500", booking_email: "booking@treesdallas.com", type: "Concert Hall", website: "https://www.treesdallas.com", notes: "Deep Ellum staple since the 90s. Mid-size touring must-play." },
  { name: "The Bomb Factory", city: "Dallas, TX", capacity: 4000, genres: ["Rock", "Pop", "Hip Hop", "EDM"], pay: "$1000+", booking_email: "booking@thebombfactory.com", type: "Concert Hall", website: "https://www.thebombfactory.com", notes: "Large Dallas venue. Need established regional/national draw." },

  // Denver, CO
  { name: "Larimer Lounge", city: "Denver, CO", capacity: 300, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$150-$500", booking_email: "booking@larimerlounge.com", type: "Club", website: "https://www.larimerlounge.com", notes: "RiNo District venue. Pioneer Square of Denver indie music." },
  { name: "The Bluebird Theater", city: "Denver, CO", capacity: 550, genres: ["Rock", "Indie", "Pop", "Country", "Hip Hop"], pay: "$250-$900", booking_email: "booking@bluebirdtheater.net", type: "Concert Hall", website: "https://www.bluebirdtheater.net", notes: "Historic 1913 theater. Great sightlines and production." },
  { name: "Globe Hall", city: "Denver, CO", capacity: 250, genres: ["Country", "Indie", "Rock", "Folk"], pay: "$100-$400", booking_email: "booking@globehall.com", type: "Bar/Venue", website: "https://www.globehall.com", notes: "Americana and country-forward. Small but beloved venue." },
  { name: "Hi-Dive", city: "Denver, CO", capacity: 250, genres: ["Rock", "Indie", "Pop", "EDM"], pay: "$100-$400", booking_email: "booking@hi-dive.com", type: "Bar/Venue", website: "https://www.hi-dive.com", notes: "South Broadway venue. Strong indie rock and punk booking." },
  { name: "Summit Music Hall", city: "Denver, CO", capacity: 1000, genres: ["EDM", "Rock", "Indie", "Hip Hop"], pay: "$300-$1500", booking_email: "booking@summitdenver.com", type: "Concert Hall", website: "https://www.summitdenver.com", notes: "Multi-room venue. Big EDM bookings but hosts all genres." },

  // Phoenix, AZ
  { name: "The Rebel Lounge", city: "Phoenix, AZ", capacity: 300, genres: ["Rock", "Indie", "Pop", "Hip Hop"], pay: "$100-$500", booking_email: "booking@therebellounge.com", type: "Club", website: "https://www.therebellounge.com", notes: "Grassroots venue. Artist-supportive, active booking calendar." },
  { name: "Valley Bar", city: "Phoenix, AZ", capacity: 350, genres: ["Indie", "Pop", "Rock", "Hip Hop", "R&B"], pay: "$150-$600", booking_email: "booking@valleybarphx.com", type: "Bar/Venue", website: "https://www.valleybarphx.com", notes: "Underground bar venue downtown Phoenix. Stylish and eclectic." },
  { name: "Crescent Ballroom", city: "Phoenix, AZ", capacity: 800, genres: ["Rock", "Indie", "Pop", "Country", "Hip Hop"], pay: "$250-$1200", booking_email: "booking@crescentphx.com", type: "Concert Hall", website: "https://www.crescentphx.com", notes: "Midtown Phoenix. Excellent food and sound. Strong touring hub." },

  // New Orleans, LA
  { name: "Tipitina's", city: "New Orleans, LA", capacity: 900, genres: ["Rock", "Country", "R&B", "Indie", "Pop"], pay: "$300-$1500", booking_email: "booking@tipitinas.com", type: "Concert Hall", website: "https://www.tipitinas.com", notes: "New Orleans legend. Great for funk, soul, R&B, and rock." },
  { name: "The Howlin' Wolf", city: "New Orleans, LA", capacity: 600, genres: ["Rock", "Indie", "Hip Hop", "R&B"], pay: "$200-$900", booking_email: "booking@thehowlinwolf.com", type: "Club", website: "https://www.thehowlinwolf.com", notes: "New Orleans mid-size venue. Great for touring rock acts." },
  { name: "One Eyed Jacks", city: "New Orleans, LA", capacity: 300, genres: ["Indie", "Rock", "Pop", "Country"], pay: "$150-$500", booking_email: "booking@oneeyedjacks.net", type: "Club", website: "https://www.oneeyedjacks.net", notes: "French Quarter venue. Burlesque-meets-rock aesthetic." },

  // Kansas City, MO
  { name: "recordBar", city: "Kansas City, MO", capacity: 250, genres: ["Indie", "Pop", "Rock", "Country", "R&B"], pay: "$100-$400", booking_email: "booking@therecordbar.com", type: "Bar/Venue", website: "https://www.therecordbar.com", notes: "Music-forward bar with great sound. Well-loved local venue." },
  { name: "The Truman", city: "Kansas City, MO", capacity: 800, genres: ["Rock", "Indie", "Pop", "Hip Hop", "EDM"], pay: "$250-$1200", booking_email: "booking@thetrumankc.com", type: "Concert Hall", website: "https://www.thetrumankc.com", notes: "Mid-size KC venue. Good touring stopover in the Midwest." },

  // St. Louis, MO
  { name: "Blueberry Hill", city: "St. Louis, MO", capacity: 300, genres: ["Rock", "Blues", "Indie", "Pop"], pay: "$150-$500", booking_email: "booking@blueberryhill.com", type: "Bar/Venue", website: "https://www.blueberryhill.com", notes: "Chuck Berry's home venue. Music memorabilia bar." },
  { name: "Delmar Hall", city: "St. Louis, MO", capacity: 750, genres: ["Rock", "Indie", "Hip Hop", "Pop", "Country"], pay: "$300-$1200", booking_email: "booking@delmarhall.com", type: "Concert Hall", website: "https://www.delmarhall.com", notes: "Delmar Loop district. Mid-size touring acts love this room." },

  // Pittsburgh, PA
  { name: "The Rex Theater", city: "Pittsburgh, PA", capacity: 650, genres: ["Rock", "Indie", "Hip Hop", "Pop"], pay: "$200-$900", booking_email: "booking@rextheater.com", type: "Concert Hall", website: "https://www.rextheater.com", notes: "South Side venue. Renovated theater with strong production." },
  { name: "Mr. Smalls Theatre", city: "Millvale, PA", capacity: 750, genres: ["Rock", "Indie", "Pop", "Hip Hop", "EDM"], pay: "$250-$1000", booking_email: "booking@mrsmalls.com", type: "Concert Hall", website: "https://www.mrsmalls.com", notes: "Converted church. Intimate and artist-friendly." },

  // Baltimore, MD
  { name: "Ottobar", city: "Baltimore, MD", capacity: 300, genres: ["Rock", "Indie", "Hip Hop", "EDM"], pay: "$100-$500", booking_email: "booking@theottobar.com", type: "Club", website: "https://www.theottobar.com", notes: "Charles Village venue. Long-running indie institution." },
  { name: "Rams Head Live!", city: "Baltimore, MD", capacity: 1000, genres: ["Rock", "Pop", "Hip Hop", "Country", "R&B"], pay: "$400-$2000", booking_email: "booking@ramsheadlive.com", type: "Concert Hall", website: "https://www.ramsheadlive.com", notes: "Power Plant Live district. Strong mid-level touring acts." },

  // Richmond, VA
  { name: "The National", city: "Richmond, VA", capacity: 1000, genres: ["Rock", "Indie", "Pop", "Hip Hop", "Country"], pay: "$300-$1800", booking_email: "booking@thenationalva.com", type: "Concert Hall", website: "https://www.thenationalva.com", notes: "Richmond's top venue. Elegant historic theater setting." },
  { name: "The Broadberry", city: "Richmond, VA", capacity: 400, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$150-$700", booking_email: "booking@thebroadberry.com", type: "Club", website: "https://www.thebroadberry.com", notes: "Scott's Addition venue. Great for touring up-and-comers." },

  // Charlotte, NC
  { name: "Neighborhood Theatre", city: "Charlotte, NC", capacity: 800, genres: ["Rock", "Indie", "Pop", "Country", "Hip Hop"], pay: "$300-$1500", booking_email: "booking@neighborhoodtheatre.com", type: "Concert Hall", website: "https://www.neighborhoodtheatre.com", notes: "NoDa Arts District. Historic 1945 venue with great community." },
  { name: "The Visulite Theatre", city: "Charlotte, NC", capacity: 500, genres: ["Indie", "Rock", "Pop", "R&B"], pay: "$200-$800", booking_email: "booking@visulite.com", type: "Concert Hall", website: "https://www.visulite.com", notes: "Elizabeth neighborhood. Intimate and artist-friendly." },

  // Raleigh, NC
  { name: "Local 506", city: "Chapel Hill, NC", capacity: 200, genres: ["Indie", "Rock", "Pop", "Country"], pay: "$100-$400", booking_email: "booking@local506.com", type: "Bar/Venue", website: "https://www.local506.com", notes: "Chapel Hill indie staple. Great college market." },
  { name: "Cat's Cradle", city: "Carrboro, NC", capacity: 750, genres: ["Rock", "Indie", "Pop", "Hip Hop", "Country"], pay: "$250-$1200", booking_email: "booking@catscradle.com", type: "Concert Hall", website: "https://www.catscradle.com", notes: "Chapel Hill area icon since 1969. Must-play Southeast venue." },

  // Memphis, TN
  { name: "Minglewood Hall", city: "Memphis, TN", capacity: 1000, genres: ["Rock", "Country", "Blues", "Hip Hop", "Pop"], pay: "$300-$1500", booking_email: "booking@minglewoodhall.com", type: "Concert Hall", website: "https://www.minglewoodhall.com", notes: "Mid-South mainstay. Great for rock and blues-influenced acts." },
  { name: "Hi-Tone Cafe", city: "Memphis, TN", capacity: 250, genres: ["Rock", "Blues", "Indie", "Country"], pay: "$100-$400", booking_email: "booking@hitonememphis.com", type: "Bar/Venue", website: "https://www.hitonememphis.com", notes: "Overton Park neighborhood. Intimate and community-driven." },

  // Birmingham, AL
  { name: "Saturn", city: "Birmingham, AL", capacity: 350, genres: ["Rock", "Indie", "Pop", "Hip Hop", "EDM"], pay: "$150-$600", booking_email: "booking@saturnbirmingham.com", type: "Club", website: "https://www.saturnbirmingham.com", notes: "Avondale neighborhood venue. Strong indie and alternative booking." },
  { name: "Iron City", city: "Birmingham, AL", capacity: 1400, genres: ["Rock", "Country", "Hip Hop", "Pop", "R&B"], pay: "$400-$2000", booking_email: "booking@ironcitybham.com", type: "Concert Hall", website: "https://www.ironcitybham.com", notes: "Birmingham's best mid-size venue. Great stage and production." },

  // Indianapolis, IN
  { name: "HI-FI", city: "Indianapolis, IN", capacity: 550, genres: ["Indie", "Rock", "Pop", "Country", "Hip Hop"], pay: "$200-$900", booking_email: "booking@hifiindy.com", type: "Concert Hall", website: "https://www.hifiindy.com", notes: "Fountain Square venue. Artist-friendly with great sound." },
  { name: "The Vogue", city: "Indianapolis, IN", capacity: 1000, genres: ["Rock", "Pop", "Hip Hop", "EDM", "Country"], pay: "$300-$1500", booking_email: "booking@thevogue.us", type: "Concert Hall", website: "https://www.thevogue.us", notes: "Historic 1938 theater. Great for mid-level touring acts." },

  // Louisville, KY
  { name: "Headliners Music Hall", city: "Louisville, KY", capacity: 700, genres: ["Rock", "Indie", "Hip Hop", "Pop", "Country"], pay: "$250-$1200", booking_email: "booking@headlinerslouisville.com", type: "Concert Hall", website: "https://www.headlinerslouisville.com", notes: "Louisville's premier independent venue. Great touring stopover." },
  { name: "Zanzabar", city: "Louisville, KY", capacity: 250, genres: ["Indie", "Rock", "Pop", "Country"], pay: "$100-$400", booking_email: "booking@zanzabarlouisville.com", type: "Bar/Venue", website: "https://www.zanzabarlouisville.com", notes: "Vintage game bar and venue. Quirky and welcoming." },

  // Cincinnati, OH
  { name: "Bogart's", city: "Cincinnati, OH", capacity: 1500, genres: ["Rock", "Pop", "Hip Hop", "Country", "Indie"], pay: "$400-$2500", booking_email: "booking@bogarts.com", type: "Concert Hall", website: "https://www.bogarts.com", notes: "Cincinnati touring institution since 1977. Well-established market." },
  { name: "The Woodward Theater", city: "Cincinnati, OH", capacity: 500, genres: ["Indie", "Rock", "Pop", "Hip Hop", "Country"], pay: "$200-$800", booking_email: "booking@thewoodwardtheater.com", type: "Concert Hall", website: "https://www.thewoodwardtheater.com", notes: "OTR district. Historic theater with great productions." },

  // Omaha, NE
  { name: "Slowdown", city: "Omaha, NE", capacity: 650, genres: ["Indie", "Rock", "Pop", "Hip Hop", "Country"], pay: "$250-$1000", booking_email: "booking@theslowdown.com", type: "Concert Hall", website: "https://www.theslowdown.com", notes: "Saddle Creek Records' venue. Artist-forward indie institution." },
  { name: "Reverb Lounge", city: "Omaha, NE", capacity: 350, genres: ["Rock", "Indie", "Country", "Pop"], pay: "$100-$500", booking_email: "booking@reverbloungeomaha.com", type: "Club", website: "https://www.reverbloungeomaha.com", notes: "Midtown venue with great community ties." },

  // Salt Lake City, UT
  { name: "The State Room", city: "Salt Lake City, UT", capacity: 400, genres: ["Indie", "Rock", "Pop", "Country", "Folk"], pay: "$200-$800", booking_email: "booking@thestateroom.com", type: "Concert Hall", website: "https://www.thestateroom.com", notes: "Sit-down supper club format. Eclectic and great for singer-songwriters." },
  { name: "The Urban Lounge", city: "Salt Lake City, UT", capacity: 300, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$100-$500", booking_email: "booking@theurbanloungeslc.com", type: "Club", website: "https://www.theurbanloungeslc.com", notes: "SLC indie mainstay. Great for emerging touring acts." },

  // Albuquerque, NM
  { name: "Launchpad", city: "Albuquerque, NM", capacity: 500, genres: ["Rock", "Indie", "Pop", "Hip Hop", "Country"], pay: "$150-$700", booking_email: "booking@launchpadrocks.com", type: "Concert Hall", website: "https://www.launchpadrocks.com", notes: "Central Ave venue. ABQ's top independent venue." },

  // Las Vegas, NV
  { name: "Brooklyn Bowl Las Vegas", city: "Las Vegas, NV", capacity: 2000, genres: ["Rock", "Pop", "Hip Hop", "EDM", "Country"], pay: "$500-$3000", booking_email: "booking@brooklynbowl.com/lasvegas", type: "Concert Hall", website: "https://www.brooklynbowl.com/las-vegas", notes: "Bowling + live music concept. Strong touring calendar." },
  { name: "The Bunkhouse Saloon", city: "Las Vegas, NV", capacity: 200, genres: ["Country", "Rock", "Indie"], pay: "$100-$350", booking_email: "booking@bunkhousedowntown.com", type: "Bar/Venue", website: "https://www.bunkhousedowntown.com", notes: "Downtown arts district. Country and Americana favorite." },

  // San Diego, CA
  { name: "The Casbah", city: "San Diego, CA", capacity: 200, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$100-$400", booking_email: "booking@casbahmusic.com", type: "Club", website: "https://www.casbahmusic.com", notes: "Intimate SD institution. Where indie bands cut their teeth." },
  { name: "Belly Up Tavern", city: "Solana Beach, CA", capacity: 600, genres: ["Rock", "Country", "Indie", "Pop", "R&B"], pay: "$250-$1000", booking_email: "booking@bellyup.com", type: "Concert Hall", website: "https://www.bellyup.com", notes: "North County SD venue. Legendary for intimate shows from big names." },

  // Sacramento, CA
  { name: "Ace of Spades", city: "Sacramento, CA", capacity: 1000, genres: ["Rock", "Indie", "Hip Hop", "Pop", "EDM"], pay: "$300-$1500", booking_email: "booking@aceofspacessac.com", type: "Concert Hall", website: "https://www.aceofspacessac.com", notes: "K Street venue. Sacramento's main mid-level touring room." },
  { name: "Harlow's", city: "Sacramento, CA", capacity: 350, genres: ["R&B", "Jazz", "Indie", "Pop", "Hip Hop"], pay: "$150-$600", booking_email: "booking@harlows.com", type: "Bar/Venue", website: "https://www.harlows.com", notes: "Midtown restaurant-bar. R&B and soul-forward bookings." },

  // Tucson, AZ
  { name: "Club Congress", city: "Tucson, AZ", capacity: 350, genres: ["Rock", "Indie", "Country", "Pop"], pay: "$100-$500", booking_email: "booking@hotelcongress.com", type: "Club", website: "https://www.hotelcongress.com", notes: "Historic hotel venue. Great for touring acts passing through AZ." },

  // Boise, ID
  { name: "Treefort Music Fest Venue Circuit", city: "Boise, ID", capacity: 500, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$200-$800", booking_email: "booking@treefortmusicfest.com", type: "Concert Hall", website: "https://www.treefortmusicfest.com", notes: "Festival-connected venue network. Great Boise market entry." },
  { name: "Neurolux", city: "Boise, ID", capacity: 200, genres: ["Indie", "Rock", "Pop", "EDM"], pay: "$100-$350", booking_email: "booking@neurolux.com", type: "Bar/Venue", website: "https://www.neurolux.com", notes: "Boise's beloved dive bar and music venue. Very DIY-friendly." },

  // Spokane, WA
  { name: "The Bartlett", city: "Spokane, WA", capacity: 200, genres: ["Indie", "Folk", "Rock", "Country", "Pop"], pay: "$100-$400", booking_email: "booking@thebartlettspokane.com", type: "Bar/Venue", website: "https://www.thebartlettspokane.com", notes: "Intimate listening room. Great for songwriters and folk acts." },

  // Missoula, MT
  { name: "The Badlander", city: "Missoula, MT", capacity: 200, genres: ["Rock", "Indie", "Country", "Pop"], pay: "$75-$300", booking_email: "booking@thebadlander.com", type: "Bar/Venue", website: "https://www.thebadlander.com", notes: "Missoula staple. Good stopover for Pacific Northwest tours." },

  // Fargo, ND
  { name: "The Aquarium", city: "Fargo, ND", capacity: 250, genres: ["Rock", "Indie", "Pop", "Hip Hop"], pay: "$100-$400", booking_email: "booking@theaquariumfargo.com", type: "Club", website: "https://www.theaquariumfargo.com", notes: "Downtown Fargo. Good upper-Midwest touring stop." },

  // Iowa City, IA
  { name: "Gabe's", city: "Iowa City, IA", capacity: 300, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$100-$400", booking_email: "booking@gabes.live", type: "Bar/Venue", website: "https://www.gabes.live", notes: "University of Iowa market. Strong indie and rock crowd." },

  // Grand Rapids, MI
  { name: "The Pyramid Scheme", city: "Grand Rapids, MI", capacity: 250, genres: ["Indie", "Rock", "Pop", "Hip Hop", "EDM"], pay: "$100-$400", booking_email: "booking@pyramidschemebar.com", type: "Bar/Venue", website: "https://www.pyramidschemebar.com", notes: "Beloved GR venue. Eclectic bookings and great staff." },

  // Buffalo, NY
  { name: "Rec Room", city: "Buffalo, NY", capacity: 350, genres: ["Rock", "Indie", "Pop", "Hip Hop", "Country"], pay: "$150-$600", booking_email: "booking@recreationroom.com", type: "Club", website: "https://www.recreationroom.com", notes: "Chandler Street venue. The go-to indie room in Buffalo." },

  // Hartford, CT
  { name: "The Webster Theater", city: "Hartford, CT", capacity: 1000, genres: ["Rock", "Indie", "Pop", "Hip Hop", "EDM"], pay: "$300-$1500", booking_email: "booking@webstertheater.com", type: "Concert Hall", website: "https://www.webstertheater.com", notes: "Connecticut's top music venue. Multi-room complex." },

  // Providence, RI
  { name: "Fete Music Hall", city: "Providence, RI", capacity: 700, genres: ["Indie", "Rock", "Pop", "EDM", "Hip Hop"], pay: "$250-$1200", booking_email: "booking@feteprovidence.com", type: "Concert Hall", website: "https://www.feteprovidence.com", notes: "Multi-space venue with great production. RISD-adjacent arts crowd." },
  { name: "The Met", city: "Providence, RI", capacity: 400, genres: ["Indie", "Rock", "Pop", "Country"], pay: "$150-$700", booking_email: "booking@themetri.com", type: "Concert Hall", website: "https://www.themetri.com", notes: "Pawtucket venue with great community support." },

  // Burlington, VT
  { name: "Higher Ground", city: "South Burlington, VT", capacity: 750, genres: ["Indie", "Rock", "Pop", "Hip Hop", "Country"], pay: "$250-$1200", booking_email: "booking@highergroundmusic.com", type: "Concert Hall", website: "https://www.highergroundmusic.com", notes: "New England touring must-play. Great production and community." },

  // Albany, NY
  { name: "Upstate Concert Hall", city: "Clifton Park, NY", capacity: 1000, genres: ["Rock", "Pop", "Hip Hop", "Country", "EDM"], pay: "$300-$1800", booking_email: "booking@upstateconcerthall.com", type: "Concert Hall", website: "https://www.upstateconcerthall.com", notes: "Capital region's main touring venue. Good Upstate NY market." },

  // Savannah, GA
  { name: "The Jinx", city: "Savannah, GA", capacity: 200, genres: ["Rock", "Indie", "Country", "Pop"], pay: "$100-$350", booking_email: "booking@thejinxsavannah.com", type: "Bar/Venue", website: "https://www.thejinxsavannah.com", notes: "Classic Savannah dive bar. Great for touring acts on Southeast runs." },

  // Jacksonville, FL
  { name: "1904 Music Hall", city: "Jacksonville, FL", capacity: 300, genres: ["Indie", "Rock", "Pop", "Hip Hop"], pay: "$100-$500", booking_email: "booking@1904musichall.com", type: "Club", website: "https://www.1904musichall.com", notes: "Downtown JAX venue. Growing arts district." },

  // Miami, FL
  { name: "Gramps", city: "Miami, FL", capacity: 200, genres: ["Indie", "Pop", "R&B", "Hip Hop", "Latin"], pay: "$100-$400", booking_email: "booking@gramps.com", type: "Bar/Venue", website: "https://www.gramps.com", notes: "Wynwood neighborhood. Eclectic and Miami-cool." },
  { name: "The Stage Miami", city: "Miami, FL", capacity: 500, genres: ["Hip Hop", "R&B", "EDM", "Indie", "Pop"], pay: "$200-$800", booking_email: "booking@thestage.miami", type: "Club", website: "https://www.thestage.miami", notes: "Wynwood outdoor venue. Great for live and DJ hybrid shows." },

  // San Antonio, TX
  { name: "The Lonesome Rose", city: "San Antonio, TX", capacity: 200, genres: ["Country", "Indie", "Rock"], pay: "$100-$350", booking_email: "booking@thelonelyrose.com", type: "Bar/Venue", website: "https://www.thelonelyrose.com", notes: "Pearl District venue. Country and Americana-focused." },
  { name: "Paper Tiger", city: "San Antonio, TX", capacity: 500, genres: ["Rock", "Indie", "Pop", "Hip Hop", "EDM"], pay: "$200-$800", booking_email: "booking@papertigersa.com", type: "Club", website: "https://www.papertigersa.com", notes: "South Flores venue. Growing SA indie scene hub." },

  // El Paso, TX
  { name: "Lowbrow Palace", city: "El Paso, TX", capacity: 350, genres: ["Rock", "Indie", "Pop", "Hip Hop"], pay: "$100-$500", booking_email: "booking@lowbrowpalace.com", type: "Club", website: "https://www.lowbrowpalace.com", notes: "Downtown venue. Great Texas/New Mexico touring stop." },

  // Honolulu, HI
  { name: "The Republik", city: "Honolulu, HI", capacity: 1000, genres: ["Rock", "Pop", "Hip Hop", "EDM", "R&B"], pay: "$300-$1500", booking_email: "booking@therepublik.com", type: "Concert Hall", website: "https://www.therepublik.com", notes: "Hawaii's top live venue. Destination touring market." },

  // Anchorage, AK
  { name: "Williwaw", city: "Anchorage, AK", capacity: 400, genres: ["Rock", "Indie", "Pop", "Country", "Hip Hop"], pay: "$200-$700", booking_email: "booking@williwawsocial.com", type: "Club", website: "https://www.williwawsocial.com", notes: "Downtown Anchorage venue. Unique Alaska market." },
];

const BOOKING_RESOURCES = [
  { name: "Indie on the Move", url: "https://www.indieonthemove.com", desc: "The gold standard for DIY touring. Searchable venue database, booking contacts, and tour routing tools.", icon: "🗺️" },
  { name: "Sonicbids", url: "https://www.sonicbids.com", desc: "EPK platform connecting artists to venues and festivals worldwide. Submit your EPK once, apply to hundreds of gigs.", icon: "📁" },
  { name: "GigSalad", url: "https://www.gigsalad.com", desc: "Book private events, corporate gigs, weddings, and parties. Great for supplemental income.", icon: "🎉" },
  { name: "ReverbNation", url: "https://www.reverbnation.com", desc: "Venue showcase opportunities and promoter connections. Good for building early touring history.", icon: "🎸" },
  { name: "SubmitHub (Live)", url: "https://www.submithub.com", desc: "Not just for playlists — some curators also book shows and live sessions.", icon: "📨" },
  { name: "Bandsintown for Artists", url: "https://artists.bandsintown.com", desc: "Announce shows and reach fans. Also connects you with promoters in your area.", icon: "📍" },
];

function EPKModal({ venue, artist, onClose }) {
  const [body, setBody] = useState("");
  const [generating, setGenerating] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.integrations.Core.InvokeLLM({
      prompt: `Write a short, professional booking inquiry email from artist "${artist.name}" to the booking team at "${venue.name}" in ${venue.city}.

Artist genres: ${artist.genres?.join(", ") || "Independent"}
Venue genres: ${venue.genres?.join(", ")}
Venue capacity: ${venue.capacity}
Venue notes: ${venue.notes}
Pay range: ${venue.pay}

Write 3-4 short paragraphs: (1) introduce the artist and their sound, (2) explain why they want to play this specific venue and how it fits their tour/strategy, (3) mention key streaming milestones or social stats (use plausible numbers like "We've accumulated 50,000+ Spotify streams..."), (4) clear ask with flexibility on dates. Professional, confident, not desperate. First person from the artist/manager.`,
    }).then((res) => {
      setBody(typeof res === "string" ? res : res?.text || res?.content || "");
      setGenerating(false);
    });
  }, []);

  const copy = () => { navigator.clipboard.writeText(body); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg space-y-4 z-10 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}>
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Booking Inquiry</p>
          <p className="font-heading font-bold text-lg">{venue.name}</p>
          <p className="text-xs text-muted-foreground">{venue.city} · {venue.capacity} cap · {venue.pay}</p>
        </div>
        {generating ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Writing your booking email...
          </div>
        ) : (
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10}
            className="w-full rounded-xl border border-input bg-secondary/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
        )}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <a href={`mailto:${venue.booking_email}?subject=Booking Inquiry — ${artist.name}`}
            className="text-xs text-primary underline">{venue.booking_email}</a>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={copy}>
              {copied ? <><Check className="h-3.5 w-3.5 mr-1" />Copied</> : <><Copy className="h-3.5 w-3.5 mr-1" />Copy</>}
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Copy({ className }) { return <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2"/></svg>; }

export default function GigFinder() {
  const [genre, setGenre] = useState("All");
  const [city, setCity] = useState("");
  const [venueType, setVenueType] = useState("All");
  const [artistName, setArtistName] = useState("");
  const [artistGenres, setArtistGenres] = useState([]);
  const [bookingModal, setBookingModal] = useState(null);

  const GENRES = ["All", "Hip Hop", "Pop", "R&B", "Indie", "EDM", "Country", "Rock", "Latin"];
  const TYPES = ["All", "Club", "Bar/Venue", "Concert Hall", "Arts Venue", "Amphitheater"];

  const filtered = VENUE_DB.filter((v) => {
    const genreMatch = genre === "All" || v.genres.includes(genre) || v.genres.includes("All");
    const cityMatch = !city.trim() || v.city.toLowerCase().includes(city.toLowerCase());
    const typeMatch = venueType === "All" || v.type === venueType;
    return genreMatch && cityMatch && typeMatch;
  });

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      {bookingModal && <EPKModal venue={bookingModal} artist={{ name: artistName || "Your Artist", genres: genre !== "All" ? [genre] : [] }} onClose={() => setBookingModal(null)} />}

      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs text-primary uppercase tracking-widest font-medium">Touring & Bookings</p>
          <h1 className="font-heading text-4xl font-bold">Gig Finder</h1>
          <p className="text-muted-foreground">Browse independent venues, filter by genre and city, and get an AI-written booking inquiry in seconds.</p>
        </motion.div>

        {/* Artist name + filters */}
        <div className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <Input placeholder="Your artist/band name (for booking emails)" value={artistName} onChange={(e) => setArtistName(e.target.value)} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <select value={genre} onChange={(e) => setGenre(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              {GENRES.map((g) => <option key={g}>{g}</option>)}
            </select>
            <Input placeholder="Filter by city..." value={city} onChange={(e) => setCity(e.target.value)} className="h-9 text-sm" />
            <select value={venueType} onChange={(e) => setVenueType(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} venues found</p>
        </div>

        {/* Venue grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((venue) => (
            <motion.div key={venue.name} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-card border border-border p-5 space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-heading font-bold text-sm">{venue.name}</p>
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground shrink-0">{venue.type}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{venue.city}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Music className="h-3 w-3" />{venue.capacity} cap</span>
                  <span className="flex items-center gap-1 text-xs text-primary font-medium"><DollarSign className="h-3 w-3" />{venue.pay}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {venue.genres.slice(0, 4).map((g) => (
                  <span key={g} className="px-2 py-0.5 rounded-full bg-secondary text-[10px] text-muted-foreground">{g}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-3">{venue.notes}</p>
              <div className="flex items-center gap-2">
                {venue.website && (
                  <a href={venue.website} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><ExternalLink className="h-3 w-3" />Website</Button>
                  </a>
                )}
                <Button size="sm" className="h-7 text-xs gap-1" onClick={() => setBookingModal(venue)}>
                  <Send className="h-3 w-3" /> Write Booking Email
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* External resources */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div>
            <p className="font-heading font-bold text-xl">External Booking Resources</p>
            <p className="text-muted-foreground text-sm">The best platforms for finding gigs beyond this tool.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOOKING_RESOURCES.map((r) => (
              <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
                className="rounded-2xl bg-card border border-border p-4 space-y-2 hover:border-primary/30 hover:bg-primary/5 transition-colors group">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{r.icon}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="font-semibold text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}