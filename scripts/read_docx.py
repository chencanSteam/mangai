import docx
from docx import Document
from docx.shared import RGBColor

doc = Document('用户、服务商端App原型优化修改意见(宋总).docx')

print("=== 所有段落文本 ===")
for i, para in enumerate(doc.paragraphs):
    text = para.text.strip()
    if text:
        # 检查是否有蓝色字体
        has_blue = False
        for run in para.runs:
            if run.font.color and run.font.color.rgb:
                rgb = run.font.color.rgb
                if rgb == RGBColor(0x00, 0x00, 0xFF) or rgb == RGBColor(0x00, 0x00, 0x80) or rgb == RGBColor(0x00, 0x5B, 0x9F):
                    has_blue = True
        print(f'{i}: [BLUE={has_blue}] {text}')
