document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const errorMessage = document.getElementById('error-message');

  async function loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models');
  }

  async function setupCamera() {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({
              video: { width: 520, height: 520 },
              audio: false
          });
          video.srcObject = stream;
          video.onloadedmetadata = () => {
              video.play();
              startFaceDetection();
          };
      } catch (error) {
          console.error('Error accessing camera: ', error);
          errorMessage.textContent = 'Error accessing camera';
      }
  }

  function startFaceDetection() {
      const canvas = faceapi.createCanvasFromMedia(video);
      document.getElementById('video-container').append(canvas);
      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);

      setInterval(async () => {
          const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resizedDetections);
          faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

          if (detections.length === 0) {
              errorMessage.textContent = 'Face not visible';
          } else {
              errorMessage.textContent = '';
          }
      }, 100);
  }

  loadModels().then(setupCamera);
});
