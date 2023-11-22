const fs = require('fs');
const express = require('express');
const { XMLParser } = require('fast-xml-parser');
const xmlbuilder = require('xmlbuilder');

const app = express();
const port = 8000;

// Читання XML з файлу
const xmlData = fs.readFileSync('data.xml', 'utf8');

// Парсинг XML у об'єкт
const parser = new XMLParser();
const jsonObj = parser.parse(xmlData);

// Фільтрація показників
function filterIndicators(data) {
    return data.indicators.basindbank.filter(item => item.parent === 'BS3_BanksLiab' && item.value);
}

// Обробка запитів на сервері
app.get('/', (req, res) => {
    // Фільтрація показників
    const filteredIndicators = filterIndicators(jsonObj);

    // Побудова нового об'єкту з відфільтрованими показниками
    const newData = {
        data: {
            indicators: filteredIndicators.map(item => ({
                txt: item.txten,
                value: item.value
            }))
        }
    };

    // Створення XML-рядка з об'єкта за допомогою xmlbuilder
    const root = xmlbuilder.create(newData);
    const xml = root.end({ pretty: true });

    // Надсилання нового XML у відповідь на запит
    res.type('application/xml');
    res.send(xml);
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

