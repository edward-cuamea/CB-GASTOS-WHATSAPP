// Importar las dependencias necesarias
const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const googleCredentials = JSON.parse(process.env.GOOGLE_JSON);

// Importar funciones personalizadas para interactuar con Google Sheets
const { appendToSpecificCells, getSheetValues } = require("./sheets")

// Definir el flujo para registrar un gasto
const flowGasto = addKeyword(['Gasto'])
    .addAnswer('Fecha del gasto', {capture: true},
        async(ctx, ctxFn) => {
            await ctxFn.state.update({ date: ctx.body })
        }
    )
    .addAnswer('Monto del gasto', {capture: true},
        async(ctx, ctxFn) => {
            await ctxFn.state.update({ amount: ctx.body })
        }
    )
    .addAnswer('Concepto del gasto', {capture: true},
        async(ctx, ctxFn) => {
            await ctxFn.state.update({ concept: ctx.body })
        }
    )
    .addAnswer('Categoría del gasto', {capture: true},
        async(ctx, ctxFn) => {
            await ctxFn.state.update({ category: ctx.body })
        }
    )
    .addAnswer('Gasto registrado', null,
        async(ctx, ctxFn) => {
            const date = ctxFn.state.get("date")
            const amount = ctxFn.state.get("amount")
            const concept = ctxFn.state.get("concept")
            const category = ctxFn.state.get("category")

             // Obtener la siguiente fila disponible
            const row = await getNextAvailableRow()

             // Preparar los datos para insertar en la hoja de cálculo
            const data = {
                [`A${row}`]: date,
                [`B${row}`]: amount,        // Gasto como número positivo
                [`C${row}`]: '',            // Columna de ingreso vacía
                [`D${row}`]: concept,
                [`E${row}`]: category
            }

            // Insertar los datos en la hoja de cálculo
            await appendToSpecificCells(data)
        }
    )

// Definir el flujo para registrar un ingreso
const flowIngreso = addKeyword(['Ingreso'])
    .addAnswer('Fecha del ingreso', {capture: true},
        async(ctx, ctxFn) => {
            await ctxFn.state.update({ date: ctx.body })
        }
    )
    .addAnswer('Monto del ingreso', {capture: true},
        async(ctx, ctxFn) => {
            await ctxFn.state.update({ amount: ctx.body })
        }
    )
    .addAnswer('Concepto del ingreso', {capture: true},
        async(ctx, ctxFn) => {
            await ctxFn.state.update({ concept: ctx.body })
        }
    )
    .addAnswer('Categoría del ingreso', {capture: true},
        async(ctx, ctxFn) => {
            await ctxFn.state.update({ category: ctx.body })
        }
    )
    .addAnswer('Ingreso registrado', null,
        async(ctx, ctxFn) => {
            const date = ctxFn.state.get("date")
            const amount = ctxFn.state.get("amount")
            const concept = ctxFn.state.get("concept")
            const category = ctxFn.state.get("category")
            
            const row = await getNextAvailableRow()
            
            const data = {
                [`A${row}`]: date,
                [`B${row}`]: '',            // Columna de gasto vacía
                [`C${row}`]: amount,        // Ingreso en la columna C
                [`D${row}`]: concept,
                [`E${row}`]: category
            }
            
            await appendToSpecificCells(data)
        }
    )

// Función para obtener la siguiente fila disponible en la hoja de cálculo
async function getNextAvailableRow() {
    const values = await getSheetValues('A:A')
    return values.length + 1
}

// Función principal para iniciar el bot
const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowGasto, flowIngreso])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

// Ejecutar la función principal
main()
