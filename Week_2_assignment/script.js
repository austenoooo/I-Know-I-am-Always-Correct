// Tutorials I followed: https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection#0

// store hte resulting model in the global scope of our app;
var model = undefined;

cocoSsd.load().then(function (loadedModel){
  model = loadedModel;
  
});


const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

// check if webcam access is supported
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); // what does !! mean here?

// If webcam supported, load the camera
if (getUserMediaSupported()){
  window.addEventListener('DOMContentLoaded', enableCam);
}
else{
  console.warn('getUserMedia() is not supported by your browser');
}
  
function enableCam(event){
  // only continue if the COCO-SSD has finished loading
  if (!model){
    return;
  }

  const constraints = {
    video = true
  };

  // Activate the webcam stream
  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam)
  });
}

function predictWebcam(){

}

