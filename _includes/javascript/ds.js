document.addEventListener( 'DOMContentLoaded', () => {
    /* add radio button behaviour to checkboxes with exclusive attribute */
    const filters = document.querySelectorAll( '#search-filters input[type=checkbox]' );
    for (const cbx of filters) {
        cbx.addEventListener( 'change', eventElement => {
            const item = eventElement.target;
            if (item.matches( '.exclusive' ) ) {
                const itemStatus = item.checked;
                const sibs = item.closest( '.uol-form__custom-fieldset' ).querySelectorAll( 'input[type=checkbox].exclusive' );
                for (const sib of sibs) {
                    sib.checked = false;
                }
                item.checked = itemStatus;
            }
            /* trigger the viewfilter event */
            item.dispatchEvent( new Event( 'viewfilter', { bubbles: true } ) );
        });
    }
    /**
     * These delegated click events remove search/filter terms when one of them is
     * clicked in the filter status message. 
     */
    document.addEventListener( 'click', event => {
        if ( event.target.classList.contains( 'search-term' ) ) {
            event.preventDefault();
            let searchtext = event.target.getAttribute( 'data-searchtext' );
            let searchinput = document.getElementById( 'search-input' ).value.trim();
            let searchterms = searchinput.split( ' ' );
            let newsearchterms = [];
            searchterms.forEach( term => {
                if ( term != searchtext ) {
                    newsearchterms.push( term );
                }
            });
            document.getElementById( 'search-input' ).value = newsearchterms.join(' ');
            document.dispatchEvent( new Event( 'viewfilter', { bubbles: true } ) );
        } else if ( event.target.classList.contains( 'filter-term' ) ) {
            event.preventDefault();
            let termid = event.target.getAttribute( 'data-termid' );
            document.getElementById( termid ).checked = false;
            document.dispatchEvent( new Event( 'viewfilter', { bubbles: true } ) );
        } else if ( event.target.getAttribute( 'id' ) === 'clear_filter_panel' ) {
            document.dispatchEvent( new Event( 'viewfilter', { bubbles: true } ) );
        }
    });
    /* search action */
    if ( document.getElementById( 'search-submit' ) ) {
        document.getElementById( 'search-submit' ).addEventListener( 'click', event => {
            event.preventDefault();
            let inputvalue = document.getElementById( 'search-input' ).value.replace( /[^a-zA-Z0-9 ]/g, '' ).trim();
            document.getElementById( 'search-input' ).value = inputvalue;
            /* trigger the viewfilter event */
            event.target.dispatchEvent( new Event( 'viewfilter', { bubbles: true } ) );
        });
    }
    document.addEventListener( 'viewfilter', applyFilters );
    document.addEventListener( 'filtersapplied', updateListFilterMessage );
    document.addEventListener( 'filtersapplied', updateSpacesCountMessage );
    updateSpacesCountMessage()
    loadInitialFilter();
});
/* see if we need to zoom to a particular space */
document.addEventListener( 'sfmapready', () => {
    spacefinder.markergroup.on( 'animationend', zoomWhenLoaded );
});
function zoomWhenLoaded() {
    let spaceid = document.getElementById('map').getAttribute('data-load');
    if ( spaceid !== null ) {
        let space = getSpaceById( spaceid );
        spacefinder.markergroup.zoomToShowLayer( space.marker, function(){
            let newCenter = L.latLng( space.lat, space.lng );
            space.popup.setLatLng( newCenter ).openOn( spacefinder.map );
        });
    }
    spacefinder.markergroup.off( 'animationend', zoomWhenLoaded );
 }

/**
 * Applies filters to the list of spaces
 */
function applyFilters() {
    const activeFilters = getFilterStatus();
    let searchcondition = '';
    if ( activeFilters.length ) {
        document.querySelectorAll( '.list-space' ).forEach( el => {
            el.classList.remove( 'hidden' );
            let showEl = true;
            activeFilters.forEach( filtergroup => {
                if ( filtergroup.name == 'search' ) {
                    let foundKw = false;
                    filtergroup.value.forEach( term => {
                        if ( el.textContent.toLowerCase().indexOf( term.toLowerCase() ) != -1 ) {
                            foundKw = true;
                        }
                    });
                    if ( ! foundKw ) {
                        showEl = false;
                    }
                } else if ( filtergroup.name == 'open' ) {
                    if ( el.getAttribute( 'data-openclass' ) != 'open' ) {
                        showEl = false;
                    }
                } else {
                    let filterdata = getFilterData( filtergroup.name );
                    if ( filterdata.additive ) {
                        // if the filter is additive, only show if all filters are true
                        let miss = false;
                        filtergroup.value.forEach( val => {
                            if ( ! el.classList.contains( filtergroup.name + '_' + val ) ) {
                                miss = true;
                            }
                        });
                        if ( miss === true ) {
                            showEl = false;
                        }
                    } else {
                        // not additive - match any
                        let regex = filtergroup.name+'_('+filtergroup.value.join('|')+')';
                        if ( ! el.className.match(regex) ) {
                            showEl = false;
                        }
                    }
                }
            });
            if ( ! showEl ) {
                el.classList.add( 'hidden' );
            }
        });
    } else {
        document.querySelectorAll( '.list-space' ).forEach( el => {
            el.classList.remove( 'hidden' );
        });
    }
    document.dispatchEvent( new Event( 'filtersapplied' ) );
}

function getFilterData( filterkey, optionkey ) {
    let fel = document.getElementById( filterkey );
    let filterdata = {};
    filterdata.additive = ( fel.getAttribute( 'data-additive' ) === "true" );
    filterdata.label = fel.getAttribute( 'data-label' );
    filterdata.message = fel.getAttribute( 'data-message' );
    filterdata.options = [];
    fel.querySelectorAll( 'input[type=checkbox]' ).forEach( cbx => {
        filterdata.options.push({
            key: cbx.getAttribute( 'data-optionkey' ),
            label: cbx.getAttribute( 'data-optionlabel' )
        });
    });
    return filterdata;
}
/**
 * Updates the message above the list of spaces to show what 
 * search terms and filters are active
 */
function updateListFilterMessage() {
    let activeFilters = getFilterStatus();
    let container = document.getElementById( 'listfilters' );
    /* empty any existing messages and hide */
    container.textContent = '';
    container.setAttribute( 'hidden', '' );
    let searchmessage = filtermessage = '';
    if ( activeFilters.length ) {
        /* add search and filter messages - buttons will remove filters/terms */
        activeFilters.forEach( f => {
            if ( f.name == 'search' ) {
                let pl = f.value.length > 1 ? 's': '';
                searchmessage = '<p>Searching spaces which contain text: ';
                let termlist = [];
                f.value.forEach( term => {
                    termlist.push( '<button class="uol-chips__button search-term icon-remove" data-searchtext="' + term + '"><span class="uol-chips__text" role="text"><span class="hide-accessible">Cancel </span>' + term + '</span><span class="uol-chips__delete-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path fill="#000000" fill-rule="nonzero" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg></span></button>' );
                });
                searchmessage += termlist.join( ' or ' ) + '</p>';
            } else {
                let filterdata = getFilterData( f.name );
                if ( filterdata.options.length === 1 ) {
                    filtermessage += '<p><button class="uol-chips__button filter-term icon-remove" data-termid="' + f.name + '_' + f.value + '"><span class="uol-chips__text" role="text"><span class="hide-accessible">Cancel </span>' + filterdata.message + '</span><span class="uol-chips__delete-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path fill="#000000" fill-rule="nonzero" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg></span></button>';
                } else {
                    filtermessage += '<p>' + filterdata.message;
                    let termlist = [];
                    f.value.forEach( term => {
                        let termlabel = '';
                        filterdata.options.forEach( opt => {
                            if ( opt.key === term ) {
                                termlabel = opt.label;
                            }
                        });
                        termlist.push( '<button class="uol-chips__button filter-term icon-remove" data-termid="' + f.name + '_' + term + '"><span class="uol-chips__text" role="text"><span class="hide-accessible">Cancel </span>' + termlabel + '</span><span class="uol-chips__delete-icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" focusable="false" aria-hidden="true"><path fill="#000000" fill-rule="nonzero" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"></path></svg></span></button>' );
                    });
                    filtermessage += termlist.join( filterdata.additive ? ' and ': ' or ' ) + '</p>';
                }
            }
        });
    }
    /* add filter, search and results messages */
    if ( ( searchmessage + filtermessage ) != '' && document.querySelectorAll( '.list-space:not(.hidden)' ).length > 0 ) {
        container.innerHTML = searchmessage + filtermessage;
        container.removeAttribute( 'hidden' );
    }
}

function updateSpacesCountMessage() {
    /* get count of spaces */
    let spacetotal = document.querySelectorAll( '.list-space' ).length;
    let spacesShowing = spacetotal;
    let msg = 'Showing ' + spacesShowing + ' of ' + spacetotal + ' spaces';
    /* decrease spaces count if some are hidden */
    if ( document.querySelectorAll( '.list-space.hidden' ) != null ) {
        spacesShowing -= document.querySelectorAll( '.list-space.hidden' ).length;
        msg = 'Showing ' + spacesShowing + ' of ' + spacetotal + ' spaces';
        /* show zero results message */
        if ( spacesShowing == 0 ) {
            msg = 'Sorry, your search has found no results - try removing some of your search criteria.';
        }
    }
    /* update spaces showing count */
    if ( document.getElementById( 'searchResultsSummary' ) ) {
        document.getElementById( 'searchResultsSummary' ).textContent = msg;
    }
}

/**
 * Gets the current status of all filters
 * @return {Object} activeFilters
 */
function getFilterStatus() {
    const filters = document.querySelectorAll( '#search-filters input[type=checkbox]' );
    const activeFilters = [];
    for (const cbx of filters) {
        if (cbx.checked) {
            const filterName = cbx.getAttribute( 'data-filterkey' );
            const filterValue = cbx.getAttribute( 'data-optionkey' );
            let appended = false;
            if ( activeFilters.length ) {
                for ( let i = 0; i < activeFilters.length; i++ ) {
                    if ( activeFilters[i].name == filterName && activeFilters[i].value.indexOf( filterValue ) == -1 ) {
                        activeFilters[i].value.push( filterValue );
                        appended = true;
                    }
                }
            }
            if ( ! appended ) {
                activeFilters.push({
                    name: filterName,
                    value: [filterValue]
                });
            }
        }
    }
    let inputvalue = document.getElementById( 'search-input' ).value.trim();
    if ( inputvalue.length > 1 ) {
        activeFilters.push({
            name: 'search',
            value: inputvalue.split( ' ' )
        });
    }
    return activeFilters;
}
/**
 * Returns HTML for an individual space's infoWindow 
 * @param {Object} space 
 * @returns {String} HTML content for space infoWindow
 */
function getSpaceInfoWindowContent( space ) {
	let info = [];
	info.push( space.space_type );
	if ( space.floor !== '' ) {
		info.push( space.floor );
	}
	if ( space.building !== '' ) {
		info.push( space.building );
	}
	let content = '<div class="spaceInfoWindow"><h3><a class="show-space" href="'+spacefinder.imageBaseURL+'/'+space.slug+'" data-spaceid="'+space.id+'">'+space.title+'</a></h3>';
	content += '<p class="info">' + info.join(', ') + '</p>';
	content += '<p class="description">' + space.description + '</p>';
	content += '<p><a class="show-space" href="'+spacefinder.imageBaseURL+'/'+space.slug+'" data-spaceid="' + space.id + '">More info&hellip;</a></p></div>';
	return content;
}

/**
 * Checks the URL for a space_type filter
 */
function loadInitialFilter(){
    if ( window.location.hash ) {
        let hp = window.location.hash.split( '/' );
        if ( hp.length === 3 ) {
            if ( hp[1] == 'space_type' ) {
                let type_cbx = document.getElementById('space_type_'+hp[2]);
                if ( type_cbx ) {
                    type_cbx.checked = true;
                    document.dispatchEvent( new Event( 'viewfilter', { bubbles: true } ) );
                }
            }
        }
    }
}

function getSpaceHTML( space ) {
    let spaceHTML = '<div class="dialog-overlay" data-a11y-dialog-hide></div><article role="document" class="dialog-content">';
    spaceHTML += '<header><button type="button" class="button dialog-close" data-a11y-dialog-hide aria-label="Close dialog">&times;</button>';
    spaceHTML += '<h2 id="space-title">' + space.title + '</h2>';
    spaceHTML += '</header><div class="uol-rich-text uol-rich-text--with-lead">';

    // spaceContainer.setAttribute( 'data-id', space.id );
    // spaceContainer.setAttribute( 'id', 'space' + space.id );
    // spaceContainer.setAttribute( 'data-sortalpha', space.sortKey );
    // spaceContainer.setAttribute( 'class', getClassList( space ) );
//    spaceHTML += '<div class="uol-results-items__item__text-container space-summary"><h2 class="uol-results-items__item__title"><button data-slug="' + space.slug + '" class="accordion-trigger space-title load-info" aria-expanded="false" aria-controls="additionalInfo' + space.id + '" data-spaceid="' + space.id + '">' + space.title + '</button></h3>';
//    spaceHTML += '<dl class="uol-results-items__item__meta">';
//    spaceHTML += '<div class="uol-results-items__item__meta__group"><dt class="uol-results-items__item__meta__label">Type</dt><dd class="uol-results-items__item__meta__data">' + space.space_type + '<span class="distance" id="distance' + space.id +'"></span></dd></div>';
//    spaceHTML += '<div class="additionalInfo" id="additionalInfo' + space.id + '"></div>';
    spaceHTML += '<p>' + space.address + ' (<a target="googlemaps" href="https://www.google.com/maps/dir/?api=1&amp;destination=' + space.lat + '%2c' + space.lng + '&amp;travelmode=walking">get directions</a>)</p>';
    spaceHTML += '<p>' + space.description + '</p>';
    spaceHTML += '<section class="section-facts"><h4>Key Facts</h4><ul class="bulleticons">';//<li class="icon-marker switch-view"><a class="show-map" href="#">Show on map</a></li>';
    if ( space.url !== "" && space.url_text !== '' ) {
        spaceHTML += '<li class="icon-link"><a target="spaceurl" href="' + space.url + '">' + space.url_text + '</a></li>';
    }
    if ( space.campusmap_url != '' ) {
        let campusmap_ref = space.campusmap_ref !== '' ? ' (map reference ' + space.campusmap_ref + ')': '';
        spaceHTML += '<li class="icon-uol-logo-mark"><a target="campusmap" href="' + space.campusmap_url + '">View on the University campus map</a>' + campusmap_ref + '</li>';
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
    //spaceHTML += '<p class="icon-time-short" data-openmsg-id="' + space.id + '">' + spacenode.getAttribute( 'data-openmsg' ) + '</p>';
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
    spaceHTML += '</article>'; 
    return spaceHTML;
}

