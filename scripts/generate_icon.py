import os
import sys
from PIL import Image, ImageDraw, ImageFont, ImageOps

# --- Configuration ---
CANVAS_SIZE = (1024, 1024)  # Total file size
MARGIN = 80                 # The empty space around the icon
TOP_COLOR_HEX = "#dfadb9"
BOTTOM_COLOR_HEX = "#dd3e88"
TEXT_CONTENT = "Harry's"
TEXT_COLOR = "white"
FONT_FILENAME = "dynapuff.bold.ttf"
OUTPUT_FILENAME = "icon_rounded.png"

# --- Helper Functions ---

def hex_to_rgb(hex_color):
    """Converts hex string (e.g., #ffffff) to rgb tuple (255, 255, 255)."""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def create_gradient(width, height, start_hex, end_hex):
    """Creates a vertical gradient image."""
    base = Image.new('RGBA', (width, height), start_hex)
    draw = ImageDraw.Draw(base)
    
    start_r, start_g, start_b = hex_to_rgb(start_hex)
    end_r, end_g, end_b = hex_to_rgb(end_hex)

    for y in range(height):
        # Calculate interpolation factor
        factor = y / height
        
        # Interpolate colors
        r = int(start_r + (end_r - start_r) * factor)
        g = int(start_g + (end_g - start_g) * factor)
        b = int(start_b + (end_b - start_b) * factor)
        
        # Draw line (alpha 255 for full opacity)
        draw.line([(0, y), (width, y)], fill=(r, g, b, 255))
    
    return base

def add_rounded_corners(image, radius):
    """
    Applies a rounded rectangle mask to the image to create transparent corners.
    """
    # Create a mask image (L mode = grayscale)
    mask = Image.new('L', image.size, 0)
    draw = ImageDraw.Draw(mask)
    
    # Draw a white rounded rectangle on the black mask
    # The white area is what will be kept
    draw.rounded_rectangle(
        [(0, 0), image.size], 
        radius=radius, 
        fill=255
    )
    
    # Apply the mask to the image
    result = image.copy()
    result.putalpha(mask)
    return result

def main():
    # 1. Setup Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    font_path = os.path.join(project_root, 'src', 'renderer', 'src', 'assets', 'fonts', FONT_FILENAME)
    output_path = os.path.join(project_root, 'resources', OUTPUT_FILENAME)

    if not os.path.exists(font_path):
        print(f"Error: Could not find font at {font_path}")
        sys.exit(1)

    # 2. Calculate Dimensions
    # The actual colored box size is Canvas - (Margin * 2)
    inner_width = CANVAS_SIZE[0] - (MARGIN * 2)
    inner_height = CANVAS_SIZE[1] - (MARGIN * 2)
    
    # macOS standard corner radius is roughly 22.5% of the icon shape size
    corner_radius = int(inner_width * 0.225)

    print(f"Generating icon body ({inner_width}x{inner_height}) with {corner_radius}px radius...")

    # 3. Create the Inner Icon Body (The colored part)
    icon_body = create_gradient(inner_width, inner_height, TOP_COLOR_HEX, BOTTOM_COLOR_HEX)
    draw_body = ImageDraw.Draw(icon_body)

    # 4. Setup Font
    # Adjust font size relative to the INNER box, not the full canvas
    font_size = int(inner_width * 0.225) 
    
    try:
        font = ImageFont.truetype(font_path, font_size)
    except Exception as e:
        print(f"Error loading font: {e}")
        sys.exit(1)

    # 5. Draw Text on the Icon Body
    center_x = inner_width / 2
    center_y = inner_height / 2
    
    print(f"Drawing text '{TEXT_CONTENT}'...")
    draw_body.text(
        (center_x, center_y), 
        TEXT_CONTENT, 
        font=font, 
        fill=TEXT_COLOR, 
        anchor="mm"
    )

    # 6. Apply Rounded Corners to the Icon Body
    icon_body = add_rounded_corners(icon_body, corner_radius)

    # 7. Composite onto the Transparent Canvas
    # Create the full 1024x1024 canvas with full transparency (0,0,0,0)
    final_canvas = Image.new("RGBA", CANVAS_SIZE, (0, 0, 0, 0))
    
    # Calculate position to paste (centering the inner body)
    paste_x = (CANVAS_SIZE[0] - inner_width) // 2
    paste_y = (CANVAS_SIZE[1] - inner_height) // 2
    
    # Paste the icon body onto the canvas
    final_canvas.paste(icon_body, (paste_x, paste_y), icon_body)

    # 8. Save
    final_canvas.save(output_path, "PNG")
    print(f"Success! App icon created at: {output_path}")

if __name__ == "__main__":
    main()
