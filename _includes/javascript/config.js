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
    lng: {{ space.lng }},
    url: "{{ space.url }}",
    url_text: "{{ space.url_text  }}",
    campusmap_url: "{{ space.campusmap_url }}",
    campusmap_ref: "{{ space.campusmap_ref }}",
    restricted: {% if space.restricted %}true{% else %}false{% endif %},
    restriction: "{{ space.restriction | escape }}",
    access: "{{ space.access }}",
    opening_hours: {
        "monday": { "open": {% if space.opening_hours.monday.open %}true{% else %}false{% endif %}, "from": "{{ space.opening_hours.monday.from }}", "to": "{{ space.opening_hours.monday.to }}" },
        "tuesday": { "open": {% if space.opening_hours.tuesday.open %}true{% else %}false{% endif %}, "from": "{{ space.opening_hours.tuesday.from }}", "to": "{{ space.opening_hours.tuesday.to }}" },
        "wednesday": { "open": {% if space.opening_hours.wednesday.open %}true{% else %}false{% endif %}, "from": "{{ space.opening_hours.wednesday.from }}", "to": "{{ space.opening_hours.wednesday.to }}" },
        "thursday": { "open": {% if space.opening_hours.thursday.open %}true{% else %}false{% endif %}, "from": "{{ space.opening_hours.thursday.from }}", "to": "{{ space.opening_hours.thursday.to }}" },
        "friday": { "open": {% if space.opening_hours.friday.open %}true{% else %}false{% endif %}, "from": "{{ space.opening_hours.friday.from }}", "to": "{{ space.opening_hours.friday.to }}" },
        "saturday": { "open": {% if space.opening_hours.saturday.open %}true{% else %}false{% endif %}, "from": "{{ space.opening_hours.saturday.from }}", "to": "{{ space.opening_hours.saturday.to }}" },
        "sunday": { "open": {% if space.opening_hours.sunday.open %}true{% else %}false{% endif %}, "from": "{{ space.opening_hours.sunday.from }}", "to": "{{ space.opening_hours.sunday.to }}" }
    },
    phone_number: "{{ space.phone_number }}",
    twitter_screen_name: "{{ space.twitter_screen_name }}",
    facebook_url: "{{ space.facebook_url }}",
    facilities: ["{{ space.facilities | join: '","' }}"],
  });
  {% endif %}
{% endfor %}
spacefinder.spacesLoaded = true;
spacefinder.filtersLoaded = true;
