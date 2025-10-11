const scan_qr = document.getElementById("scan_qr");
const add_qr = document.getElementById("add_qr");
const add_info = document.getElementById("add_info");
const reader = document.getElementById("reader");
const textbox_newQr = document.getElementById("textbox_newQr");
const img_ctreated_qr = document.getElementById("img_ctreated_qr");
const download = document.getElementById("download");
const print = document.getElementById("print");
const sub_in_box = document.getElementById("sub_in_box");
const actions_with_scan = document.getElementById("actions_with_scan");
const response_scan = document.getElementById("response_scan");


let html5QrCode;


//ФУНКЦИЯ СКАНИРОВАНИЯ И ВЫВОДА ИНФОРМАЦИИ
async function loadItemData(itemId) {
  const response = await fetch(`http://localhost:8000/item/${itemId}`);
  const data = await response.json();  // Автоматически парсит JSON
        
  document.getElementById('item-info').innerHTML = 
          `<h3>${data.name}</h3>
          <p><strong>Местоположение:</strong> ${data.location}</p>`;
  actions_with_scan.style.display = "block";
}


//ФУНКЦИЯ ДОБАВЛЕНИЯ ДАННЫХ В БД
async function send_info(){
  const name = document.getElementById('name').value;
  const location = document.getElementById('location').value;
  const response = await fetch(`http://localhost:8000/add`, {
            method: "POST",
            headers: { 
                "Accept": "application/json", 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                name: name,
                location: location
            })
          });
  if (response.ok) {
            const data = await response.json();
            //img_ctreated_qr.style.display = "block";
            //alert('Данные успешно добавлены! ID: ' + data.id);
            document.getElementById('img_qr').src = data.qr_code;

            /*document.getElementById('qr-info').innerHTML =
              `
              Название:${data.name}<br>
              Местоположение:${data.location}<br>`*/

            download.addEventListener("click", () => { //при нажатии на кнопку сохранения
              var element = document.createElement('a');
              element.setAttribute('href', data.qr_code);
              element.setAttribute('download', `qr-${data.id}.png`);
              element.style.display = 'none';
              document.body.appendChild(element);
              
              element.click();
              document.body.removeChild(element);
  
            });

            /*print.addEventListener("click", () => {
              const qrBlock = document.getElementById('img_ctreated_qr');

              // скрываем всё, кроме QR
              const allElements = document.body.children;
              for (let el of allElements) {
                if (el !== qrBlock) el.style.display = 'none';
              }

              // печать
              window.print();

              // возвращаем всё обратно после печати
              for (let el of allElements) {
                el.style.display = '';
              }
            });*/



            
            //document.getElementById('print_new_qr').print = `qr-${data.id}.png`;
            /*var win = window.open();
            win.document.write('<img src="http://javascript.ru/forum/image.php?u=19820&dateline=1334914235">');
            win.print();
            win.close()*/

            document.getElementById('img_ctreated_qr').style.display = 'block';

            document.getElementById('name').value = '';
            document.getElementById('location').value = '';
            document.getElementById('textbox_newQr').style.display = 'none';
  }
  else
    console.log(response);
 
}



scan_qr.addEventListener("click", () => { //при нажатии на кнопку сканирования qr
  if (textbox_newQr.style.display == "block") textbox_newQr.style.display = "none"; 
  if (img_ctreated_qr.style.display == "block") img_ctreated_qr.style.display = "none";
  
  scan_qr.disabled = true;
  response_scan.style.display = "block";
  reader.style.display = "block";

  html5QrCode = new Html5Qrcode("reader");
  html5QrCode.start(
    { facingMode: "environment" }, // задняя камера
    { fps: 10, qrbox: 250 },
    async (qrCodeMessage) => {  //если qr считан           
      await html5QrCode.stop(); // Останавливаем сканер сразу
      reader.style.display = "none";
      scan_qr.disabled = false;
                       
      await loadItemData(qrCodeMessage);  // Загружаем данные с бэкенда
    },
    errorMessage => {
            // сюда будут приходить ошибки при отсутствии кода
    }
  ).catch(err => {
    console.error("Ошибка камеры:", err);
  });
  scan_qr.disabled = false;
});


add_qr.addEventListener("click", () => { //при нажатии на кнопку добавления
  if (response_scan.style.display == "block") response_scan.style.display = "none";
  textbox_newQr.style.display = "block";
  
});

add_info.addEventListener("click", send_info);

sub_in_box.addEventListener("click", () => { //
  
  
});

