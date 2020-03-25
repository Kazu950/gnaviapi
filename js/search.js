document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn').addEventListener('click', () => {
        
        if(navigator.geolocation) {
            let option = {//geolocationのオプション
                'enableHighAccuracy' : true,
                'timeout' : 5000,
                'maximumAge' : 5000
            };
            navigator.geolocation.getCurrentPosition(success, error, option);
        } else {
            alert('位置情報が取得できません');
        }

        function success(currentPosition) {
            let range = document.getElementById('range').value;//検索表示範囲の指定　パラメータrange
            let word = encodeURIComponent(document.getElementById('word').value);//テキストボックス内の単語を取得
            let currentLatitude = currentPosition.coords.latitude;//現在地の緯度を取得
            let currentLongitude = currentPosition.coords.longitude;//現在地の経度を取得
            
            let url = 'https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=自身のぐるなびアクセスキーを入力&freeword=' 
                      + word + '&hit_per_page=24' + '&latitude=' + currentLatitude + '&longitude='+ currentLongitude + '&range=' + range; 
            
            let xhr = new XMLHttpRequest();//XMLHttpRequestオブジェクトを作成

            xhr.addEventListener('loadstart', ()=> {//リクエストを送信し、それが完了するまでの処理
                result.textContent = '検索中...';
            }, false);

            xhr.addEventListener('load', () => {//リクエストが成功した時の処理
                let json = JSON.parse(xhr.responseText);//検索結果(JSON)をオブジェクトに変換して代入している

                if(typeof json.error !== 'undefined') {
                    result.textContent = json.error[0]['message'];
                } else if(result.hasChildNodes()) {//二回目の検索をした際に前回の結果を削除する
                    let result = document.getElementById('result');
                    let clone = result.cloneNode(false);
                    result.parentNode.replaceChild(clone, result);
                    searchResult(json, currentLatitude, currentLongitude);
                } else {
                    searchResult(json);
                }
            }, false);

            xhr.addEventListener('error', () => {//リクエストが失敗した時の処理
                result.textContent = 'エラーが発生しています。';
            }, false);

            xhr.open('GET', url, true);//urlのサーバーに対してGETリクエストを送信
            xhr.send(null);
        }

        function error(errorMessage) {
            switch(errorMessage){
                case 0:
                    alert('原因不明のエラー');
                    break;
                case 1:
                    alert('位置情報取得を許可してください');
                    break;
                case 2:
                    alert('電波状況の悪化により位置情報取得失敗');
                    break;
                case 3:
                    alert('タイムアウトエラー');
                    break;
            }
        }

        function element(resultName, resultUrl, resultImage, hours) {//ノード要素を作成し、結果表示欄に追加する
            let a = document.createElement('a');//aタグの作成
            a.href = resultUrl;//aタグのhref属性に引数で受け取ったURLを代入
            let name = document.createTextNode(resultName);//aタグ内に記述する単語を代入。引数から受け取った店の名前を追加
            let time = document.createTextNode(hours);
            let image = document.createElement('img');//画像表示用のimgタグの作成
            image.src = resultImage || './layout/no_image.jpeg';//引数で受け取った画像のパスをimgタグのsrc属性に代入。もし、画像がなければこちらが用意した画像を表示
            let item = document.createElement('div');
            item.className = 'item';
            let pName = document.createElement('p');
            let pHours = document.createElement('p');
            let hr = document.createElement('hr');

            pName.appendChild(name);
            pHours.appendChild(time);
            a.appendChild(image);
            a.appendChild(pName);
            a.appendChild(hr);
            item.appendChild(a);
            item.appendChild(pHours);
            result.appendChild(item);
        }

        function searchResult(json, latitude1, longitude2) {
            json.rest.forEach((store) => {//検索結果(オブジェクト)を中の配列を順に取り出す(storeは店の情報)
                let storeInfo = new Object();
                storeInfo.destinationLatitude = store.latitude;
                storeInfo.destinationLongitude = store.longitude;
                storeInfo.name = store.name;
                storeInfo.url = store.url;
                storeInfo.imageUrl = store.image_url.shop_image1;
                storeInfo.openTime = store.opentime || '営業時間不明';
                element(storeInfo.name, storeInfo.url, storeInfo.imageUrl, storeInfo.openTime);
            }); 
        }
    }, false);
}, false);
