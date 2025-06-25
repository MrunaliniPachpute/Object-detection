const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const capturedImages = {}; // position => base64 image

const positions = ["front", "right", "left", "back"];
let currentIndex = 0;

const descriptions = {}; // Store descriptions for each image

// Dummy description generator (can be replaced with AI/ML later)
function generateDescription(position) {
  switch (position) {
    case "front":
      return "🚗 Detected a vehicle in the front direction.";
    case "right":
      return "🧍‍♂️ Person approaching from the right side.";
    case "left":
      return "🌳 Trees seen on the left.";
    case "back":
      return "🛣️ Road is clear at the back.";
    default:
      return "Unknown view.";
  }
}

// Start webcam
navigator.mediaDevices
  .getUserMedia({ video: true })
  .then((stream) => (video.srcObject = stream))
  .catch((err) => alert("Webcam access error: " + err));

// Button listener
document.getElementById("captureBtn").addEventListener("click", captureImage);

function captureImage() {
  if (currentIndex >= positions.length) {
    alert("✅ All 4 images captured!");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  requestAnimationFrame(() => {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL("image/png");

    

    const imgId = positions[currentIndex];
    document.getElementById(imgId).src = dataURL;

    capturedImages[imgId] = dataURL;

    // Generate and store dummy description
    descriptions[imgId] = generateDescription(imgId);

    currentIndex++;

    // If last image was just captured
    if (currentIndex === positions.length) {
      document.getElementById("captureBtn").disabled = true;

      // Send all 4 images to Flask
      fetch("http://localhost:5000/analyze-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(capturedImages),
      })
        .then((res) => res.json())
        .then((data) => {
          // `data` is a dict: { front: "...", right: "...", ... }
          const output = positions
            .map(
              (pos) =>
                `${pos.charAt(0).toUpperCase() + pos.slice(1)}: ${data[pos]}`
            )
            .join("<br>");
          document.getElementById("recognitionText").innerHTML = output;
        });

      const output = positions
        .map(
          (pos) =>
            `${pos.charAt(0).toUpperCase() + pos.slice(1)}: ${
              descriptions[pos]
            }`
        )
        .join("<br>");

      document.getElementById("recognitionText").innerHTML = output;
    }
  });
}

// const video = document.getElementById("video");
// const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext("2d");

// const positions = ["front", "right", "left", "back"];
// let currentIndex = 0;

// // Start webcam
// navigator.mediaDevices
//   .getUserMedia({ video: true })
//   .then((stream) => (video.srcObject = stream))
//   .catch((err) => alert("Webcam access error: " + err));

// // Event listener for the button
// document.getElementById("captureBtn").addEventListener("click", captureImage);

// // Function to capture image and assign to img tag
// function captureImage() {
//   if (currentIndex >= positions.length) {
//     alert("✅ All 4 images captured!");
//     document.getElementById("captureBtn").disabled = true;
//     return;
//   }

//   // Sync canvas size to video size
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;

//   // Wait for the frame to be ready
//   requestAnimationFrame(() => {
//     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//     const dataURL = canvas.toDataURL("image/png");
//     const imgId = positions[currentIndex];
//     console.log(imgId);
//     document.getElementById(imgId).src = dataURL;
//     currentIndex++;
//   });
// }
