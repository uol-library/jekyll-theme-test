/**
 * SpaceFinder configuration
 */
const spacefinder = {
    debug: {% if site.environment == "development" %}true{% else %}false{% endif %},
    /**
     * global closure dates - these will affect ALL spaces
     * Dates should be in the format DD-MM-YYYY
     */
    closureDates: [],

    /* CSS breakpoints */
    breakpoints: {
        large: 1000,
        med: 600,
        small: 400
    },

    /* map related config */
    map: null,
    osm: null,
    esri_sat: null,
    currentLoc: {'lat': {{ site.data.config.map.startLat }}, 'lng': {{ site.data.config.map.startLng }} },
    startZoom: {{ site.data.config.map.startZoom }},
    mapBounds: null,
    mapZoom: null,
    mapLoaded: false,
    mapReady: false,
    resizeTimeout: null,

    /* geolocation related config */
    personLoc: {'lat': {{ site.data.config.map.startLat }}, 'lng': {{ site.data.config.map.startLng }} },
    personMarker: null,
    personWatcher: false,
    geoActive: false,
    watchID: false,
    permission: false,

    /* space related config */
    spaces: [],
    spacesLoaded: false,
    spacesurl: '{{ site.url }}{{ site.baseurl }}/spaces.json',
    imageBaseURL: '{{ site.url }}{{ site.baseurl }}',

    /* filter related config */
    filters: [],
    filtersLoaded: false,
    filtersurl: '{{ site.url }}{{ site.baseurl }}/filters.json'
};
{% assign spaces = site.data.spaces | sort_natural: "title" %}
{% for space in spaces %}
  {% if space.published %}
    {% assign address = "" %}
    {% if space.floor != "" %}
        {% assign address = address | append: space.floor | append: ", " %}
    {% endif %}
    {% if space.building  != "" %}
        {% assign address = address | append: space.building | append: ", " %}
    {% endif %}
    {% if space.address != "" %}
        {% assign address = address | append: space.address %}
    {% endif %}
spacefinder.spaces.push({
    id: {{ space.id }},
    title: "{{ space.title }}",
    description: "{{ space.description | markdownify | strip_newlines }}",
    space_type: "{{ space.space_type }}",
    slug: "{{ space.slug }}",
    address: "{{ address }}",
    floor: "{{ space.floor }}",
    building: "{{ space.building }}",
    image: "{{ space.image }}",
    imagealt: "{{ space.imagealt }}",
    lat: {{ space.lat }},
    lng: {{ space.lng }}
});
  {% endif %}
{% endfor %}
spacefinder.spacesLoaded = true;
spacefinder.filtersLoaded = true;
