// Importar y configurar dotenv para cargar variables de entorno
require('dotenv').config();

// Importar la biblioteca de Google APIs
const { google } = require('googleapis');

// Configurar la autenticación de Google
const auth = new google.auth.GoogleAuth({
    keyFile: googleCredentials, // Archivo de credenciales de Google
    scopes: ['https://www.googleapis.com/auth/spreadsheets'] // Alcance para acceder a Google Sheets
});

// Obtener el ID de la hoja de cálculo desde las variables de entorno
const spreadsheetId = process.env.SPREADSHEET_ID;

// Función para agregar datos a celdas específicas de la hoja de cálculo
async function appendToSpecificCells(data) {
    // Crear cliente de Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });
    const valueInputOption = 'USER_ENTERED';  // Opción para interpretar los valores ingresados

    // Preparar las solicitudes de actualización para cada celda
    const requests = Object.entries(data).map(([cell, value]) => ({
        range: `Sheet1!${cell}`, // Rango de la celda a actualizar
        values: [[value]] // Valor a insertar
    }));

    try {
        // Realizar la actualización por lotes
        const res = await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            resource: {
                valueInputOption,
                data: requests
            }
        });
        return res;
    } catch (error) {
        console.error('error', error);
    }
}

// Función para obtener valores de un rango específico de la hoja de cálculo
async function getSheetValues(range) {
    // Crear cliente de Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });

    try {
        // Obtener los valores del rango especificado
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `Sheet1!${range}`,
        });
        return response.data.values || []; // Devolver los valores o un array vacío si no hay datos
    } catch (error) {
        console.error('Error al obtener valores de la hoja:', error);
        return [];
    }
}

// Exportar las funciones para su uso en otros archivos
module.exports = { appendToSpecificCells, getSheetValues }