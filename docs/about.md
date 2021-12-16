---
layout: page
mathjax: true
title: このサイトについて
additional_js: ["/js/page/documents.js"]
---

このサイトは暇つぶしのために制作をしている完全に個人制作の原神ファンサイトです．
このサイトの利用者がこのサイトによって不利益を被ったとしても，制作者は責任を負いません．
というか，そこら中にバグがあると思います．
見つけ次第報告していただけますと助かります．

#### 何ができるの

今のところ，原神の各キャラにおいて，**様々な武器と聖遺物でダメージの比較**ができます．
たとえば，ノエルに古華・試作と白影の剣を装備させたときのダメージが比較できます．
他のサイトでも武器と聖遺物のメインオプションの最適値を知ることができますが，本サイトでは**聖遺物のサブオプションの最適配分**を知ることができます．
たとえば，ノエルに螭龍の剣を持たせた場合と，古華・試作をもたせた場合では，最適な聖遺物のメインオプションは同じですが，
サブオプションの最適配分は変わってしまいます．
よって，螭龍の剣と古華・試作を平等に比較するためには，サブオプションをすべて無視するか，**それぞれの装備でサブオプションを最適に配分したときのダメージ**を比較することが必要になります．
言い換えれば，本サイトでは「各部位の聖遺物のスコアがX以下のときに，各武器・聖遺物でダメージの期待値の最適値はいくらになるか？ランキングはどうなるか？」を知れるということです．
**最適値を計算できることが本サイトの一番の特徴**です．


#### URLがめっちゃ長いんだけど

まず，ドメイン名が長いですね，すみません．
「原神opt.豊橋.名古屋」で覚えてください．

次に，結果を共有・保存するためのURLがめちゃくちゃ長いですね．
たとえば，ノエルで様々な武器・聖遺物を比較するURLは[`https://genshinopt.toyohashi.nagoya/?ver=0&data=XQAAgAD3AgAAAAAAAABEqkhmgyqxDEMhlgc07UMmKn3z2SSlCRzM5f6lMZXTG7M_O-FKF7bTXL1%2Fx0Ax7CVKEQcjBUrnNDBzGescAdAVWldy%2FcsEh0jOt37rfD7fE4JM3IlT%2BBJGG1jJ9c%2FKqQ72YaEWGwQ8eyq1Y%2Bj5Y12tYsXGh5kQYPSNTGedE2KJ2RwNAuX52VZbp2XV8JWS9T%2BrVtTHcCynegvdvD8TkQzQe80%2FUMKP67XSC5gTzcXeXKfm2vVnkV7Q61%2Fbq2k3C245pv4pGQ0YCOySOgJ03LZ2fSmfc582%2Bn5EtuN4GFxnGAhTR9eoOYp04dIeO9F5Nv1MWcZO6ro370ganygAeOjY7X0Wlbtau7CqtUzL5qLbhM7X9DvBtIeZoa%2FCuX8tlXLy9pglcf6HgXcZz4JswEz3Wzieq3qGT8GPlXFQ%2FjRkIgwNvSDJ5uAKNJNpJia5zLHXxPRC8ohy%2FsLmx%2BAXpvp%2FRfwziQ%2FSaGDTr%2B9bJhAE%2FNxxdyjrKvDxTRrWm6ybVeSzTdUmYzBuDTOfA4Cu4DP2vv%2FhEKmlzyboP8Mr%2FdHG7clnXVuDCQev47KtGCJQgsQy3dZhEOZ2TiaYy%2F%2FeVazg`](https://genshinopt.toyohashi.nagoya/?ver=0&data=XQAAgAD3AgAAAAAAAABEqkhmgyqxDEMhlgc07UMmKn3z2SSlCRzM5f6lMZXTG7M_O-FKF7bTXL1%2Fx0Ax7CVKEQcjBUrnNDBzGescAdAVWldy%2FcsEh0jOt37rfD7fE4JM3IlT%2BBJGG1jJ9c%2FKqQ72YaEWGwQ8eyq1Y%2Bj5Y12tYsXGh5kQYPSNTGedE2KJ2RwNAuX52VZbp2XV8JWS9T%2BrVtTHcCynegvdvD8TkQzQe80%2FUMKP67XSC5gTzcXeXKfm2vVnkV7Q61%2Fbq2k3C245pv4pGQ0YCOySOgJ03LZ2fSmfc582%2Bn5EtuN4GFxnGAhTR9eoOYp04dIeO9F5Nv1MWcZO6ro370ganygAeOjY7X0Wlbtau7CqtUzL5qLbhM7X9DvBtIeZoa%2FCuX8tlXLy9pglcf6HgXcZz4JswEz3Wzieq3qGT8GPlXFQ%2FjRkIgwNvSDJ5uAKNJNpJia5zLHXxPRC8ohy%2FsLmx%2BAXpvp%2FRfwziQ%2FSaGDTr%2B9bJhAE%2FNxxdyjrKvDxTRrWm6ybVeSzTdUmYzBuDTOfA4Cu4DP2vv%2FhEKmlzyboP8Mr%2FdHG7clnXVuDCQev47KtGCJQgsQy3dZhEOZ2TiaYy%2F%2FeVazg)です．
なんと，706文字あります．

なぜこんなに長いかというと，最適化の前提条件のデータをすべてURLに埋め込んでいるからです．
先程のURLには次のようなJavaScriptオブジェクトが埋め込まれています．

```js
{"character":{"parent_id":"noelle","constell":"0","normalRank":9,"skillRank":9,"burstRank":9},"weapons":[{"weapon":{"parent_id":"redhorn_stonethresher","rank":"0"}},{"weapon":{"parent_id":"serpent_spine","rank":"4","buffStacks":"5"}},{"weapon":{"parent_id":"whiteblind","rank":"4","buffStacks":"4"}},{"weapon":{"parent_id":"prototype_archaic","rank":"4","perAttack":10,"useEffect":true}}],"artifacts":[{"art1":{"parent_id":"husk_of_opulent_dreams","bonusType":4,"buffStacks":"4"}},{"art1":{"parent_id":"retracing_bolide","bonusType":4,"useEffect4":true}},{"art1":{"parent_id":"gladiators_finale","bonusType":4}}],"attack":{"id":"normal_1_burst"},"totcost":"75","buff":{"addAtk":null,"rateAtk":null,"addDef":null,"rateDef":null,"addHP":null,"rateHP":null,"crtRate":null,"crtDmg":null,"mastery":null,"dmgBuff":null,"recharge":null},"clock":{"ATK%":true,"DEF%":true,"HP%":false,"Mastery":false,"Recharge":false},"cup":{"ATK%":false,"DEF%":false,"HP%":false,"Mastery":false,"PhyDmg":false,"ElmDmg":true},"hat":{"ATK%":false,"DEF%":false,"HP%":false,"Mastery":false,"CrtRate":true,"CrtDmg":true,"Heal":false}}
```

これでも，MessagePackを利用したり，LZMAアルゴリズムで圧縮したりして，なるべくURLの長さが短くなるようにしているのですが，どうしようもないので諦めてください．
もし，外部にサーバーを借りれるお金があるなら，URLにデータを埋め込まずにサーバーのデータベースにデータを埋め込むのですが．
まあ，URLは2000文字くらいまで許されているようなので，現状のままで問題ないかと思います．
適宜短縮URLをご利用ください．


#### お金の話

このサイトはGitHub Pagesを用いて公開していますので，掛かっている費用はドメイン名の更新費のみです．
そのこともあり，またこのサイトは個人の趣味のサイトのため，このサイトには広告は置いていませんし，制作者はこのサイトから収益を得ていません．
また，このサイトの利用者がこのサイトによって不利益を被ったとしても，制作者は責任を負いません．
というか，そこら中にバグがあると思います．
見つけ次第報告していただけますと助かります．


#### ソースコードについて

ダメージ計算式やキャラ・武器・聖遺物の情報を含めて，ソースコードはすべてGitHubにて公開しています．
再利用しやすいように作っているつもりですので，ご自由にお使いください．
`js/modules`以下のモジュールを使ったダメージ計算の方法は`js/page/index.js`を見ていただければわかるかと思います．
ただ，Knockout.jsを前提にソースコードを書いているので，使いづらいかもしれません．

