import os
from PIL import Image

def generate_gradient():
    # Configuration
    start_color = "#dfadb9"
    end_color = "#dd3e88"
    image_size = (4000, 4000) # Make image for desktop size
    
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    output_dir = os.path.join(project_root, "src", "renderer", "src", "assets", "images")
    output_path = os.path.join(output_dir, "background.png")
    
    # Ensure output directory exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Parse colors
    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    c1 = hex_to_rgb(start_color)
    c2 = hex_to_rgb(end_color)

    # Create image
    img = Image.new('RGB', image_size)
    pixels = img.load()
    width, height = image_size
    
    # Pre-calculate constants for diagonal gradient
    # We want the gradient to go from top-left (0,0) to bottom-right (width, height)
    # Projection of point (x,y) onto vector (width, height)
    # factor = (x*w + y*h) / (w*w + h*h)
    
    w_sq_plus_h_sq = width**2 + height**2
    
    print("Generating gradient... this might take a few seconds.")
    
    for y in range(height):
        for x in range(width):
            # Calculate interpolation factor (0.0 to 1.0)
            factor = (x * width + y * height) / w_sq_plus_h_sq
            
            # Adjust factor to emphasize end color (make it darker overall)
            # Using a power < 1 shifts values towards 1.0
            factor = factor ** 0.7
            
            # Interpolate colors
            r = int(c1[0] + (c2[0] - c1[0]) * factor)
            g = int(c1[1] + (c2[1] - c1[1]) * factor)
            b = int(c1[2] + (c2[2] - c1[2]) * factor)
            
            pixels[x, y] = (r, g, b)

    img.save(output_path)
    print(f"Gradient background generated at {output_path}")

if __name__ == "__main__":
    generate_gradient()
