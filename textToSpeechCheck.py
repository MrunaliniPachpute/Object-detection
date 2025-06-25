import pyttsx3

engine = pyttsx3.init()
voices = engine.getProperty('voices')

# Set to Zira (female voice at index 1)
engine.setProperty('voice', voices[1].id)

# Optional settings
engine.setProperty('rate', 150)     # Speed
engine.setProperty('volume', 1.0)   # Max volume

engine.say("Hello! I'm , here to assist you.Namaste!")
engine.runAndWait()
