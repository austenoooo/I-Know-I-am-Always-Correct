// Tutorials I followed: https://codelabs.developers.google.com/codelabs/tensorflowjs-object-detection#0

const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');

// store hte resulting model in the global scope of our app;
var model = undefined;
// var model = true;
// demosSection.classList.remove('invisible');

cocoSsd.load().then(function (loadedModel){
  model = loadedModel;
  // Show demo section now model is ready to use
  demosSection.classList.remove('invisible');
});


// check if webcam access is supported
function getUserMediaSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia); // what does !! mean here?
}

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
    console.log("model cannot be loaded")
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

var children = [];

function predictWebcam(){
  model.detect(video).then(function (predictions) {

    // Remove any highlighting we did previous frame
    for (let i = 0; i < children.length; i++){
      liveView.removeChild(children[i]);
    }
    children.splice(0);

    // loop through predictions and draw them to the live view if they have a high confidence score
    for (let n = 0; n < predictions.length; n++){
      if (predictions[n].score > 0.3) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class + ' - with '
          + Math.round(parseFloat(predictions[n].score) * 100)
          + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
          + (predictions[n].bbox[1] - 10) + 'px; width: '
          + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';
        
        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
          + predictions[n].bbox[1] + 'px; width: '
          + predictions[n].bbox[2] + 'px; height: '
          + predictions[n].bbox[3] + 'px;';
        
        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
      }
    }
    
    window.requestAnimationFrame(predictWebcam);
  });
}

