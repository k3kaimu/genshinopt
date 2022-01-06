# 原神OPT

原神の聖遺物のサブステータスを最適化するためのツールです．

## 使用ライブラリなど

+ [Bootstrap](https://getbootstrap.com/) v4.5.3
+ [Knockout.js](https://knockoutjs.com/) v3.5.1
+ [nlopt-js](https://github.com/BertrandBev/nlopt-js) v0.1.1
+ [requestIdleCallback polyfill](https://github.com/aFarkas/requestIdleCallback) v0.3.0
+ [msgpack-javascript](https://github.com/msgpack/msgpack-javascript) v2.7.1
+ [LZMA-js](https://github.com/LZMA-JS/LZMA-JS) v2.3.2

## ToDo

+ [x] ダメージ計算式の実装
+ [x] ダメージ最適化の実装
+ [x] UI部分の実装
+ [ ] キャラの実装
+ [ ] 武器の実装
+ [ ] 聖遺物の実装
+ [ ] 旧貴族武器の実装

## 参考資料

キャラ・武器などのデータは原神Wikiを参考にしています．
また，ソースコード中の英語名などは英Wiki（Genshin Impact Wiki - Fandom）を参考にしています．

+ [原神 Wiki](https://wikiwiki.jp/genshinwiki/)
+ [Genshin Impact Wiki](https://genshin-impact.fandom.com/wiki/Genshin_Impact)

## 不具合・未確認の内容

+ クレーの1凸及び4凸効果が元素爆発扱いなのか不明．現在は1凸効果は元素爆発ではなく，4凸効果は元素爆発扱いとして実装中
