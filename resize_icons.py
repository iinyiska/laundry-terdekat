from PIL import Image
import os

# Source image
source = r"C:\Users\ASUS\.gemini\antigravity\brain\71a23cc8-2912-4283-938b-77043be6a5f3\uploaded_media_1769681353615.jpg"
base_dir = r"C:\Users\ASUS\.gemini\antigravity\scratch\laundry-terdekat\android\app\src\main\res"

# Android icon sizes
sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

# Open source image
img = Image.open(source)
img = img.convert("RGBA")

# Create white background for areas that might be transparent
background = Image.new("RGBA", img.size, (255, 255, 255, 255))
composite = Image.alpha_composite(background, img)
composite = composite.convert("RGB")

for folder, size in sizes.items():
    folder_path = os.path.join(base_dir, folder)
    
    # Resize
    resized = composite.resize((size, size), Image.Resampling.LANCZOS)
    
    # Save as PNG
    resized.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
    resized.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
    resized.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")
    print(f"Saved {size}x{size} icons to {folder}")

print("Done!")
