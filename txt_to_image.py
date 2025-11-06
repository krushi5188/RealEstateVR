from PIL import Image, ImageDraw

def txt_to_image(input_path, output_path, block_size=20):
    with open(input_path, 'r') as f:
        lines = f.readlines()

    height = len(lines) * block_size
    width = len(lines[0].strip()) * block_size

    img = Image.new('RGB', (width, height), color = 'white')
    draw = ImageDraw.Draw(img)

    for y, line in enumerate(lines):
        for x, char in enumerate(line.strip()):
            if char == 'x':
                draw.rectangle(
                    [(x * block_size, y * block_size), ((x + 1) * block_size, (y + 1) * block_size)],
                    fill='black'
                )

    img.save(output_path)

if __name__ == '__main__':
    txt_to_image('floorplan.txt', 'floorplan.png')
