
Search
Write

Christian Gintenreiter
Using Python to Capture and Describe Images with Google Gemini API: A Step-by-Step Guide
Hamzah Jomaa
Hamzah Jomaa

·
Follow

5 min read
·
Dec 26, 2023
79


1






Welcome to my guide on using Python with Google Gemini API. This guide is a follow-up to my earlier article about Google’s Gemini APIs. Here, I’ll show you how to take live images using Python and then use Google Gemini API to describe them. This guide is easy to follow, even if you’re new to Python or working with APIs. I’ll take you through each step, making sure everything is easy to understand.

In this story we will be discussing how to setup your enviroment and install the libraries needed; and I will be sharing the code I wrote. You will have access to my repository on github.

Project Folder Structure

project-name/
│
├── main.py # Main application file
├── video_stream.py # Handles the video stream functionality
├── content_description.py # Content description using Google API
└── .env # Environment variables file (contains Google API key)

Environment & Library Setup
The required libraries needed for the application.

Tkinter: This is a standard GUI library for Python, typically included with Python’s standard library, so no separate installation is usually needed.
OpenCV: A library focused on real-time computer vision.
Pillow (PIL Fork): This is a Python Imaging Library that adds image processing capabilities to your Python interpreter.
python-dotenv: This is a Python library for reading key-value pairs from a .env file and setting them as environment variables.
Google GenerativeAI: This library is needed for working with Google’s generative AI models.
Installation Instructions

To install these libraries, you can use pip, Python’s package installer. Open your terminal or command prompt and execute the following commands:

pip install opencv-python
pip install Pillow
pip install python-dotenv
pip install google-generativeai
Note: Ensure that you have Python installed on your system. These libraries are typically compatible with Python 3.x versions.

Additional Setup
Environment Variables: For using Google’s API, you need to set up an API key. Store this key in an .env file (in the same directory as your scripts) with the following format:
GOOGLE_API_KEY = your_api_key_here

The python-dotenv library will load this key into your environment variables.
Google API Account: Ensure you have a Google Cloud account and access to the Generative AI APIs. You’ll need to create a project in Google Cloud, enable the necessary APIs, and generate an API key.
Tkinter: It usually comes pre-installed with Python. If it’s not installed, you can install it via your operating system’s package manager. For example, on Ubuntu, you can install it using sudo apt-get install python3-tk.
Usage Notes
Make sure to replace your_api_key_here with your actual Google API key in the .env file.
It’s important to handle your API key securely and not expose it in your blog or public repositories.
Test your installation by running a simple script to import each library to ensure they are installed correctly.
Main.py
import tkinter as tk
from video_stream import VideoStreamHandler
from content_description import ContentDescriber

# Main GUI setup and button handlers
root = tk.Tk()
root.title("Webcam Stream")

user_input = tk.Entry(root, width=50)
user_input.pack()

canvas = tk.Canvas(root, width=640, height=480)
canvas.pack()

video_handler = VideoStreamHandler(root, canvas)
content_describer = ContentDescriber(root, user_input, video_handler)

button = tk.Button(root, text="Stop", width=50, command=video_handler.stop_video)
button.pack(anchor=tk.CENTER, expand=True)

describe_button = tk.Button(root, text="Describe the frame", width=50, command=content_describer.threaded_describe_content)
describe_button.pack(anchor=tk.CENTER, expand=True)

message_label = tk.Label(root, textvariable=content_describer.message_var, wraplength=500)
message_label.pack()

video_handler.start_stream()

root.mainloop()
main.py is the main file of the application. It brings everything together and creates the window you see on the screen. Here's what it does:

Starts the Application: Sets up the window where everything in the app will be shown.
User Input Box: Adds a place for you to type in commands or questions.
Shows Video: It has a space (canvas) to display the video from your webcam.
Handles Video: It uses code from video_stream.py to manage the webcam video.
Describes Video Content: It works with content_description.py to analyze and describe what's in the video.
Buttons for Commands: There are buttons to start/stop the video and to get the video described.
Displays Messages: Shows messages or results from analyzing the video.
Keeps the App Running: Makes sure the app window stays open and responds to what you do, like clicking buttons.
video_stream.py
import cv2
import threading
from PIL import Image, ImageTk
import tkinter as tk


class VideoStreamHandler:
    def __init__(self, root, canvas):
        self.root = root
        self.canvas = canvas
        self.cap = cv2.VideoCapture(0)
        self.photo = None
        self.current_frame = None

    def video_stream(self):
        while self.cap.isOpened():
            ret, frame = self.cap.read()
            if ret:
                self.current_frame = frame
                cv2image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                img = Image.fromarray(cv2image)
                self.photo = ImageTk.PhotoImage(image=img)
                self.canvas.create_image(0, 0, image=self.photo, anchor=tk.NW)
                self.root.update()

    def start_stream(self):
        thread = threading.Thread(target=self.video_stream)
        thread.start()

    def stop_video(self):
        if self.cap.isOpened():
            self.cap.release()
        self.root.destroy()

    def get_current_frame(self):
        return self.current_frame
video_stream.py is a file in the app that specifically deals with the video from your webcam. Here's what it mainly does:

Connects to Webcam: It starts the webcam so the app can use it for video.
Shows Video on Screen: Takes the video from the webcam and puts it on the app’s window so you can see it.
Handles Video: It makes sure the video keeps playing smoothly and updates the image you see.
Stops the Video: Has a way to stop the webcam when you’re done.
Shares Video Frames: It can give other parts of the app access to the current video frame, for things like analyzing the image.
content_description.py
import threading
import cv2
from PIL import Image
import io
from dotenv import load_dotenv
import os
import tkinter as tk
import google.generativeai as genai
import google.ai.generativelanguage as glm

load_dotenv()
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

class ContentDescriber:
    def __init__(self, root, user_input, video_handler):
        self.root = root
        self.user_input = user_input
        self.video_handler = video_handler
        self.message_var = tk.StringVar()

    def describe_content(self):
        current_frame = self.video_handler.get_current_frame()
        if current_frame is not None:
            pil_image = Image.fromarray(cv2.cvtColor(current_frame, cv2.COLOR_BGR2RGB))
            img_byte_arr = io.BytesIO()
            pil_image.save(img_byte_arr, format='JPEG')
            blob = glm.Blob(
                mime_type='image/jpeg',
                data=img_byte_arr.getvalue()
            )
            user_request = self.user_input.get()
            response = model.generate_content([user_request, blob], stream=True)
            for chunk in response:
                self.root.after(0, self.update_message, chunk.text)
        else:
            self.root.after(0, self.update_message, "No frame available")

    def threaded_describe_content(self):
        describe_thread = threading.Thread(target=self.describe_content)
        describe_thread.start()

    def update_message(self, new_text):
        current_text = self.message_var.get()
        updated_text = current_text + new_text + "\n"
        self.message_var.set(updated_text)
content_description.py is a part of the app that focuses on describing what's in the video. Here's its main role:

Analyzes Video Frames: It looks at the current image from your webcam and tries to understand what’s in it.
Uses Google AI: To figure out what’s in the image, it sends the picture to Google’s AI service, which can describe the scene.
Handles User Requests: It takes what you type in the app, like a command or question, and uses that to guide the AI in analyzing the image.
Shows Descriptions: After the AI analyzes the image, this file makes sure the description or response shows up in the app.
Works in the Background: It does all this without slowing down the rest of the app, by running in a separate process.
To wrap up, our project is a simple yet powerful tool that combines video streaming with AI to describe what’s happening in the video. It’s easy to use and understand, with main.py bringing everything together. This setup is perfect for those looking to explore the basics of integrating AI with real-world applications in a straightforward and accessible manner. Whether you're learning, teaching, or just experimenting, this project offers a great starting point to dive into the world of AI and video processing.
