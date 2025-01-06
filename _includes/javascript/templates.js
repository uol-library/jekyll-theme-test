/**
 * Templates used to render spaces in the list.
 * 
 * Three fundtions should be defined in this file:
 * - getSpaceHTML - assembles HTML for the list view
 * - getAdditionalInfo - assembles HTML for expanded view
 * - getClassList - assembles classnames for each space container to allow filtering
 */

/**
 * Renders list view for a space
 * @param {Object} space
 * @return {Element} HTML element
 */
function getSpaceHTML( space ) {
    let spaceHTML = '<div class="dialog-overlay" data-a11y-dialog-hide></div><article role="document" class="dialog-content">';
    spaceHTML += '<div class="uol-article__head"><header class="page-heading">';
    spaceHTML += '<button type="button" class="button dialog-close" data-a11y-dialog-hide aria-label="Close dialog">&times;</button>';
    spaceHTML += '<h1 class="page-heading__title"><span class="page-heading__title__main">' + space.title + '</span></h1>';
    spaceHTML += '</header></div>';
    spaceHTML += '<div class="uol-article__content">';
    if ( space.image !== "" && space.imagealt !== "" ) {
        spaceHTML += '<figure class="uol-featured-image">';
        spaceHTML += '<img class="uol-featured-image__img" src="{{ page.data.image | absolute_url }}" alt="' + space.imagealt + '">';
        spaceHTML += '</figure>';
    }
    spaceHTML += '<section class="opening-times"><h3>Key facts</h3>';
    spaceHTML += '<div class="uol-info-list-container"><dl class="uol-info-list ">';
    spaceHTML += '<div class="uol-info-list__group"><dt class="uol-info-list__term ">Address</dt>';
    if ( space.floor !== '' ) {
        spaceHTML += '<dd class="uol-info-list__data ">' + space.floor + '</dd>, ';
    }
    if ( space.building !== '' ) {
        spaceHTML += '<dd class="uol-info-list__data ">' + space.building + '</dd>, ';
    }
    if ( space.address !== '' ) {
        spaceHTML += '<dd class="uol-info-list__data ">' + space.address + '</dd>';
    }
    spaceHTML += '<dd class="uol-info-list__data "><a target="googlemaps" href="https://www.google.com/maps/dir/?api=1&amp;destination=' + space.lat + '%2c' + space.lng + '&amp;travelmode=walking">get directions</a></dd>';
    spaceHTML += '</div>';
    spaceHTML += '<div class="uol-info-list__group"><dt class="uol-info-list__term ">Type</dt><dd class="uol-info-list__data ">' + space.space_type + '</dd></div>';
    spaceHTML += '<div class="uol-info-list__group"><dt class="uol-info-list__term ">Access</dt><dd class="uol-info-list__data ">Open to ' + space.access;
    if ( space.restriction ) {
        spaceHTML += ' (' + space.restriction + ')';
    }
    spaceHTML += '</dd></div>';
    if ( space.url !== "" && space.url_text !== '' ) {
        spaceHTML += '<div class="uol-info-list__group"><dt class="uol-info-list__term ">Website</dt><dd class="uol-info-list__data "><a target="spaceurl" href="' + space.url + '">' + space.url_text + '</dd></div>';
    }
    if ( space.campusmap_url != '' ) {
        let campusmap_ref = space.campusmap_ref !== '' ? ' (map reference ' + space.campusmap_ref + ')': '';
        spaceHTML += '<div class="uol-info-list__group"><dt class="uol-info-list__term ">Campus map</dt><dd class="uol-info-list__data "><a target="campusmap" href="' + space.campusmap_url + '">View on the University campus map</a>' + campusmap_ref + '</dd></div>';
    }
    spaceHTML += '</dl></div></section>';

    spaceHTML += '<div class="uol-rich-text uol-rich-text--with-lead">';
    spaceHTML += '<p>' + space.description + '</p>';
    spaceHTML += '</div></section>';
    spaceHTML += '<section class="opening-times"><h3>Opening Times</h3>';
    spaceHTML += '<table><thead><tr><th>Day</th><th>Open</th><th>Close</th></tr></thead><tbody>';
    [ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ].forEach( (day, idx) => {
        let today = new Date().getDay();
        let todayidx = ( ( idx + 1 ) < 7 ) ? ( idx + 1 ): 0;
        let istodayclass = ( todayidx === today ) ? ' class="today"': '';
        if ( space.opening_hours[day].open ) {
            spaceHTML += '<tr' + istodayclass + '><td class="dayname">' + day.charAt(0).toUpperCase() + day.slice(1) + '</td><td class="opening">' + space.opening_hours[ day ].from + '</td><td class="closing">' + space.opening_hours[ day ].to +'</td></tr>';
        } else {
            spaceHTML += '<tr' + istodayclass + '><td class="dayname">' + day.charAt(0).toUpperCase() + day.slice(1) + '</td><td class="opening" colspan="2">Closed</td></tr>';
        }
    });
    spaceHTML += '</tbody></table></section>';



    spaceHTML += '<p class="icon-time-short" data-openmsg-id="' + space.id + '">' + spacenode.getAttribute( 'data-openmsg' ) + '</p>';
    if ( space.phone_number !== '' || space.twitter_screen_name !== '' || space.facebook_url !== '' ) {
        spaceHTML += '<section class="section-contact"><h2>Contact</h2><ul class="bulleticons">';
        if ( space.phone_number !== '' ) {
            let phoneattr = space.phone_number.replace( /[^0-9]+/g, '' ).replace( /^0/, '+44' );
            spaceHTML += '<li class="icon-phone"><a href="tel:' + phoneattr + '">' +space.phone_text + ' on ' + space.phone_number + '</a></li>';
        }
        if ( space.twitter_screen_name !== '' ) {
            spaceHTML += '<li class="icon-twitter"><a href="https://twitter.com/' + space.twitter_screen_name + '">Follow ' + space.twitter_screen_name + ' on twitter</a></li>';
        }
        if ( space.facebook_url !== '' ) {
            let facebookName = space.facebook_url.replace( 'https://www.facebook.com/', '' );
            spaceHTML += '<li class="icon-facebook-squared"><a href="' + space.facebook_url + '">Follow ' + facebookName + ' on facebook</a></li>';
        }
        spaceHTML += '</ul></section>'
    }

    if ( space.facilities.length ) {
        let facilitieslist = '';
        space.facilities.forEach( fac => {
            let filterData = getFilterData( 'facilities', fac );
            if ( filterData ) {
                facilitieslist += '<li class="' + filterData.icon  + '">' + filterData.label + '</li>';
            }
        });
        if ( facilitieslist != '' ) {
            spaceHTML += '<section class="section-facilities"><h2>Facilities Available</h2><ul class="bulleticons">' + facilitieslist + '</ul></section>';
        }
    }
    spaceHTML += '</article>'; 
    return spaceHTML;
}

/**
 * Gets additional information about a space.
 * The main listing only contains a minimal amount of information about spaces - 
 * when a space is clicked on, this is augmented by additional data.
 * @param {Object} space space data
 * @return {String} HTML
 */
function getAdditionalInfo( space ) {
    splog( 'getAdditionalInfo', 'templates.js' );
    let spaceHTML = '';
    let spacenode = getSpaceNodeById( space.id );
    spaceHTML += '<section class="section-facts"><h4>Key Facts</h4><ul class="bulleticons"><li class="icon-marker switch-view"><a class="show-map" href="#">Show on map</a></li>';
    let loc = '';
    if ( space.floor !== '' ) {
        loc += space.floor + ', ';
    }
    if ( space.building !== '' ) {
        loc += space.building + ', ';
    }
    if ( space.address !== '' ) {
        loc += space.address;
    }
    loc += ' (<a target="googlemaps" href="https://www.google.com/maps/dir/?api=1&amp;destination=' + space.lat + '%2c' + space.lng + '&amp;travelmode=walking">get directions</a>)';
    spaceHTML += '<li class="icon-address">' + loc + '</li>';
    if ( space.url !== "" && space.url_text !== '' ) {
        spaceHTML += '<li class="icon-link"><a target="spaceurl" href="' + space.url + '">' + space.url_text + '</a></li>';
    }
    if ( space.campusmap_url != '' ) {
        let campusmap_ref = space.campusmap_ref !== '' ? ' (map reference ' + space.campusmap_ref + ')': '';
        spaceHTML += '<li class="icon-uol-logo-mark"><a target="campusmap" href="' + space.campusmap_url + '">View on the University campus map</a>' + campusmap_ref + '<li>';
    }
    if ( space.restricted ) {
        spaceHTML += '<li class="icon-public">Open to ' + space.access;
        if ( space.restriction ) {
            spaceHTML += ' (' + space.restriction + ')';
        }
        spaceHTML += '</li>';
    } else {
        spaceHTML += '<li class="icon-public">Open to ' + space.access + '<li>';
    }
    spaceHTML += '</ul></section>';

    spaceHTML += '<section class="section-opening"><h4>Opening Times</h4>';
    spaceHTML += '<p class="icon-time-short" data-openmsg-id="' + space.id + '">' + spacenode.getAttribute( 'data-openmsg' ) + '</p>';
    spaceHTML += '<ul class="opening-times">';
    [ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ].forEach( (day, idx) => {
        let today = new Date().getDay();
        let todayidx = ( ( idx + 1 ) < 7 ) ? ( idx + 1 ): 0;
        let istodayclass = ( todayidx === today ) ? ' class="today"': '';
        if ( space.opening_hours[day].open ) {
            spaceHTML += '<li' + istodayclass + '><span class="dayname">' + day.charAt(0).toUpperCase() + day.slice(1) + '</span> <span class="opening">' + space.opening_hours[ day ].from + ' - ' + space.opening_hours[ day ].to +'</span></li>';
        } else {
            spaceHTML += '<li' + istodayclass + '><span class="dayname">' + day.charAt(0).toUpperCase() + day.slice(1) + '</span> <span class="opening">Closed</span></li>';
        }
    });
    spaceHTML += '</ul></section>';
    if ( space.phone_number !== '' || space.twitter_screen_name !== '' || space.facebook_url !== '' ) {
        spaceHTML += '<section class="section-contact"><h4>Contact</h4><ul class="bulleticons">';
        if ( space.phone_number !== '' ) {
            let phoneattr = space.phone_number.replace( /[^0-9]+/g, '' ).replace( /^0/, '+44' );
            spaceHTML += '<li class="icon-phone"><a href="tel:' + phoneattr + '">' +space.phone_text + ' on ' + space.phone_number + '</a></li>';
        }
        if ( space.twitter_screen_name !== '' ) {
            spaceHTML += '<li class="icon-twitter"><a href="https://twitter.com/' + space.twitter_screen_name + '">Follow ' + space.twitter_screen_name + ' on twitter</a></li>';
        }
        if ( space.facebook_url !== '' ) {
            let facebookName = space.facebook_url.replace( 'https://www.facebook.com/', '' );
            spaceHTML += '<li class="icon-facebook-squared"><a href="' + space.facebook_url + '">Follow ' + facebookName + ' on facebook</a></li>';
        }
        spaceHTML += '</ul></section>'
    }

    if ( space.facilities.length ) {
        let facilitieslist = '';
        space.facilities.forEach( fac => {
            let filterData = getFilterData( 'facilities', fac );
            if ( filterData ) {
                facilitieslist += '<li class="' + filterData.icon  + '">' + filterData.label + '</li>';
            }
        });
        if ( facilitieslist != '' ) {
            spaceHTML += '<section class="section-facilities"><h4>Facilities Available</h4><ul class="bulleticons">' + facilitieslist + '</ul></section>';
        }
    }
    return spaceHTML;
}

/**
 * Gets a list of classes for a space container to facilitate filtering
 * @param {Object} space Space data
 * @return {String} classList Space separated list of classnames
 */
function getClassList( space ) {
    var classList = 'uol-results-items__item list-space ';
    if ( space.space_type ) {
        classList += 'space_type_' + space.space_type.replace( /[^0-9a-zA-Z]/g, '' ).toLowerCase() + ' ';
    }
    if ( space.work.length ){
        classList += 'work_' + space.work.join( ' work_' ) + ' ';
    }
    if ( space.facilities.length ){
        classList += 'facilities_' + space.facilities.join( ' facilities_' ) + ' ';
    }
    if ( space.atmosphere.length ){
        classList += 'atmosphere_' + space.atmosphere.join( ' atmosphere_' ) + ' ';
    }
    if ( space.noise ) {
        classList += 'noise_' + space.noise.replace( /\W/g, '' ).toLowerCase();
    }
    return classList;
}
