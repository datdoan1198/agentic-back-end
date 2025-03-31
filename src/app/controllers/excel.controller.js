const ExcelJS = require('exceljs')
import _ from 'lodash'
const path = require('path')
const fs = require('fs')

export async function exportExcel(req, res) {
    const jsonData = await handleGetJsonData(req)
    const data = handleConvertDateExcel(jsonData)

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sheet1')

    worksheet.columns = [
        { header: 'BID METRICS', key: 'bidMetrics', width: 60 },
        { header: 'DEAL TEAM ASK', key: 'dealTeamAsk', width: 60 },
    ]

    data.forEach((row) => {
        worksheet.addRow({ bidMetrics: row['BID METRICS'], dealTeamAsk: row['DEAL TEAM ASK'] })
    })

    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            cell.alignment = { wrapText: true }
        })
    })

    data.forEach((row, index) => {
        if (row['BID METRICS'] === row['DEAL TEAM ASK']) {
            const rowIndex = index + 2
            worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`)
            const mergedCell = worksheet.getCell(`A${rowIndex}`)

            mergedCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: row['color'] },
            }
            mergedCell.alignment = { horizontal: 'center', vertical: 'middle' }
        }
    })

    const filePath = path.join('public', 'change-excel.xlsx')
    await workbook.xlsx.writeFile(filePath)

    res.download(filePath, 'change-excel.xlsx', (err) => {
        if (err) {
            console.error('Lỗi khi tải file:', err)
            res.status(500).send('Lỗi khi tải file.')
        }
        setTimeout(() => fs.unlinkSync(filePath), 5000)
    })
}

async function handleGetJsonData (req) {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(req.body.file.buffer)

    const sheet = workbook.worksheets[0]
    const jsonData = []

    sheet.eachRow((row) => {
        const rowData = []
        row.eachCell((cell) => {
            if (!cell.value) {
                rowData.push({ value: null, isUnderlined: false, bgColor: null })
                return
            }
            let cellText = null
            let isUnderlined = false

            if (Array.isArray(cell.value?.richText)) {
                cellText = cell.value.richText.map(rt => rt.text).join('')
                isUnderlined = cell.value.richText.some(rt => rt.font?.underline === true)
            } else {
                cellText = String(cell.text || cell.value || '')
                isUnderlined = !!cell.font?.underline
            }

            rowData.push({
                value: cellText,
                isUnderlined,
                bgColor: cell.fill?.fgColor?.argb || null,
            })
        })
        jsonData.push(rowData)
    })
    return _.uniqWith(jsonData, _.isEqual)
}

function handleConvertDateExcel (rawData) {
    const newDataExcel = []
    let currentGroup = []
    rawData.forEach((data) => {
        if (data.length > 0 && data.every(item => item.value !== null)) {
            switch (data.length) {
                case 1:
                    newDataExcel.push({
                        'BID METRICS': data[0].value,
                        'DEAL TEAM ASK': data[0].value,
                        'color': data[0].bgColor
                    })
                    break
                default:
                    if (data.every(item => item.value === data[0].value)) {
                        newDataExcel.push({
                            'BID METRICS': data[0].value,
                            'DEAL TEAM ASK': data[0].value,
                            'color': data[0].bgColor || 'fff3cf'
                        })
                    } else {
                        const bidMetric = data[0]
                        const dealTeamASK = data.slice(1)
                        const isAllIsUnderlined = data.every(item => item.isUnderlined === true)

                        if (dealTeamASK.every(itemDeal => itemDeal.value === dealTeamASK[0].value)) {
                            if (!isAllIsUnderlined) {
                                newDataExcel.push({
                                    'BID METRICS': bidMetric.value,
                                    'DEAL TEAM ASK': dealTeamASK[0].value,
                                    'color': null
                                })
                            } else {
                                newDataExcel.push({
                                    'BID METRICS': bidMetric.value,
                                    'DEAL TEAM ASK': dealTeamASK[0].value,
                                    'color': 'fff3cf',
                                })
                            }
                        } else {
                            if (!isAllIsUnderlined) {
                                data.forEach((item, index) => {
                                    if(index === 0) {
                                        newDataExcel.push({
                                            'BID METRICS': item.value,
                                            'DEAL TEAM ASK': '',
                                            'color': null
                                        })
                                    } else {
                                        newDataExcel.push({
                                            'BID METRICS': currentGroup[index - 1] || '',
                                            'DEAL TEAM ASK': item.value,
                                            'color': null
                                        })
                                    }
                                })
                            } else {
                                const text = dealTeamASK.map(itemDeal => itemDeal.value).join(' & ')
                                currentGroup = dealTeamASK.map(item => item.value)

                                newDataExcel.push({
                                    'BID METRICS': bidMetric.value,
                                    'DEAL TEAM ASK': text,
                                    'color': 'fff3cf'
                                })
                            }
                        }
                    }
                    break
            }
        }
    })

    return newDataExcel
}
