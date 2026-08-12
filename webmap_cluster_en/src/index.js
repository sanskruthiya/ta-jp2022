import * as maplibregl from "maplibre-gl";
import * as pmtiles from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import './style.css';

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles",protocol.tile);

function getDay(d) {
    return d == '1' ? 'Sunday' :
           d == '2' ? 'Monday' :
           d == '3' ? 'Tuesday' :
           d == '4' ? 'Wednesday' :
           d == '5' ? 'Thursday' :
           d == '6' ? 'Friday' :
           d == '7' ? 'Saturday' :
           '';
}

const monthNames = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

function getWeather(d) {
    return d == '1' ? 'Clear' :
           d == '2' ? 'Cloudy' :
           d == '3' ? 'Rainy' :
           d == '4' ? 'Foggy' :
           d == '5' ? 'Snowy' :
           'Unknown';
}

function getCondition(d) {
    return d == '1' ? 'Dry' :
           d == '2' ? 'Wet' :
           d == '3' ? 'Icy' :
           d == '4' ? 'Snow-covered' :
           d == '5' ? 'Unpaved' :
           'Unknown';
}

function getRoadtype(d) {
    return d == '1' ? 'Uphill curve ' :
           d == '2' ? 'Downhill curve ' :
           d == '3' ? 'Level curve ' :
           d == '4' ? 'Uphill curve ' :
           d == '5' ? 'Downhill curve ' :
           d == '6' ? 'Level curve ' :
           d == '7' ? 'Uphill straight ' :
           d == '8' ? 'Downhill straight ' :
           d == '9' ? 'Level straight ' :
           d == '0' ? 'Open-access ' :
           '';
}

function getLocation(d) {
    return d == '01' ? 'Intersection' :
           d == '07' ? 'Intersection' :
           d == '31' ? 'Intersection' :
           d == '37' ? 'Intersection' :
           d == '11' ? 'Tunnel' :
           d == '12' ? 'Bridge' :
           d == '13' ? 'Curve' :
           d == '14' ? 'Road' :
           d == '21' ? 'Railway crossing' :
           d == '22' ? 'Railway crossing' :
           d == '23' ? 'Railway crossing' :
           d == '00' ? 'Location' :
           'Location';
}

function getSignal(d) {
    return d == '1' ? 'Signalized' :
           d == '2' ? 'Signalized' :
           d == '3' ? 'Signalized' :
           d == '4' ? 'Signalized' :
           d == '5' ? 'Signal off' :
           d == '6' ? 'Signal broken' :
           d == '7' ? 'Unsignalized' :
           d == '8' ? 'Signalized' :
           '';
}

function getType(d) {
    return d == '01' ? 'Pedestrian–Vehicle' :
           d == '21' ? 'Vehicle–Vehicle' :
           d == '41' ? 'Single Vehicle' :
           d == '61' ? 'Train-related' :
           'Unknown';
}

function getAge(d) {
    return d == '01' ? 'Under 25' :
           d == '25' ? '25–34' :
           d == '35' ? '35–44' :
           d == '45' ? '45–54' :
           d == '55' ? '55–64' :
           d == '65' ? '65–74' :
           d == '75' ? '75 or older' :
           '-';
}

const categoryNames = ["Recent 2yr Rate","Pedestrian Ratio","Night Accident Rate","Senior (65+) Ratio","Fatal Accident Rate"];
const flagNames = ["recent_flag","pedestrian_flag","night_flag","senior_flag","case_flag"];
let target_category = 0;
const colors = ['#4169e1', '#87cefa'];

const categoryLength = categoryNames.length;
for (let i = 0; i < categoryLength; i++) {
    const selectCategory = document.getElementById('category-id');
    const optionName = document.createElement('option');
    optionName.value = categoryNames[i];
    optionName.textContent = categoryNames[i];
    selectCategory.appendChild(optionName);
}

const selected_category = document.querySelector('.category-select');

const init_bearing = 0;
const init_pitch = 0;
const viewset_init = [7.5, 36.000, 140.000];
const viewset_hash = (location.hash ? location.hash.slice(1).split('/') : viewset_init);

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tile.openstreetmap.jp/styles/osm-bright/style.json',
    center: [viewset_hash[2],viewset_hash[1]],
    interactive: true,
    zoom: viewset_hash[0],
    minZoom: 2,
    maxZoom: 20,
    maxPitch: 60,
    bearing: init_bearing,
    pitch: init_pitch,
    attributionControl: true,
    hash: true
});

map.on('load', () => {
    map.addSource('ta_point', {
        'type': 'vector',
        'url': 'pmtiles://app/pmtiles/ta_jp_point.pmtiles?202509',
        "minzoom": 2,
        "maxzoom": 16,
    });
    map.addSource('ta_cluster', {
        'type': 'vector',
        'url': 'pmtiles://app/pmtiles/ta_jp_flags_clustered.pmtiles?202509',
        "minzoom": 2,
        "maxzoom": 16,
    });

    map.addLayer({
        'id':'ta_label',
        'type':'symbol',
        'source':'ta_point',
        'source-layer':'ta_jp_point',
        'minzoom':16,
        'layout':{
            'icon-image':'',
            'text-ignore-placement':true,
            'text-field': '{発生日時　　年}/{発生日時　　月}/{発生日時　　日}',
            'text-size': 11,
            'text-font': ['Open Sans Semibold','Arial Unicode MS Bold'],
            'text-offset': [0, 1.2],
            'text-anchor': 'top'
        },
        'paint':{
            'text-color': '#555',
        }
    });
    map.addLayer({
        'id': 'ta_record',
        'type': 'circle',
        'source': 'ta_point',
        'source-layer':'ta_jp_point',
        "minzoom": 16,
        'layout': {
            'visibility': 'visible',
        },
        'paint': {
            'circle-color': ['step',['get','事故内容'],'#ff69b4',2,'transparent'],
            'circle-stroke-color':'#ff69b4',
            'circle-stroke-width':3,
            'circle-stroke-opacity': ['interpolate',['linear'],['zoom'],5,0.2,15,1],
            'circle-opacity': 0.9,
            'circle-radius': ['interpolate',['linear'],['zoom'],5,1,15,8]
        },
    });
    map.addLayer({
        'id': 'ta_pseudo',
        'source': 'ta_cluster',
        'source-layer':'ta_jp_flags',
        "minzoom": 2,
        "maxzoom": 16,
        'layout': {
            'visibility': 'visible',
        },
        'type': 'circle',
        'paint': {
            'circle-color': 'transparent',
            'circle-stroke-color':'transparent',
            'circle-radius': ['interpolate',['linear'],['zoom'],5,15,15,8]
        },
    });
    map.addLayer({
        'id': 'ta_square',
        'source': 'ta_cluster',
        'source-layer':'ta_jp_flags',
        "minzoom": 2,
        "maxzoom": 16,
        'filter': ['!=', 'clustered', true],
        'layout': {
            'visibility': 'visible',
        },
        'type': 'circle',
        'paint': {
            'circle-stroke-width':2,
            'circle-color': 'transparent',
            'circle-stroke-color':['step',['get',flagNames[target_category]],colors[1],1,colors[0]],
            'circle-stroke-opacity': 0.9,
            'circle-radius': 8
        },
    });
    map.addLayer({
        'id': 'ta_cluster_label',
        'type': 'symbol',
        'source': 'ta_cluster',
        'source-layer':'ta_jp_flags',
        'minzoom': 2,
        'maxzoom': 16,
        'filter': ['!=', 'clustered', true],
        'layout': {
            'text-field': '1',
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 12
        },
        'paint': {
            'text-color': '#111',
        }
    });

    const markers = {};
    let markersOnScreen = {};

    function updateMarkers() {
        const newMarkers = {};
        const features = map.queryRenderedFeatures({layers: ['ta_pseudo']});
        
        for (let i = 0; i < features.length; i++) {
            const coords = features[i].geometry.coordinates;
            const props = features[i].properties;
            if (!props.clustered) continue;
            const id = props.fid + '_' + props.point_count + '_' + target_category;

            let marker = markers[id];
            if (!marker) {
                const el = createDonutChart(props);
                marker = markers[id] = new maplibregl.Marker({
                    element: el
                }).setLngLat(coords);
            }
            newMarkers[id] = marker;
            if (!markersOnScreen[id]) marker.addTo(map);
        }
        for (let id in markersOnScreen) {
            if (!newMarkers[id]) markersOnScreen[id].remove();
        }
        markersOnScreen = newMarkers;
    }

    const ta_legend = document.getElementById('ta-legend');
    let legendContent;

    function generateLegend() {
        legendContent = '';
        if (map.queryRenderedFeatures({layers: ['ta_pseudo']})[0] !== undefined){
            legendContent += '<hr><p>' +
            `
            <svg width="28" height="28" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" overflow="hidden"><defs><clipPath id="clip0"><rect x="1159" y="256" width="28" height="28"/></clipPath><clipPath id="clip1"><rect x="1159" y="256" width="28" height="28"/></clipPath><clipPath id="clip2"><rect x="1160" y="259" width="23" height="24"/></clipPath><clipPath id="clip3"><rect x="1160" y="259" width="23" height="24"/></clipPath></defs><g clip-path="url(#clip0)" transform="translate(-1159 -256)"><g clip-path="url(#clip1)"><g clip-path="url(#clip2)"><path d="M1171.99 260.134C1178.1 260.134 1183.06 265.092 1183.06 271.208L1176.42 271.208C1176.42 268.762 1174.43 266.779 1171.99 266.779Z" stroke="#FFFFFF" stroke-width="1.14583" stroke-linecap="butt" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" fill="${colors[0]}" fill-rule="evenodd" fill-opacity="1"/></g><g clip-path="url(#clip3)"><path d="M1183.06 271.208C1183.06 277.324 1178.1 282.282 1171.99 282.282 1165.87 282.282 1160.91 277.324 1160.91 271.208 1160.91 265.092 1165.87 260.134 1171.99 260.134L1171.99 266.779C1169.54 266.779 1167.56 268.762 1167.56 271.208 1167.56 273.655 1169.54 275.638 1171.99 275.638 1174.43 275.638 1176.42 273.655 1176.42 271.208Z" stroke="#FFFFFF" stroke-width="1.14583" stroke-linecap="butt" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" fill="${colors[1]}" fill-rule="evenodd" fill-opacity="1"/></g></g></g></svg>
            `
            +'<br>Accidents &amp;<br>'+ categoryNames[target_category] +'</p>';
        }
        if (map.queryRenderedFeatures({layers: ['ta_record']})[0] !== undefined){
            legendContent += '<hr><p><span class="circle01"></span>: Fatal</p><p><span class="circle02"></span>: Injury</p>';
        }
        ta_legend.innerHTML = legendContent;
        const selectbox = document.getElementById('selectbox');
        if (map.getZoom() >= 16) {
            selectbox.style.display = 'none';
        } else {
            selectbox.style.display = '';
        }
    }

    map.on('data', (e) => {
        if (e.sourceId !== 'ta_cluster' || !e.isSourceLoaded) return;
        map.on('move', updateMarkers);
        map.on('moveend', updateMarkers);
        map.on('moveend', generateLegend);
        updateMarkers();
        generateLegend();
    });

    selected_category.addEventListener('change', () => {
        target_category = selected_category.selectedIndex;
        map.setPaintProperty('ta_square', 'circle-stroke-color', ['step',['get',flagNames[target_category]],colors[1],1,colors[0]]);
        updateMarkers();
        generateLegend();
    });
    
    function buildStatRow(label, count, total) {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return '<div class="stat-row">' +
            '<span class="stat-label">' + label + '</span>' +
            '<span class="stat-value">' + count.toLocaleString() + '</span>' +
            '<span class="stat-bar-container"><span class="stat-bar" style="width:' + pct + '%"></span></span>' +
            '<span class="stat-pct">' + pct + '%</span>' +
            '</div>';
    }

    function buildClusterContent(feat) {
        const p = feat.properties;
        const all_count = (Number(p['point_count']) > 0 ? Number(p['point_count']) : 1);
        const coords = feat.geometry.coordinates;
        let html = '<span class="carousel-type-badge type-cluster">📊 Area Summary</span>';
        html += '<p class="tipstyle02">Accidents in this area: <span class="style01">' + all_count.toLocaleString() + '</span></p>';
        html += '<div class="popup-actions">';
        html += '<span class="popup-action-btn zoom-link" data-lng="' + coords[0] + '" data-lat="' + coords[1] + '">🔍 Zoom to area</span>';
        html += '</div>';
        html += buildStatRow('Fatal accident', Number(p['case_flag']), all_count);
        html += buildStatRow('Pedestrian-involved', Number(p['pedestrian_flag']), all_count);
        html += buildStatRow('Senior (65+)', Number(p['senior_flag']), all_count);
        html += buildStatRow('Night-time', Number(p['night_flag']), all_count);
        html += buildStatRow('Recent 2 years', Number(p['recent_flag']), all_count);
        return html;
    }

    function buildRecordContent(feat) {
        const p = feat.properties;
        const coords = feat.geometry.coordinates;
        const injured = Number(p["負傷者数"]);
        const fatalities = Number(p["死者数"]);
        const a_size = injured + fatalities;
        const ageA = getAge(p["年齢（当事者A）"]);
        const ageB = getAge(p["年齢（当事者B）"]);
        const locationType = getLocation(p["道路形状"]);
        const roadTypeStr = getRoadtype(p["道路線形"]).trim().toLowerCase();
        const signalStr = getSignal(p["信号機"]).toLowerCase();
        const isHoliday = p["祝日(発生年月日)"] === "0";
        const month = monthNames[Number(p["発生日時　　月"])];
        const hour = p["発生日時　　時"];
        const min = String(p["発生日時　　分"]).padStart(2,'0');

        let html = '<span class="carousel-type-badge type-record">🚗 Accident Record</span>';
        html += '<p class="tipstyle02">';

        html += 'A <span class="style01">' + getType(p["事故類型"]) + '</span> accident occurred on ';
        html += '<span class="style01">' + getDay(p["曜日(発生年月日)"]) + ', ' + month + ' ' + p["発生日時　　日"] + ', ' + p["発生日時　　年"] + '</span> at ' + hour + ':' + min;
        if (isHoliday) html += ' (holiday)';
        html += ', ';

        if (injured > 0 && fatalities > 0) {
            html += 'leaving <span class="style01">' + injured + (injured === 1 ? ' person' : ' persons') + ' injured</span> and <span class="style01">' + fatalities + (fatalities === 1 ? ' fatality' : ' fatalities') + '</span>.';
        } else if (injured > 0) {
            html += 'leaving <span class="style01">' + injured + (injured === 1 ? ' person' : ' persons') + ' injured</span>.';
        } else if (fatalities > 0) {
            html += 'resulting in <span class="style01">' + fatalities + (fatalities === 1 ? ' fatality' : ' fatalities') + '</span>.';
        } else {
            html += 'with no casualties recorded.';
        }
        html += '<br>';

        if (ageB !== '-') {
            html += 'Parties involved were aged <span class="style01">' + ageA + '</span> and <span class="style01">' + ageB + '</span>';
            if (a_size > 2) html += ' (2 parties shown)';
        } else {
            html += 'The party involved was aged <span class="style01">' + ageA + '</span>';
        }
        html += '.<br>';

        if (locationType === 'Intersection') {
            const article = signalStr.startsWith('u') ? 'an' : 'a';
            let locPhrase = article + ' ' + (signalStr ? signalStr + ' ' : '') + 'intersection';
            if (roadTypeStr) locPhrase += ', on a ' + roadTypeStr + ' road';
            html += 'The accident took place at <span class="style01">' + locPhrase + '</span>.<br>';
        } else {
            const prep = locationType === 'Tunnel' ? 'in' : 'on';
            const locPhrase = (roadTypeStr ? roadTypeStr + ' ' : '') + locationType.toLowerCase();
            html += 'The accident took place ' + prep + ' a <span class="style01">' + locPhrase + '</span>.<br>';
        }

        html += 'Weather: <span class="style01">' + getWeather(p["天候"]) + '</span>, road surface: <span class="style01">' + getCondition(p["路面状態"]) + '</span>.</p>';
        return html;
    }

    let carouselPages = [];
    let carouselIndex = 0;
    let carouselPopup = null;

    function showCarouselPage() {
        if (!carouselPopup || carouselPages.length === 0) return;
        const total = carouselPages.length;
        let navHtml = '';
        if (total > 1) {
            navHtml = '<div class="carousel-nav">' +
                '<button type="button" onclick="window._carouselPrev()">◀</button>' +
                '<span class="carousel-indicator">' + (carouselIndex + 1) + ' / ' + total + '</span>' +
                '<button type="button" onclick="window._carouselNext()">▶</button>' +
                '</div>';
        }
        const html = navHtml + '<div class="carousel-body">' + carouselPages[carouselIndex].html + '</div>';
        carouselPopup.setHTML(html);
        const el = carouselPopup.getElement();
        if (el) {
            const zoomLink = el.querySelector('.zoom-link');
            if (zoomLink) {
                zoomLink.addEventListener('click', function () {
                    const lng = parseFloat(this.dataset.lng);
                    const lat = parseFloat(this.dataset.lat);
                    carouselPopup.remove();
                    map.flyTo({ center: [lng, lat], zoom: 17, duration: 1500 });
                });
            }
        }
    }

    window._carouselPrev = function () {
        carouselIndex = (carouselIndex - 1 + carouselPages.length) % carouselPages.length;
        showCarouselPage();
    };
    window._carouselNext = function () {
        carouselIndex = (carouselIndex + 1) % carouselPages.length;
        showCarouselPage();
    };

    map.on('click', function(e){
        const layers = [];
        if (map.getLayer('ta_pseudo')) layers.push('ta_pseudo');
        if (map.getLayer('ta_record')) layers.push('ta_record');

        const allFeatures = map.queryRenderedFeatures(e.point, { layers: layers });
        if (allFeatures.length === 0) return;

        carouselPages = [];
        for (const feat of allFeatures) {
            if (feat.layer.id === 'ta_pseudo') {
                carouselPages.push({ type: 'cluster', html: buildClusterContent(feat) });
            }
        }
        for (const feat of allFeatures) {
            if (feat.layer.id === 'ta_record') {
                carouselPages.push({ type: 'record', html: buildRecordContent(feat) });
            }
        }

        if (carouselPages.length === 0) return;

        map.panTo(e.lngLat, { duration: 500 });
        carouselIndex = 0;

        if (carouselPopup) carouselPopup.remove();
        carouselPopup = new maplibregl.Popup({ closeButton: true, focusAfterOpen: false, className: "t-popup", maxWidth: "300px" })
            .setLngLat(e.lngLat)
            .setHTML('')
            .addTo(map);
        showCarouselPage();
    });

});

map.on('mouseenter', 'ta_record', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'ta_record', function () {
    map.getCanvas().style.cursor = '';
});

function createDonutChart(props) {
    const offsets = [];
    const counts = [props[flagNames[target_category]], props['point_count'] - props[flagNames[target_category]]];
    let total = 0;
    for (let i = 0; i < counts.length; i++) {
        offsets.push(total);
        total += counts[i];
    }
    const fontColor = total >= 30000 ? "red" : "black";
    const fontSize = total >= 10000 ? 18 : total >= 1000 ? 16 : total >= 100 ? 14 : 11;
    const r = total >= 30000 ? 40 : total >= 10000 ? 32 : total >= 5000 ? 28 : total >= 1000 ? 24 : total >= 100 ? 21 : total >= 10 ? 18 : 12;
    const r0 = Math.round(r * 0.6);
    const w = r * 2;
    
    let html =
        `<div><svg width="${
            w
        }" height="${
            w
        }" viewbox="0 0 ${
            w
        } ${
            w
        }" text-anchor="middle" style="font: ${
            fontSize
        }px sans-serif; fill: ${fontColor}; display: block">`;

    for (let i = 0; i < counts.length; i++) {
        html += donutSegment(
            offsets[i] / total,
            (offsets[i] + counts[i]) / total,
            r,
            r0,
            colors[i]
        );
    }
    html +=
        `<circle cx="${
            r
        }" cy="${
            r
        }" r="${
            r0
        }" fill="white" /><text dominant-baseline="central" transform="translate(${
            r
        }, ${
            r
        })">${
            total.toLocaleString()
        }</text></svg></div>`;

    const el = document.createElement('div');
    el.innerHTML = html;
    return el.firstChild;
}

function donutSegment(start, end, r, r0, color) {
    if (end - start === 1) end -= 0.00001;
    const a0 = 2 * Math.PI * (start - 0.25);
    const a1 = 2 * Math.PI * (end - 0.25);
    const x0 = Math.cos(a0),
        y0 = Math.sin(a0);
    const x1 = Math.cos(a1),
        y1 = Math.sin(a1);
    const largeArc = end - start > 0.5 ? 1 : 0;

    return [
        '<path d="M',
        r + r0 * x0,
        r + r0 * y0,
        'L',
        r + r * x0,
        r + r * y0,
        'A',
        r,
        r,
        0,
        largeArc,
        1,
        r + r * x1,
        r + r * y1,
        'L',
        r + r0 * x1,
        r + r0 * y1,
        'A',
        r0,
        r0,
        0,
        largeArc,
        0,
        r + r0 * x0,
        r + r0 * y0,
        `" fill="${color}" fill-opacity="0.8"/>`
    ].join(' ');
}

const geocoderApi = {
    forwardGeocode: async (config) => {
        const features = [];
        try {
            const request =
        `https://nominatim.openstreetmap.org/search?q=${
            encodeURIComponent(config.query)
        }&format=geojson&polygon_geojson=1&addressdetails=1&countrycodes=jp&limit=5&accept-language=en`;
            const response = await fetch(request, {
                headers: { 'User-Agent': 'ta-jp-webmap-en' }
            });
            const geojson = await response.json();
            for (const feature of geojson.features) {
                const center = [
                    feature.bbox[0] +
                (feature.bbox[2] - feature.bbox[0]) / 2,
                    feature.bbox[1] +
                (feature.bbox[3] - feature.bbox[1]) / 2
                ];
                const point = {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: center
                    },
                    place_name: feature.properties.display_name,
                    properties: feature.properties,
                    text: feature.properties.display_name,
                    place_type: ['place'],
                    center
                };
                features.push(point);
            }
        } catch (e) {
            console.error(`Failed to forwardGeocode with error: ${e}`);
        }

        return {
            features
        };
    }
};

const geocoder = new MaplibreGeocoder(geocoderApi, {
        maplibregl,
        zoom: 10,
        placeholder: 'Search for a location',
        collapsed: true,
        countries: 'jp',
        language: 'en'
    }
);
map.addControl(geocoder, 'top-right');

const scaleCtrl = new maplibregl.ScaleControl({
    maxWidth: 200,
    unit: 'metric'
});
map.addControl(scaleCtrl, 'bottom-left');

const geolocator = new maplibregl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }
);
map.addControl(geolocator, 'top-right');

document.getElementById('b_location').style.backgroundColor = "#fff";
document.getElementById('b_location').style.color = "#333";

const loc_options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
};

document.getElementById('icon-loader').style.display = 'none';

let popup_loc = new maplibregl.Popup({anchor:"bottom", focusAfterOpen:false});
let marker_loc = new maplibregl.Marker({draggable: true});
let flag_loc = 0;

document.getElementById('b_location').addEventListener('click', function () {
    if (typeof closeMenu === 'function') closeMenu();
    this.setAttribute("disabled", true);
    if (flag_loc > 0) {
        marker_loc.remove();
        popup_loc.remove();
        this.style.backgroundColor = "#fff";
        this.style.color = "#333";
        flag_loc = 0;
        this.removeAttribute("disabled");
    }
    else {
        document.getElementById('icon-loader').style.display = 'block';
        this.style.backgroundColor = "#87cefa";
        this.style.color = "#fff";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                marker_loc.remove();
                popup_loc.remove();

                document.getElementById('icon-loader').style.display = 'none';
                this.style.backgroundColor = "#2c7fb8";
                this.style.color = "#fff";

                let c_lat = position.coords.latitude;
                let c_lng = position.coords.longitude;
            
                map.jumpTo({
                    center: [c_lng, c_lat],
                    zoom: 16
                });

                popup_loc.setLngLat([c_lng, c_lat]).setHTML('Current Location').addTo(map);
                marker_loc.setLngLat([c_lng, c_lat]).addTo(map);
                flag_loc = 1;
                this.removeAttribute("disabled");
            },
            (error) => {
                popup_loc.remove();
                document.getElementById('icon-loader').style.display = 'none';
                this.style.backgroundColor = "#999";
                this.style.color = "#fff";
                console.warn(`ERROR(${error.code}): ${error.message}`);
                map.flyTo({
                    center: [viewset_hash[2],viewset_hash[1]],
                    zoom: viewset_hash[0],
                    speed: 1,
                });
                popup_loc.setLngLat([viewset_hash[2],viewset_hash[1]]).setHTML('Unable to get current location').addTo(map);
                flag_loc = 2;
                this.removeAttribute("disabled");
            },
            loc_options
        );
    }
});

const menuToggle = document.getElementById('menu-toggle');
const dropdownMenu = document.getElementById('dropdown-menu');
const hamburgerIcon = document.getElementById('hamburger-icon');
let menuOpen = false;

function toggleMenu() {
    menuOpen = !menuOpen;
    dropdownMenu.style.display = menuOpen ? '' : 'none';
    hamburgerIcon.classList.toggle('active', menuOpen);
}

function closeMenu() {
    menuOpen = false;
    dropdownMenu.style.display = 'none';
    hamburgerIcon.classList.remove('active');
}

menuToggle.addEventListener('click', toggleMenu);

document.addEventListener('click', function (e) {
    if (menuOpen && !document.querySelector('.hamburger-container').contains(e.target)) {
        closeMenu();
    }
});

document.getElementById('menu-about').addEventListener('click', function () {
    document.getElementById('about-overlay').style.display = '';
    document.getElementById('modal-backdrop').style.display = '';
    closeMenu();
});

document.getElementById('about-close').addEventListener('click', function () {
    document.getElementById('about-overlay').style.display = 'none';
    document.getElementById('modal-backdrop').style.display = 'none';
});

document.getElementById('modal-backdrop').addEventListener('click', function () {
    document.getElementById('about-overlay').style.display = 'none';
    document.getElementById('contact-overlay').style.display = 'none';
    this.style.display = 'none';
});

document.getElementById('open-contact').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('about-overlay').style.display = 'none';
    document.getElementById('contact-overlay').style.display = '';
    document.getElementById('modal-backdrop').style.display = '';
});

document.getElementById('contact-close').addEventListener('click', function () {
    document.getElementById('contact-overlay').style.display = 'none';
    document.getElementById('modal-backdrop').style.display = 'none';
});

document.getElementById('contact-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const form = this;
    const submitBtn = form.querySelector('.contact-submit');
    const status = document.getElementById('contact-status');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.style.display = 'none';
    try {
        const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
            status.textContent = 'Message sent. Thank you!';
            status.className = 'contact-status success';
            status.style.display = '';
            form.reset();
        } else {
            throw new Error();
        }
    } catch {
        status.textContent = 'Failed to send. Please try again later.';
        status.className = 'contact-status error';
        status.style.display = '';
    }
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send';
});
