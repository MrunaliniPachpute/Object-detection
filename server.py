from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from PIL import Image
from io import BytesIO
import torch
import numpy as np
import sys
import cv2

# Add yolov5 to path
sys.path.append('./yolov5')

from yolov5.models.common import DetectMultiBackend
from yolov5.utils.general import non_max_suppression
from yolov5.utils.torch_utils import select_device

app = Flask(__name__)
CORS(app)

# Load YOLOv5 model
device = select_device('')
model = DetectMultiBackend('yolov5s.pt', device=device)
model.eval()
names = model.names

def letterbox(im, new_shape=(640, 640), color=(114, 114, 114)):
    shape = im.shape[:2]  # current shape [height, width]
    ratio = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
    new_unpad = int(round(shape[1] * ratio)), int(round(shape[0] * ratio))
    dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]
    dw /= 2  # divide padding into 2 sides
    dh /= 2

    im = cv2.resize(im, new_unpad, interpolation=cv2.INTER_LINEAR)
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    im = cv2.copyMakeBorder(im, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)

    return im, ratio, (dw, dh)

def run_yolo_inference(img_np):
    img, _, _ = letterbox(img_np, new_shape=(640, 640))
    img = img[:, :, ::-1].transpose(2, 0, 1)  # BGR to RGB, to 3xHxW
    img = np.ascontiguousarray(img)

    img_tensor = torch.from_numpy(img).float() / 255.0
    img_tensor = img_tensor.unsqueeze(0).to(device)

    with torch.no_grad():
        pred = model(img_tensor)
        pred = non_max_suppression(pred, 0.25, 0.45)

    detected = set()
    for det in pred:
        if len(det):
            for *xyxy, conf, cls in det:
                detected.add(names[int(cls)])

    return ", ".join(sorted(detected)) if detected else "No objects detected"

@app.route("/analyze-all", methods=["POST"])
def analyze_all_images():
    data = request.get_json()
    result = {}

    for position, img_b64 in data.items():
        img_data = base64.b64decode(img_b64.split(',')[1])
        img = Image.open(BytesIO(img_data)).convert("RGB")
        img_np = np.array(img)

        objects = run_yolo_inference(img_np)
        result[position] = objects

    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
