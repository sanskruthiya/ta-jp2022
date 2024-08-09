import * as maplibregl from "maplibre-gl";
import * as pmtiles from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import './style.css';

const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles",protocol.tile);

function getDay(d) {
    return d == '1' ? '日' :
           d == '2' ? '月' :
           d == '3' ? '火' :
           d == '4' ? '水' :
           d == '5' ? '木' :
           d == '6' ? '金' :
           d == '7' ? '土' :
           '-';
}

function getWeather(d) {
    return d == '1' ? '晴れ' :
           d == '2' ? '曇り' :
           d == '3' ? '雨' :
           d == '4' ? '霧' :
           d == '5' ? '雪' :
           '不明';
}

function getCondition(d) {
    return d == '1' ? '良好だった' :
           d == '2' ? '湿っていた' :
           d == '3' ? '凍結していた' :
           d == '4' ? '積雪していた' :
           d == '5' ? '舗装されていなかった' :
           '不明';
}

function getRoadtype(d) {
    return d == '1' ? '上りカーブの' :
           d == '2' ? '下りカーブの' :
           d == '3' ? '平坦なカーブの' :
           d == '4' ? '上りカーブの' :
           d == '5' ? '下りカーブの' :
           d == '6' ? '平坦なカーブの' :
           d == '7' ? '上り直線の' :
           d == '8' ? '下り直線の' :
           d == '9' ? '平坦な直線の' :
           d == '0' ? '自由通行可能な' :
           '';
}

function getLocation(d) {
    return d == '01' ? '交差点' :
           d == '07' ? '交差点' :
           d == '31' ? '交差点' :
           d == '37' ? '交差点' :
           d == '11' ? 'トンネル' :
           d == '12' ? '橋' :
           d == '13' ? '曲がり道' :
           d == '14' ? '道路' :
           d == '21' ? '踏切' :
           d == '22' ? '踏切' :
           d == '23' ? '踏切' :
           d == '00' ? '場所' :
           '場所';
}

function getSignal(d) {
    return d == '1' ? '信号機がある' :
           d == '2' ? '信号機がある' :
           d == '3' ? '信号機がある' :
           d == '4' ? '信号機がある' :
           d == '5' ? '信号機が消灯中の' :
           d == '6' ? '信号機が故障中の' :
           d == '7' ? '信号機がない' :
           d == '8' ? '信号機がある' :
           '';
}

function getType(d) {
    return d == '01' ? '人と車両' :
           d == '21' ? '車両同士' :
           d == '41' ? '車両単独' :
           d == '61' ? '列車' :
           '状況不明';
}

function getAge(d) {
    return d == '01' ? '24歳以下の若年者' :
           d == '25' ? '25～34歳' :
           d == '35' ? '35～44歳' :
           d == '45' ? '45～54歳' :
           d == '55' ? '55～64歳' :
           d == '65' ? '65～74歳' :
           d == '75' ? '75歳以上の高齢者' :
           '-'
}

const categoryNames = ["直近2年の件数比率","歩行者が関連した比率","夜間の事故比率","65歳以上が関連した比率","死亡事故の比率"];
const flagNames = ["recent_flag","pedestrian_flag","night_flag","senior_flag","case_flag"];
let target_category = 0;
const colors = ['#4169e1', '#87cefa'];//Colors for pie charts. Can be changed by selected categories, but so far only one pattern is set. 

const categoryLength = categoryNames.length;
for (let i = 0; i < categoryLength; i++) {
    const selectCategory = document.getElementById('category-id');
    const optionName = document.createElement('option');
    optionName.value = categoryNames[i];
    optionName.textContent = '円グラフ: ' + categoryNames[i];
    selectCategory.appendChild(optionName);
}

const selected_category = document.querySelector('.category-select');

const init_bearing = 0;
const init_pitch = 0;
const viewset_init = [7.5, 36.000, 140.000];
const viewset_hash = (location.hash ? location.hash.slice(1).split('/') : viewset_init);

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tile2.openstreetmap.jp/styles/osm-bright-ja/style.json',
    center: [viewset_hash[2],viewset_hash[1]],
    interactive: true,
    zoom: viewset_hash[0],
    minZoom: 2,
    maxZoom: 21,
    maxPitch: 60,
    //maxBounds: [[110.0000, 20.0000],[170.0000, 50.0000]],
    bearing: init_bearing,
    pitch: init_pitch,
    attributionControl:false,
    hash: true
});

map.on('load', () => {
    map.addSource('ta_point', {
        'type': 'vector',
        'url': 'pmtiles://app/pmtiles/ta_jp_point.pmtiles?202408',
        "minzoom": 2,
        "maxzoom": 16,
    });
    map.addSource('ta_cluster', {
        'type': 'vector',
        'url': 'pmtiles://app/pmtiles/ta_jp_flags_clustered.pmtiles?202408',
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
    
    //Create svg markers (see -> https://maplibre.org/maplibre-gl-js/docs/examples/cluster-html/)
    const markers = {};
    let markersOnScreen = {};

    function updateMarkers() {
        const newMarkers = {};
        const features = map.queryRenderedFeatures({layers: ['ta_pseudo']});
        
        for (let i = 0; i < features.length; i++) {
            const coords = features[i].geometry.coordinates;
            const props = features[i].properties;
            if (!props.clustered) continue;
            const id = props.fid + '_' + props.point_count + '_' + target_category;//create an unique id of each cluster

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
        // for every marker we've added previously, remove those that are no longer visible
        for (let id in markersOnScreen) {
            if (!newMarkers[id]) markersOnScreen[id].remove();
        }
        markersOnScreen = newMarkers;
    }

    //Create a legend based on the displayed layer 
    const ta_legend = document.getElementById('ta-legend')
    let legendContent;

    function generateLegend() {
        legendContent = '';
        if (map.queryRenderedFeatures({layers: ['ta_pseudo']})[0] !== undefined){
            legendContent += '<hr><p>' +
            `
            <svg width="28" height="28" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" overflow="hidden"><defs><clipPath id="clip0"><rect x="1159" y="256" width="28" height="28"/></clipPath><clipPath id="clip1"><rect x="1159" y="256" width="28" height="28"/></clipPath><clipPath id="clip2"><rect x="1160" y="259" width="23" height="24"/></clipPath><clipPath id="clip3"><rect x="1160" y="259" width="23" height="24"/></clipPath></defs><g clip-path="url(#clip0)" transform="translate(-1159 -256)"><g clip-path="url(#clip1)"><g clip-path="url(#clip2)"><path d="M1171.99 260.134C1178.1 260.134 1183.06 265.092 1183.06 271.208L1176.42 271.208C1176.42 268.762 1174.43 266.779 1171.99 266.779Z" stroke="#FFFFFF" stroke-width="1.14583" stroke-linecap="butt" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" fill="${colors[0]}" fill-rule="evenodd" fill-opacity="1"/></g><g clip-path="url(#clip3)"><path d="M1183.06 271.208C1183.06 277.324 1178.1 282.282 1171.99 282.282 1165.87 282.282 1160.91 277.324 1160.91 271.208 1160.91 265.092 1165.87 260.134 1171.99 260.134L1171.99 266.779C1169.54 266.779 1167.56 268.762 1167.56 271.208 1167.56 273.655 1169.54 275.638 1171.99 275.638 1174.43 275.638 1176.42 273.655 1176.42 271.208Z" stroke="#FFFFFF" stroke-width="1.14583" stroke-linecap="butt" stroke-linejoin="round" stroke-miterlimit="10" stroke-opacity="1" fill="${colors[1]}" fill-rule="evenodd" fill-opacity="1"/></g></g></g></svg>
            `
            +'<br>事故件数及び、<br>'+ categoryNames[target_category] +'</p>';
        }
        if (map.queryRenderedFeatures({layers: ['ta_record']})[0] !== undefined){
            legendContent += '<hr><span class="circle01"></span>：死亡事故</p><p><span class="circle02"></span>：負傷事故</p>';
        }
        ta_legend.innerHTML = legendContent;
    }

    // after the GeoJSON data is loaded, update markers on the screen and do so on every map move/moveend
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
    
    map.on('click', function(e){
        map.panTo(e.lngLat, {duration:1000});
        if (map.queryRenderedFeatures(e.point, {layers: ['ta_pseudo']})[0] !== undefined){
            const feat = map.queryRenderedFeatures(e.point, {layers: ['ta_pseudo']})[0];
            
            const all_count = Number(feat.properties['point_count']);
            const recent_count = Number(feat.properties['recent_flag']);
            const pedestrian_count = Number(feat.properties['pedestrian_flag']);
            const night_count = Number(feat.properties['night_flag']);
            const senior_count = Number(feat.properties['senior_flag']);
            const case_count = Number(feat.properties['case_flag']);
            
            let popupContent = '<p class="remark"><a href="https://www.google.com/maps/search/?api=1&query=' + feat.geometry["coordinates"][1].toFixed(5)+',' + feat.geometry["coordinates"][0].toFixed(5) + '&zoom='+ (map.getZoom()+1).toFixed(0) +'" target="_blank" rel="noopener">この地点のGoogleマップへのリンク</a></p>';
            popupContent += '<p class="tipstyle02">このエリアの事故件数：<span class="style01">'+(all_count > 0 ? all_count.toLocaleString(): 1)+'件</span></p>';
            popupContent += '<table class="tablestyle02">'+
            '<tr><td>直近2年間の事故</td><td>'+recent_count.toLocaleString()+'件</td><td>'+Math.round((recent_count / all_count) * 100)+'%</td></tr>'+
            '<tr><td>歩行者が関連した事故</td><td>'+pedestrian_count.toLocaleString()+'件</td><td>'+Math.round((pedestrian_count / all_count) * 100)+'%</td></tr>'+
            '<tr><td>夜間の事故</td><td>'+night_count.toLocaleString()+'件</td><td>'+Math.round((night_count / all_count) * 100)+'%</td></tr>'+
            '<tr><td>65歳以上が関連した事故</td><td>'+senior_count.toLocaleString()+'件</td><td>'+Math.round((senior_count / all_count) * 100)+'%</td></tr>'+
            '<tr><td>死亡事故</td><td>'+case_count.toLocaleString()+'件</td><td>'+Math.round((case_count / all_count) * 100)+'%</td></tr>'+
            '</table>';
            
            new maplibregl.Popup({closeButton:true, focusAfterOpen:false, className:"t-popup", maxWidth:"280px"})
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);
        } else if (map.queryRenderedFeatures(e.point, {layers: ['ta_record']})[0] !== undefined){
            const feat = map.queryRenderedFeatures(e.point, {layers: ['ta_record']})[0];
            const a_size = Number(feat.properties["負傷者数"])+Number(feat.properties["死者数"])
            let popupContent = '<p class="remark"><a href="https://www.google.com/maps/search/?api=1&query=' + feat.geometry["coordinates"][1].toFixed(5)+',' + feat.geometry["coordinates"][0].toFixed(5) + '&zoom='+ (map.getZoom()+1).toFixed(0) +'" target="_blank" rel="noopener">この地点のGoogleマップへのリンク</a></p>';
            popupContent += '<p class="tipstyle02"><span class="style01">'+feat.properties["発生日時　　年"]+'年'+feat.properties["発生日時　　月"]+'月'+feat.properties["発生日時　　日"]+'日（'+getDay(feat.properties["曜日(発生年月日)"])+(feat.properties["祝日(発生年月日)"]==="0"?'・祝':'')+'）';
            popupContent += feat.properties["発生日時　　時"]+'時'+feat.properties["発生日時　　分"]+'分頃</span>に発生した<span class="style01">'+ getType(feat.properties["事故類型"]) +'の事故</span>で、';
            popupContent += (feat.properties["負傷者数"] != "0" ? '<span class="style01">'+feat.properties["負傷者数"]+'名が負傷</span>':'')+(feat.properties["死者数"] != "0" ? " ":"した。")+(feat.properties["死者数"] != "0" ? '<span class="style01">'+feat.properties["死者数"]+'名が亡くなった</span>。':'')+'<br>';
            popupContent += '当事者の年齢層は<span class="style01">'+ getAge(feat.properties["年齢（当事者A）"]) +(getAge(feat.properties["年齢（当事者B）"]) != "-" ? 'と、'+getAge(feat.properties["年齢（当事者B）"]):'')+'</span>'+(a_size > 2 ? '（本票記載の２名のみ表示）':'')+'。<br>';
            popupContent += '現場は<span class="style01">'+getRoadtype(feat.properties["道路線形"])+(getLocation(feat.properties["道路形状"]) != "交差点" ? getLocation(feat.properties["道路形状"]):getSignal(feat.properties["信号機"])+"交差点")+'</span>で、';
            popupContent += '当時の天候は<span class="style01">'+getWeather(feat.properties["天候"])+'</span>、路面状態は<span class="style01">'+getCondition(feat.properties["路面状態"])+'</span>。</p>';
    
            new maplibregl.Popup({closeButton:true, focusAfterOpen:false, className:"t-popup", maxWidth:"280px"})
            .setLngLat(e.lngLat)
            .setHTML(popupContent)
            .addTo(map);
        } else {
            new maplibregl.Popup({closeButton:true, focusAfterOpen:false, className:"t-popup", maxWidth:"240px"})
            .setLngLat(e.lngLat)
            .setHTML('<p class="remark"><a href="https://www.google.com/maps/@?api=1&map_action=map&center='+e.lngLat.wrap().lat.toFixed(5)+','+e.lngLat.wrap().lng.toFixed(5)+'&zoom='+ (map.getZoom()+1).toFixed(0) +'" target="_blank">この地点のGoogleマップへのリンク</a></p>')
            .addTo(map);
        }
    });

});

map.on('mouseenter', 'ta_record', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'ta_record', function () {
    map.getCanvas().style.cursor = '';
});

// code for creating an SVG donut chart from feature properties
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

const attCntl = new maplibregl.AttributionControl({
    customAttribution: '<a href="https://www.npa.go.jp/publications/statistics/koutsuu/opendata/index_opendata.html" target="_blank">警察庁オープンデータ</a>に基づき作成者が独自に加工（<a href="https://github.com/sanskruthiya/ta-jp2022" target="_blank">Github</a> | <a href="https://form.run/@party--1681740493" target="_blank">作成者への問合せフォーム</a> )',
    compact: true
});

map.addControl(attCntl, 'bottom-right');

const geocoderApi = {
    forwardGeocode: async (config) => {
        const features = [];
        try {
            const request =
        `https://nominatim.openstreetmap.org/search?q=${
            config.query
        }&format=geojson&polygon_geojson=1&addressdetails=1`;
            const response = await fetch(request);
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
        placeholder: '場所を検索',
        collapsed: true,
        //bbox:[122.94, 24.04, 153.99, 45.56],
        countries:'ja',
        language:'ja'
    }
);
map.addControl(geocoder, 'top-right');

/*
const geolocator = new maplibregl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }
);
map.addControl(geolocator, 'top-right');
*/

document.getElementById('b_location').style.backgroundColor = "#fff";
document.getElementById('b_location').style.color = "#333";

const loc_options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
};

document.getElementById('icon-loader').style.display = 'none';

let popup_loc = new maplibregl.Popup({anchor:"bottom", focusAfterOpen:false});
let marker_loc = new maplibregl.Marker();
let flag_loc = 0;

document.getElementById('b_location').addEventListener('click', function () {
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
                    zoom: 16 //init_zoom + 1,
                });

                const popupContent = "現在地";;

                popup_loc.setLngLat([c_lng, c_lat]).setHTML(popupContent).addTo(map);
                marker_loc.setLngLat([c_lng, c_lat]).addTo(map);
                flag_loc = 1;
                this.removeAttribute("disabled");
            },
            (error) => {
                popup_loc.remove();
                document.getElementById('icon-loader').style.display = 'none';
                this.style.backgroundColor = "#999";
                this.style.color = "#fff";
                console.warn(`ERROR(${error.code}): ${error.message}`)
                map.flyTo({
                    center: [viewset_hash[2],viewset_hash[1]],
                    zoom: viewset_hash[0],
                    speed: 1,
                });
                popup_loc.setLngLat([viewset_hash[2],viewset_hash[1]]).setHTML('現在地が取得できませんでした').addTo(map);
                flag_loc = 2;
                this.removeAttribute("disabled");
            },
            loc_options
        );
    }
});
