let gestures_results;
var sound;

function preload() {
  // janken.m4a を読み込む
  sound = loadSound('janken.mp3');
}

function setup() {
  let p5canvas = createCanvas(400, 400);
  p5canvas.parent('#canvas');

  // ジェスチャーが見つかると以下の関数が呼び出される．resultsに検出結果が入っている．
  gotGestures = function (results) {
    gestures_results = results;

    adjustCanvas();
  }


}

var mode = 0;
function draw() {
  // 描画処理
  clear();  // これを入れないと下レイヤーにあるビデオが見えなくなる

  // 各頂点座標を表示する
  // 各頂点座標の位置と番号の対応は以下のURLを確認
  // https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
  if (gestures_results) {
    if (gestures_results.landmarks) {
      for (const landmarks of gestures_results.landmarks) {
        for (let landmark of landmarks) {
          noStroke();
          fill(100, 150, 210);
          circle(landmark.x * width, landmark.y * height, 10);
        }
      }
    }

    // ジェスチャーの結果を表示する
    for (let i = 0; i < gestures_results.gestures.length; i++) {
      noStroke();
      fill(255, 0, 0);
      textSize(20);
      let name = gestures_results.gestures[i][0].categoryName;
      let score = gestures_results.gestures[i][0].score;
      let right_or_left = gestures_results.handednesses[i][0].hand;
      let pos = {
        x: gestures_results.landmarks[i][0].x * width,
        y: gestures_results.landmarks[i][0].y * height,
      };
      textSize(48);
      fill(0);
      textAlign(CENTER, CENTER);
      text(name, pos.x, pos.y);
    }

    // mode == 1 -> 2 
    if (gestures_results.gestures.length > 0) {
      let name = gestures_results.gestures[0][0].categoryName;
      if (name == 'Thumb_Up' && mode == 1) {
        mode = 2;
        socket.emit('ready', '');
      }
      else if (name != 'Thumb_Up' && mode == 2) {
        mode = 1;
        socket.emit('unready', '');
      }

      text("mode: " + mode, 50, 50);

      // sound.play()の再生が終わったら 
      if (mode == 3 && !sound.isPlaying()) {
        socket.emit('janken_type', {
          janken_type: name,
          id: socket.id
        });
        mode = 4;
      }
    }

  }

  textSize(48);
  text(result_message, width / 2, height / 2);

}

function windowResized() {
  adjustCanvas();
}

function adjustCanvas() {
  // Get an element by its ID
  var element_webcam = document.getElementById('webcam');
  resizeCanvas(element_webcam.clientWidth, element_webcam.clientHeight);
  //console.log(element_webcam.clientWidth);
}