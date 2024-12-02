/**
 * This script takes all the JSON data files within the assets/data directory
 * and compiles a master data file in the _data directory
 */
const fs = require('fs');
const path = require('path');
const template = {
    "@context": "https://schema.org",
    "@type": "Article",
    "creativeWorkStatus": "",
    "mainEntity": {
        "@type": "Place",
        "name": "",
        "description": "",
        "alternateName": "",
        "url": "",
        "sameAs": "",
        "publicAccess": true,
        "telephone": "",
        "image": {
            "@type": "ImageObject",
            "contentUrl": "",
            "description": ""
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "University of Leeds",
            "addressRegion": "Leeds, West Yorkshire",
            "postalCode": "LS2 9JT",
            "streetAddress": ""
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": "",
            "longitude": ""
        }
    }
}

var restrictions = {};

const datadir = fs.readdirSync( path.resolve( __dirname, '../assets/data/spaces/_data' ), { encoding: 'utf8' } );
datadir.forEach( filename => {
    if ( filename !== '.' && filename !== '..' && filename !== '.gitkeep' ) {
        var fn = path.resolve( __dirname, '../assets/data/spaces/_data', filename );
        var data = fs.readFileSync( path.resolve( __dirname, '../assets/data/spaces/_data', filename ) );
        var jsondata = JSON.parse( data );
        var geodata = JSON.parse( jsondata.location );
        if ( geodata && geodata.coordinates && geodata.coordinates.length == 2 ) {
            jsondata.lat = geodata.coordinates[1];
            jsondata.lng = geodata.coordinates[0];
        } else {
            jsondata.lat = '';
            jsondata.lng = '';
        }
        if (jsondata.restriction !== "") {
            if ( ! restrictions.hasOwnProperty( jsondata.restriction ) ) {
                restrictions[ jsondata.restriction ] = [filename];
            } else {
                restrictions[ jsondata.restriction ].push(filename);
            }
        }
        fs.writeFileSync( path.resolve( __dirname, '../assets/data/spaces/data', filename ), JSON.stringify( convertObj(jsondata), null, 4 ) );
    }
});
console.log(restrictions);
function convertObj(spaceJSON){
    const template = {
        "@context": "https://schema.org",
        "@type": "Article",
        "creativeWorkStatus": "",
        "mainEntity": {
            "@type": "Place",
            "name": "",
            "description": "",
            "alternateName": "",
            "url": "",
            "sameAs": "",
            "publicAccess": true,
            "telephone": "",
            "email": "",
            "image": {
                "@type": "ImageObject",
                "contentUrl": "",
                "description": ""
            },
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "University of Leeds",
                "addressRegion": "Leeds, West Yorkshire",
                "postalCode": "LS2 9JT",
                "streetAddress": ""
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": "",
                "longitude": ""
            }
        }
    }
    template.creativeWorkStatus = spaceJSON.published ? "Published": "Draft";
    template.mainEntity["@type"] = getType(spaceJSON.space_type);
    template.mainEntity.name = spaceJSON.title;
    template.mainEntity.description = spaceJSON.description;
    template.mainEntity.alternateName = spaceJSON.slug;
    template.mainEntity.url = spaceJSON.url;
    template.mainEntity.sameAs = spaceJSON.campusmap_url;
    template.mainEntity.publicAccess = spaceJSON.access === "Anyone (public)" ? true: false;
    template.mainEntity.telephone = spaceJSON.phone_number;
    template.mainEntity.email = spaceJSON.email_address;
    template.mainEntity.image.contentUrl = spaceJSON.image;
    template.mainEntity.image.description = spaceJSON.imagealt;
    template.mainEntity.geo.latitude = spaceJSON.lat;
    template.mainEntity.geo.longitude = spaceJSON.lng;
    let add = [];
    if (spaceJSON.floor) {
        add.push(spaceJSON.floor);
    }
    if (spaceJSON.building) {
        add.push(spaceJSON.building);
    }
    template.mainEntity.address.streetAddress = add.join(', ');
    let contactPoint = getContactPoints(spaceJSON);
    if ( contactPoint.length ) {
        template.mainEntity.contactPoint = contactPoint;
    }
    template.mainEntity.amenityFeature = [];
    if ( spaceJSON.facilities && spaceJSON.facilities.length ) {
        spaceJSON.facilities.forEach( f => {
            if ( getFeatureName(f) ) {
                template.mainEntity.amenityFeature.push({
                    "@type": "LocationFeatureSpecification",
                    "name": getFeatureName(f),
                    "alternateName": f,
                    "value": true                
                });
            }
        });
    }
    let keywords = getKeywords( spaceJSON );
    if ( keywords.length ) {
        keywords.forEach( k => {
            template.mainEntity.amenityFeature.push({
                "@type": "LocationFeatureSpecification",
                "name": k.value,
                "alternateName": k.key,
                "value": true                
            })

        })
    }
    template.mainEntity.openingHoursSpecification = [];
    for (day in spaceJSON.opening_hours) {
        let dayOfWeek = "https://schema.org/" + day.charAt(0).toUpperCase() + day.slice(1);
        openingtimes = {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": dayOfWeek
        }
        if (spaceJSON.opening_hours[day].open) {
            openingtimes.opens = formatTime(spaceJSON.opening_hours[day].from);
            openingtimes.closes = formatTime(spaceJSON.opening_hours[day].to);
        }
        template.mainEntity.openingHoursSpecification.push(openingtimes)
    }
    return template;
}
function formatTime(timestr){
    let hm = timestr.split(':');
    let hours = (hm[0].length === 1)? '0' + hm[0]: hm[0];
    return hours + ':' + hm[1] + ':00';
}
function getFeatureName(facilitySlug){
    fac = {
        "food_drink": "Food &amp; drink allowed",
        "daylight": "Natural daylight",
        "views": "Attractive views out of the window",
        "large_desks": "Large desks",
        "adjustable_furniture": "Adjustable furniture",
        "computers": "Computers",
        "sockets": "Plug Sockets",
        "signal": "Phone signal",
        "printers_copiers": "Printers and copiers",
        "whiteboards": "Whiteboards",
        "projector": "Projector",
        "outdoor_seating": "Outdoor seating",
        "refreshments": "Close to refreshments",
        "break": "Close to a place to take a break",
        "bookable": "Bookable",
        "individual_study_space": "Individual study spaces available",
        "toilets": "Toilets nearby",
        "gender_neutral_toilets": "Gender neutral toilets",
        "baby_changing": "Baby changing facilities",
        "wheelchair_accessible": "Wheelchair accessible",
        "blue_badge_parking": "Parking for blue badge holders",
        "accessible_toilets": "Toilets accessible to disabled people",
        "induction_loops": "Induction loops",
        "bike_racks": "Bike racks",
        "prayer_room": "Prayer room"
    }
    if ( fac[facilitySlug] ) {
        return fac[facilitySlug];
    } else {
        return false;
    }
}
function getType(sftype) {
    let types = {
        "Café": "CafeOrCoffeeShop",
        "Library": "Library",
        "IT Cluster": "CollegeOrUniversity",
        "General Seating Area": "CollegeOrUniversity",
        "Outdoor Seating Area": "CollegeOrUniversity"
    }
    if ( types[sftype] ) {
        return types[sftype];
    } else {
        return "Place";
    }
}
function getKeywords(jsondata) {
    let kw = {
        "private": "Alone, in private",
        "close": "Where others are working",
        "friends": "With friends",
        "group": "On a group project",
        "disciplined": "Disciplined",
        "relaxed": "Relaxed",
        "historic": "Historic",
        "modern": "Modern",
        "inspiring": "Inspiring",
        "cosy": "Cosy",
        "social": "Social",
        "friendly": "Friendly",
        "strictlysilent": "Strictly silent",
        "whispers": "Whispers",
        "backgroundchatter": "Background chatter",
        "animateddiscussion": "Animated discussion",
        "musicplaying": "Music playing"
    };
    keywords = [];
    if ( jsondata.noise !== "" ) {
        let key = Object.keys(kw).find( key => kw[key] === jsondata.noise );
        keywords.push( { "key": key, "value": kw[key] } );
    }

    if ( jsondata.work && jsondata.work.length ) {
        jsondata.work.forEach( w => {
            if ( kw.hasOwnProperty( w ) ) {
                keywords.push( { "key": w, "value": kw[w] } );
            }
        });
    }

    if ( jsondata.atmosphere && jsondata.atmosphere.length ) {
        jsondata.atmosphere.forEach( w => {
            if ( kw.hasOwnProperty( w ) ) {
                keywords.push( { "key": w, "value": kw[w] } );
            }
        });
    }
    return keywords;
}
function getContactPoints(jsondata) {
    let contactPoints = [];
    if ( jsondata.facebook_url !== "" ) {
        let facebookName = jsondata.facebook_url.replace( 'https://www.facebook.com/', '' );
        contactPoints.push({
            "@type": "ContactPoint",
            "contactType": "Follow us on facebook",
            "url": jsondata.facebook_url
        });
    }
    if ( jsondata.twitter_screen_name !== "" ) {
        let twitterURL = "https://twitter.com/" + jsondata.twitter_screen_name;
        contactPoints.push({
            "@type": "ContactPoint",
            "contactType": "Follow us on X (formerly Twitter)",
            "url": twitterURL
        });
    }
    return contactPoints;
}
function getAdditionalProperties(jsondata) {
    let additionalProperties = [];
    if ( [ "General Seating Area", "IT Cluster", "Outdoor Seating Area" ].indexOf( jsondata.space_type ) !== -1 ) {
        additionalProperties.push({
            "@type": "PropertyValue",
            "name": "space_type",
            "value": jsondata.space_type
        });
    }
    if ( jsondata.access !== "Anyone (public)" ) {
        let restrictionText = jsondata.access;
        if ( jsondata.restriction !== "" && ! jsondata.restriction.startsWith("Follow") ) {
            restrictionText += ' (' + restriction.toLowerCase() + ')';
        }
        additionalProperties.push({
            "@type": "PropertyValue",
            "name": "restriction",
            "value": restrictionText
        });
    }
    ["campusmap_ref", "campusmap_url", "what3words"].forEach( f => {
        if ( jsondata[ f ] && jsondata[ f ] !== "" ) {
            additionalProperties.push({
                "@type": "PropertyValue",
                "name": f,
                "value": jsondata[ f ]
            });
        }
    });
}
