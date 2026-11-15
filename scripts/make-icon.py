from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
root=Path(__file__).resolve().parent.parent
(root/'build').mkdir(exist_ok=True)
image=Image.new('RGBA',(256,256),(0,0,0,0))
draw=ImageDraw.Draw(image)
draw.rounded_rectangle((8,8,248,248),radius=62,fill='#69e3b1')
font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',115)
draw.text((40,42),'VR',font=font,fill='#101b17',stroke_width=1)
image.save(root/'build/icon.ico',sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
