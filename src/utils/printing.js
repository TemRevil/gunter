export const printReceipt = (op, settings) => {
    const today = new Date(op.timestamp || new Date());
    const todayStr = today.toLocaleDateString('ar-EG');
    const timeStr = today.toLocaleTimeString('ar-EG');
    const debt = op.price - op.paidAmount;
    const paidText = op.paymentStatus === 'paid' ? 'دفع بالكامل' : (op.paymentStatus === 'partial' ? 'دفع جزئي' : 'آجل');

    const html = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Cairo', sans-serif; }
            body { background: white; padding: 10px; width: 80mm; margin: 0 auto; direction: rtl; }
            .receipt { width: 100%; border: 1px solid #eee; padding: 10px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 5px; }
            .header p { font-size: 0.8rem; color: #555; line-height: 1.4; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .stars { text-align: center; font-size: 1rem; margin: 5px 0; }
            .title { text-align: center; font-weight: 700; font-size: 1.1rem; margin-bottom: 5px; }
            .table { width: 100%; margin-bottom: 10px; border-collapse: collapse; }
            .table th { border-bottom: 1px solid #000; padding: 5px 0; font-size: 0.85rem; text-align: right; }
            .table td { padding: 8px 0; font-size: 0.9rem; vertical-align: top; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.95rem; }
            .row-bold { font-weight: 700; font-size: 1.2rem; margin-top: 5px; }
            .footer { text-align: center; margin-top: 25px; }
            .footer p { font-size: 0.9rem; font-weight: 600; }
            .barcode { margin-top: 15px; height: 30px; background: repeating-linear-gradient(90deg, #000, #000 2px, #fff 2px, #fff 4px); opacity: 0.5; }
            @media print { body { width: 100%; padding: 0; } .receipt { border: none; } }
        </style>
        <div class="receipt">
            <div class="header">
                <h1>${settings.receipt.title}</h1>
                <p>العنوان: ${settings.receipt.address}</p>
                <p>تليفون: ${settings.receipt.phone}</p>
            </div>
            
            <div class="stars">*********************</div>
            <div class="title">فاتورة بيع</div>
            <div class="stars">*********************</div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 70%;">الوصف (Description)</th>
                        <th style="text-align: left;">السعر</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            ${op.partName}<br>
                            <small>الكمية: ${op.quantity || 1} x ${op.price / (op.quantity || 1)}</small>
                        </td>
                        <td style="text-align: left;">${op.price}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="divider"></div>
            
            <div class="row row-bold">
                <span>الإجمالي (Total)</span>
                <span>${op.price}</span>
            </div>
            <div class="row">
                <span>المدفوع (Cash)</span>
                <span>${op.paidAmount}</span>
            </div>
            <div class="row">
                <span>المتبقي/الدين (Remaining)</span>
                <span>${debt}</span>
            </div>
            
            <div class="stars">*********************</div>
            <div style="font-size: 0.8rem; text-align: right; margin-top: 10px;">
                <p>العميل: ${op.customerName}</p>
                <p>التاريخ: ${todayStr} - ${timeStr}</p>
                <p>حالة الدفع: ${paidText}</p>
            </div>
            <div class="stars">*********************</div>
            
            <div class="footer">
                <p>${settings.receipt.footer}</p>
                <p>شكراً لزيارتكم!</p>
                <div class="barcode"></div>
            </div>
        </div>
    `;

    const printWindow = window.open('', '', 'width=400,height=700');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
};

export const printEndSessionReport = (expected, actual, diff, settings) => {
    const todayStr = new Date().toLocaleDateString('ar-EG');
    const timeStr = new Date().toLocaleTimeString('ar-EG');
    const diffText = diff === 0 ? 'مطابق' : (diff < 0 ? `عجز(${Math.abs(diff)})` : `زيادة(${diff})`);

    const html = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Cairo', sans-serif; }
            body { background: white; padding: 20px; width: 100mm; margin: 0 auto; direction: rtl; }
            .report { border: 2px solid #000; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 1.1rem; }
            .row-bold { font-weight: 700; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
        </style>
        <div class="report">
            <div class="header">
                <h2>تقرير إغلاق اليومية</h2>
                <h3>${settings.receipt.title}</h3>
                <p>${todayStr} - ${timeStr}</p>
            </div>
            <div class="row">
                <span>المبيعات النقدية المتوقعة:</span>
                <span>${expected}</span>
            </div>
            <div class="row">
                <span>المبلغ الفعلي بالخزنة:</span>
                <span>${actual}</span>
            </div>
            <div class="row row-bold">
                <span>الفرق (العجز/الزيادة):</span>
                <span>${diffText}</span>
            </div>
            <div style="margin-top: 40px; text-align: center; border-top: 1px solid #000; padding-top: 10px;">
                <p>توقيع المدير المسؤول</p>
                <div style="margin-top: 40px; border-bottom: 1px solid #000; width: 200px; margin-left: auto; margin-right: auto;"></div>
            </div>
        </div>
    `;

    const printWindow = window.open('', '', 'width=600,height=800');
    if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }
};
