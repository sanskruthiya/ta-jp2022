# Geographic Record of Traffic Accident in Japan 
警察庁オープンデータに基づく、日本の交通事故統計情報(2019年〜2023年)の地理情報データです。

- ウェブ地図サンプル(2019年〜2022年のデータ)：[リンク](https://kashiwa.co-place.com/cmap/ta-jp/)
- ウェブ地図（円グラフ版）(2019年〜2023年のデータ)：[リンク](https://kashiwa.co-place.com/cmap/ta-jc/)
- データ出典元：[警察庁オープンデータ](https://www.npa.go.jp/publications/statistics/koutsuu/opendata/index_opendata.html)

## 概要
- 警察庁が公開している[交通事故統計情報のオープンデータ](https://www.npa.go.jp/publications/statistics/koutsuu/opendata/index_opendata.html)に基づき、GIS（地理情報システム）で扱いやすいように緯度経度情報の変換を行い、ベクトルタイル形式とGeoPackage形式（都道府県コード別）で公開しています。
- 加えて、ベクトルタイルを読み込んで表示したデモサイトとして[ウェブ地図サンプル](https://kashiwa.co-place.com/cmap/ta-jp/)を公開しています。
- ベクトルタイルを参照したい場合は、"webmap/dist/app/tile"のディレクトリをご参照ください。ただし、デモサイトではPMTiles形式のベクトルタイルを参照しており、このPMTilesの参照先URLはsrcフォルダ内のコードでのみ確認できます。これらのベクトルタイルのデータはTippecanoeで生成しています。
- また、事故発生箇所をクラスタリングしたベクトルタイルを読み込み円グラフで表示する方式のマップを、[ウェブ地図（円グラフ版）](https://kashiwa.co-place.com/cmap/ta-jc/)として公開し、そのソースコードをwebmap_clusterフォルダ内に載せています。なお、この方式の作成要領は[こちらのリポジトリ](https://github.com/sanskruthiya/ta-chiba2022)を合わせてご参照ください。

This repository presents the geographic record of traffic accidents in Japan from 2019 to 2023.

The data is originally published by the National Police Agency in Japan.
Here, the dataset is converted to vector-tile and GeoPackage format with a little arrangement from its original lat/lng coordinates 
so that it can be easily handled on Geographic Information System.
In GeoPackage directory, files are divided by prefecture to shrink its data size.
A web-map using the vector-tile is also published as an example of its use.

If you need the vector-tile data that covers across the nation, you can find it in a directory at "webmap/dist/app/tile".
The web-map (https://kashiwa.co-place.com/cmap/ta-jp/ ) references the vector-tile in PMTiles format, and you can find the referenced url in the code in src directory.
These tiles are generated by tippecanoe (https://github.com/felt/tippecanoe/ ).

In addition, a map that reads clustered vector tiles of accidents and displays them in pie charts is available as another web map (https://kashiwa.co-place.com/cmap/ta-jc/ ) , the source code of which is included in the webmap_cluster directory.
