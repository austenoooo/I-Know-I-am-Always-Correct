// Tutorials I followed to work with Coco-SSD from Tensorflow.js: https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection#0

// refresh page when resized 
window.onresize = function(){ location.reload(); }

const video = document.getElementById('webcam');
const liveView = document.getElementById('live-view');

// store hte resulting model in the global scope of our app;
var model = undefined;

cocoSsd.load().then(function (loadedModel){
  model = loadedModel;
  loadCamera();
});

// prompt the user to grant webcam access
navigator.permissions.query({name: 'camera'})
.then((permissionObject) => {
  console.log(permissionObject.state);
})
.catch((error) => {
  console.log('Got error ' + error);
});


// check if webcam access is supported
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); // what does !! mean here?
}

// If webcam supported, load the camera
function loadCamera(){
  if (getUserMediaSupported()){
    enableCam();
  }
  else{
    console.warn('getUserMedia() is not supported by your browser');
  }
}

  
function enableCam(event){
  // only continue if the COCO-SSD has finished loading
  if (!model){
    return;
  }

  const constraints = {
    video: true
  };

  // Activate the webcam stream
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam)
  });
}

var child = undefined;
var currentObject = undefined;

let correctObjectList = undefined;

const leftOffset = 0.5 * window.innerWidth - 300;
const topOffset = 0.5 * window.innerHeight - 323;

var startInteraction = false;

function predictWebcam(){
  model.detect(video).then(function (predictions) {

    // Remove any highlighting in the previous frame
    if (child != undefined){
      liveView.removeChild(child);
    }
    child = undefined;

    // Loop through the prediction results to find the first result which class is not human
    for (let n = 0; n < predictions.length; n++) {
    
      if (predictions[n].class != 'person'){
        
        
        // start the interaction if the previous interaction has ended; only update current object when a new current object is updated
        if (!startInteraction){
          startInteraction = true;
          currentObject = predictions[n].class;
          correctObjectList = findObject();
          console.log(correctObjectList);
        }

        // draw the bouding box
        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' 
        + (parseFloat(predictions[n].bbox[0]) + leftOffset) + 'px; top: ' 
        + (parseFloat(predictions[n].bbox[1]) + topOffset) + 'px; width: '
        + predictions[n].bbox[2] + 'px; height: '
        + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        child = highlighter;

        // break loop if result is found
        break;
      }
    }
    
    window.requestAnimationFrame(predictWebcam);
  });
}


// p5js code

let dialougeBox;
let capy = [];

let dialougeText = '...';
let capyIndex = 4;

let sentenceIndex = 0;
let sentenceTotal = 5;
let startFrameCount = undefined;
let gapFrame = 100;
let recordedStart = false;


function setup(){
  var myCanvas = createCanvas(window.innerWidth, window.innerHeight * 0.5 - 123);
  myCanvas.parent('graphic-interface');
  background('#871E51');

  // define font type
  textFont("VT323");

  // voice
  // myVoice = new p5.Speech();
}

function preload(){
  dialougeBox = loadImage('assets/dialouge_box.png');
  for (let i = 1; i <= 5; i++){
    let fileName = 'assets/capy/' + i + '.png';
    let img = loadImage(fileName);
    capy.push(img);
  }
}

function draw(){

  // console.log(startInteraction);
  // console.log(sentenceIndex);

  // start interaction  
  if (startInteraction){

    // trying to add voice over, not working at the moment
    // dialougeText = "I'm not sure what it is ... but ...";
    // myVoice.speak(dialougeText);
    // myVoice.onEnd = startSpeak;
    // sentenceIndex += 1;

    if (!recordedStart){
      startFrameCount = frameCount;
      recordedStart = true;
    }

    if ((frameCount - startFrameCount) % gapFrame == 0){
      if (sentenceIndex == 0){
        dialougeText = "I'm not sure what it is ... but ...";
      }
      else if(sentenceIndex == 1){
        dialougeText = "This is definitely NOT a " + correctObjectList[0] + " ...";
      }
      else if (sentenceIndex == 2){
        dialougeText = "And this is definitely NOT a " + correctObjectList[1] + " ...";
      }
      else if (sentenceIndex == 3){
        dialougeText = "And ... this is also NOT a " + correctObjectList[2] + " ...";
      }
      else if (sentenceIndex == 4){
        dialougeText = "You see, I know I am always correct!";
      }
      else{
        dialougeText = "...";
      }
    
      sentenceIndex += 1;
      if (sentenceIndex > sentenceTotal){
        // reset interaction
        startInteraction = false;
        sentenceIndex = 0;
        startFrameCount = undefined;
      }
    }
    
  }
 
  
  // place capy image
  image(capy[capyIndex], 0.5 * width - 300, 30, 161, 112);

  // place dialouge box image
  image(dialougeBox, 0.5 * width - 114, 35, 414, 102);

  // place the dialouge text
  textSize(28);
  textWrap(WORD);
  fill(0);
  text(dialougeText, 0.5 * width - 60, 53, 328);


}




// trying to add voice over to the dialouge text, but I couldn't have the text to change once the previous sentence finishes
function startSpeak(){
  console.log(sentenceIndex);
  if (sentenceIndex == 0){
    dialougeText = "I'm not sure what it is ... but ...";
  }
  else if (sentenceIndex >= 1 && sentenceIndex <= 3){
    dialougeText ="This is definitely not a " + correctObjectList[sentenceIndex - 1] + " ...";
  }
  else{
    dialougeText ="I know I am always correct!";
  }

  myVoice.speak(dialougeText);

  sentenceIndex += 1;
  if (sentenceIndex > sentenceTotal){
    // reset interaction
    startInteraction = false;
    sentenceIndex = 0;
    // stop voice
    myVoice.stop();
  }
}


// find three objects from the object list that are not the predicted category
function findObject(){
  var objectList = [];

  while (objectList.length < 3){
    // exclude the first index person
    
    let object = classes[getRandomProperty(classes)];
    let objectName = object.displayName;
    let repeated = false;
    for (let i = 0; i < objectList.length; i++){
      if (objectName == objectList[i]){
        repeated = true;
      }
    }
    if (objectName != currentObject && !repeated){
      objectList.push(objectName);
    }
  }

  return objectList;
}

function getRandomProperty(obj) {
  const keys = Object.keys(obj);
  return keys[Math.floor(Math.random() * keys.length)];
}