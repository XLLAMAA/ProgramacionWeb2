import PDFDocument from 'pdfkit';

//Esta funcion genera los albaranes de los pedidos en funcion de deliveryData 
export const generateDeliveryNotePDF = async (deliveryData) => {
    return new Promise((resolve, reject) => {
        try {
            //Estructura del pdf a generar
            const doc = new PDFDocument({ size: 'A4', margin: 50 });

            //Guarda pdf en memoria
            const buffers = [];
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            //Parte header
            doc.fontSize(24).font('Helvetica-Bold').text('ALBARÁN DE ENTREGA', { align: 'center' });
            doc.moveDown(0.5);

            //Linea divisoria
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);

            //Info proyecto
            doc.fontSize(12).font('Helvetica-Bold').text('DATOS DEL PROYECTO', 50, doc.y);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Proyecto: ${deliveryData.projectName || 'N/A'}`, 50, doc.y + 5);
            doc.text(`Código: ${deliveryData.projectCode || 'N/A'}`, 50, doc.y + 20);
            doc.text(`Cliente: ${deliveryData.clientName || 'N/A'}`, 50, doc.y + 35);

            //Info detallada
            doc.fontSize(12).font('Helvetica-Bold').text('DETALLES', 330, 130);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Fecha: ${new Date(deliveryData.workDate).toLocaleDateString('es-ES')}`, 330, 155);
            doc.text(`Formato: ${deliveryData.format === 'material' ? 'Materiales' : 'Horas'}`, 330, 170);

            doc.moveDown(2);

            //En funcion del tipo de formato (material o horas)
            //"Material": - Crea la tabla: Material, Cantidad y Unidad
            //            - LLena con: material, quiantity y unit 
            //"Horas":  - Crea las tablas: trabajado y horas
            //          - Bucle que recorre y suma cada trabajador con sus horas
            //          -Suma total

            if (deliveryData.format === 'material') {

                doc.fontSize(12).font('Helvetica-Bold').text('MATERIALES ENTREGADOS');
                doc.moveDown(0.5);

                doc.fontSize(10);
                const tableTop = doc.y;
                const col1 = 50, col2 = 250, col3 = 400;

                //Headers de tabla
                doc.font('Helvetica-Bold');
                doc.text('Material', col1, tableTop);
                doc.text('Cantidad', col2, tableTop);
                doc.text('Unidad', col3, tableTop);

                //Linea debajo headers
                doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

                //Datos en tabla
                doc.font('Helvetica');
                doc.text(deliveryData.material || '-', col1, tableTop + 20);
                doc.text((deliveryData.quantity || '-').toString(), col2, tableTop + 20);
                doc.text(deliveryData.unit || '-', col3, tableTop + 20);

                doc.moveDown(3);

            } else {

                doc.fontSize(12).font('Helvetica-Bold').text('HORAS TRABAJADAS');
                doc.moveDown(0.5);

                doc.fontSize(10);
                const tableTop = doc.y;
                const col1 = 50, col2 = 250, col3 = 400;

                //Headers
                doc.font('Helvetica-Bold');
                doc.text('Trabajador', col1, tableTop);
                doc.text('Horas', col2, tableTop);
                doc.text('Total', col3, tableTop);

                //Linea
                doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

                //Datos trabajadores
                doc.font('Helvetica');
                let totalHours = 0;
                let yPosition = tableTop + 20;

                //Bucle
                if (deliveryData.workers && Array.isArray(deliveryData.workers)) {
                    deliveryData.workers.forEach((worker) => {
                        doc.text(worker.name || '-', col1, yPosition);
                        doc.text((worker.hours || '-').toString(), col2, yPosition);
                        totalHours += worker.hours || 0;
                        yPosition += 20;
                    });
                }

                //Total suma
                doc.font('Helvetica-Bold').fontSize(11);
                doc.text(`Total: ${totalHours}h`, col1, yPosition + 10);
            }

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

//Esta funcion crea pdf de reportes con multiples albaranes
//Recibe un array con varios albaranes y se le pasa ya el titulo dl pdf
//Devuelve la promesa (PDF completo en memoria)

export const generateDeliveryReportPDF = async (deliveryNotes, title = "Reporte de Albaranes") => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            //Header del reporte
            doc.fontSize(24).font('Helvetica-Bold').text(title, { align: 'center' });
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica').text(`Generado: ${new Date().toLocaleString('es-ES')}`, { align: 'center' });

            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);

            //Tabla resumen
            const col1 = 50, col2 = 200, col3 = 350, col4 = 450;
            const headerY = doc.y;

            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('Proyecto', col1, headerY);
            doc.text('Cliente', col2, headerY);
            doc.text('Fecha', col3, headerY);
            doc.text('Formato', col4, headerY);

            doc.moveTo(50, headerY + 15).lineTo(545, headerY + 15).stroke();
            doc.font('Helvetica').fontSize(9);
            doc.moveDown(1.5);

            //Recorre cada albaran y lo agrega como fila 
            deliveryNotes.forEach((note) => {
                const rowY = doc.y;
                doc.text(note.projectName?.substring(0, 20) || 'N/A', col1, rowY);
                doc.text(note.clientName?.substring(0, 15) || 'N/A', col2, rowY);
                doc.text(new Date(note.workDate).toLocaleDateString('es-ES'), col3, rowY);
                doc.text(note.format === 'material' ? 'Materiales' : 'Horas', col4, rowY);
                doc.moveDown(0.8);
            });

            // Resumen final
            doc.moveDown(2);
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text(`Total de albaranes: ${deliveryNotes.length}`);

            // Footer
            doc.fontSize(8).font('Helvetica');
            doc.text('BildyApp - Sistema de Gestión de Albaranes', 50, 750, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

export default { generateDeliveryNotePDF, generateDeliveryReportPDF }