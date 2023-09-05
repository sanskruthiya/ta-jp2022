import * as maplibregl from "maplibre-gl";
//import * as pmtiles from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';
import './style.css';
/*
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles",protocol.tile);
*/
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

const ta_legend = document.getElementById('ta-legend')
ta_legend.innerHTML = '<p><span class="circle01"></span>：死亡事故</p><p><span class="circle02"></span>：負傷事故</p>'

const init_coord = [140.2280, 39.0473];
const init_zoom = 5;
const init_bearing = 0;
const init_pitch = 0;

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://tile2.openstreetmap.jp/styles/osm-bright-ja/style.json',
    center: init_coord,
    interactive: true,
    zoom: init_zoom,
    minZoom: 5,
    maxZoom: 20,
    maxPitch: 60,
    maxBounds: [[110.0000, 20.0000],[170.0000, 50.0000]],
    bearing: init_bearing,
    pitch: init_pitch,
    attributionControl:false
});

map.on('load', function () {
    map.addSource('accident', {
        'type': 'vector',
        'tiles': [location.href+"/app/tile/{z}/{x}/{y}.pbf"],
        //'url': 'pmtiles://'+location.href+'app/pmtiles/TrafficAccidentRecord_20192022.pmtiles',
        "minzoom": 0,
        "maxzoom": 14,
    });

    map.addLayer({
        'id':'ta_label',
        'type':'symbol',
        'source':'accident',
        'source-layer':'TrafficAccidentRecord_20192022',
        'minzoom':15,
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
        'id': 'TrafficAccidentRecord',
        'source': 'accident',
        'source-layer': 'TrafficAccidentRecord_20192022',
        "minzoom": 5,
        "maxzoom": 21,
        'layout': {
            'visibility': 'visible',
        },
        'type': 'circle',
        'paint': {
            'circle-color': ['step',['get','事故内容'],'#ff69b4',2,'transparent'],
            'circle-stroke-color':'#ff69b4',
            'circle-stroke-width':3,
            'circle-stroke-opacity': ['interpolate',['linear'],['zoom'],5,0.2,15,1],
            'circle-opacity': 0.9,
            'circle-radius': ['interpolate',['linear'],['zoom'],5,1,15,8]
        },
    });
});

map.on('click', 'TrafficAccidentRecord', function (e) {
    const a_size = Number(e.features[0].properties["負傷者数"])+Number(e.features[0].properties["死者数"])
    let popupContent = '<p class="tipstyle02"><span class="style01">'+e.features[0].properties["発生日時　　年"]+'年'+e.features[0].properties["発生日時　　月"]+'月'+e.features[0].properties["発生日時　　日"]+'日（'+getDay(e.features[0].properties["曜日(発生年月日)"])+(e.features[0].properties["祝日(発生年月日)"]==="0"?'・祝':'')+'）';
    popupContent += e.features[0].properties["発生日時　　時"]+'時'+e.features[0].properties["発生日時　　分"]+'分頃</span>に発生した<span class="style01">'+ getType(e.features[0].properties["事故類型"]) +'の事故</span>で、';
    popupContent += (e.features[0].properties["負傷者数"] != "0" ? '<span class="style01">'+e.features[0].properties["負傷者数"]+'名が負傷</span>':'')+(e.features[0].properties["死者数"] != "0" ? " ":"した。")+(e.features[0].properties["死者数"] != "0" ? '<span class="style01">'+e.features[0].properties["死者数"]+'名が亡くなった</span>。':'')+'<br>';
    popupContent += '当事者の年齢層は<span class="style01">'+ getAge(e.features[0].properties["年齢（当事者A）"]) +(getAge(e.features[0].properties["年齢（当事者B）"]) != "-" ? 'と、'+getAge(e.features[0].properties["年齢（当事者B）"]):'')+'</span>'+(a_size > 2 ? '（本票記載の２名のみ表示）':'')+'。<br>';
    popupContent += '現場は<span class="style01">'+getRoadtype(e.features[0].properties["道路線形"])+(getLocation(e.features[0].properties["道路形状"]) != "交差点" ? getLocation(e.features[0].properties["道路形状"]):getSignal(e.features[0].properties["信号機"])+"交差点")+'</span>で、';
    popupContent += '当時の天候は<span class="style01">'+getWeather(e.features[0].properties["天候"])+'</span>、路面状態は<span class="style01">'+getCondition(e.features[0].properties["路面状態"])+'</span>。</p>';
    
    new maplibregl.Popup({closeButton:true, focusAfterOpen:false, className:"t-popup", maxWidth:"280px"})
    .setLngLat(e.lngLat)
    .setHTML(popupContent)
    .addTo(map);
});
map.on('mouseenter', 'TrafficAccidentRecord', function () {
    map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'TrafficAccidentRecord', function () {
    map.getCanvas().style.cursor = '';
});

const attCntl = new maplibregl.AttributionControl({
    customAttribution: '<a href="https://www.npa.go.jp/publications/statistics/koutsuu/opendata/index_opendata.html" target="_blank">警察庁オープンデータ（2019年〜2022年の交通事故統計情報）</a>に基づき作成者が独自に加工（<a href="https://twitter.com/Smille_feuille" target="_blank">Twitter</a> | <a href="https://github.com/sanskruthiya/ta-jp2022" target="_blank">Github</a>） ',
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

const geolocator = new maplibregl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }
);
map.addControl(geolocator, 'top-right');
