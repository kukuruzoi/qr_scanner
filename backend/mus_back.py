from fastapi import FastAPI, Body
import psycopg2
from fastapi.middleware.cors import CORSMiddleware
import qrcode
from PIL import Image, ImageDraw, ImageFont
import base64
from io import BytesIO

#Ф-ИЯ ДЛЯ ДОСТУПА К БД
def get_connection_bd():
    conn = psycopg2.connect(
        dbname='database_m',
        user='postgres',
        password='889912Hi',
        host='127.0.0.1'
    )
    return conn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#сканируем qr. зная id получем name, location
@app.get("/item/{item_id}")
def get_info(item_id:str):
    
    conn = get_connection_bd()
    cursor = conn.cursor()

    cursor.execute("SELECT name, location FROM Exhibitions WHERE id = %s", (item_id,))
    data = cursor.fetchone()

    cursor.close()
    conn.close()

    return {"name": data[0], "location": data[1]}

#
@app.post("/add")
def add_data(data: dict):
    name = data.get("name")
    location = data.get("location")

    conn = get_connection_bd()
    cursor = conn.cursor()


    #ДОБАВЛЕНИЕ В БД
    cursor.execute("INSERT INTO Exhibitions(id, name, location) " \
    "               VALUES(coalesce((select max(id) from Exhibitions)+1, 1), %s, %s)", (name, location))
  
    cursor.execute("SELECT id FROM Exhibitions WHERE name = %s AND location = %s", (name, location))
    id_data = cursor.fetchone()

    #cursor.execute("SELECT name, location FROM Exhibitions WHERE name = %s AND location = %s", (name, location))
    #name_data = cursor.fetchone()

    clr_id = (str(id_data[0]).strip())
    cor_name = (str(name).strip())
    qr = qrcode.QRCode(border = 7)# qr
    qr.add_data(clr_id) #данные qr
    qr.make()
    img = qr.make_image().convert("RGB")
    # 
    draw = ImageDraw.Draw(img)

    font = ImageFont.truetype('arial.ttf', size=30)

    # вычисляем где будет текст 
    text_width = draw.textlength(cor_name, font=font)
    text_height = font.size
    x = (img.width - text_width) // 2
    y = img.height - text_height - 10

    text_color = 'rgb(0, 0, 0)' 

    draw.text((x, y), f'{cor_name}', fill=text_color, font=font)
    conn.commit()
    cursor.close()
    conn.close()

    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()


    return {"id " : clr_id,
            "name ": name,
            "location": location,
            "qr_code": f"data:image/png;base64,{img_str}",
            "qr_url": f"http://localhost:8000/item/{clr_id}"}













if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)