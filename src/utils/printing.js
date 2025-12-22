export const printReceipt = (op, settings) => {
    const isAr = settings.language === 'ar';
    const today = new Date(op.timestamp || new Date());
    const todayStr = today.toLocaleDateString(isAr ? 'ar-EG' : 'en-US');
    const timeStr = today.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US');

    const debt = op.price - op.paidAmount;
    const paidText = isAr
        ? (op.paymentStatus === 'paid' ? 'دفع بالكامل' : (op.paymentStatus === 'partial' ? 'دفع جزئي' : 'آجل'))
        : (op.paymentStatus === 'paid' ? 'Fully Paid' : (op.paymentStatus === 'partial' ? 'Partial' : 'Debt'));

    const labels = {
        title: isAr ? 'فاتورة بيع' : 'Sales Invoice',
        address: isAr ? 'العنوان' : 'Address',
        phone: isAr ? 'تليفون' : 'Phone',
        desc: isAr ? 'الوصف' : 'Description',
        price: isAr ? 'السعر' : 'Price',
        qty: isAr ? 'الكمية' : 'Qty',
        total: isAr ? 'الإجمالي' : 'Total',
        cash: isAr ? 'المدفوع' : 'Cash',
        remaining: isAr ? 'المتبقي/الدين' : 'Remaining/Debt',
        customer: isAr ? 'العميل' : 'Customer',
        date: isAr ? 'التاريخ' : 'Date',
        status: isAr ? 'حالة الدفع' : 'Payment Status',
        thanks: isAr ? 'شكراً لزيارتكم!' : 'Thank you for your visit!'
    };

    const html = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Cairo', sans-serif, system-ui; }
            body { background: white; padding: 10px; width: 80mm; margin: 0 auto; direction: ${isAr ? 'rtl' : 'ltr'}; }
            .receipt { width: 100%; border: 1px solid #eee; padding: 10px; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 1.4rem; font-weight: 700; margin-bottom: 5px; }
            .header p { font-size: 0.8rem; color: #555; line-height: 1.4; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .stars { text-align: center; font-size: 1rem; margin: 5px 0; }
            .title { text-align: center; font-weight: 700; font-size: 1.1rem; margin-bottom: 5px; }
            .table { width: 100%; margin-bottom: 10px; border-collapse: collapse; }
            .table th { border-bottom: 1px solid #000; padding: 5px 0; font-size: 0.85rem; text-align: ${isAr ? 'right' : 'left'}; }
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
                <p>${labels.address}: ${settings.receipt.address}</p>
                <p>${labels.phone}: ${settings.receipt.phone}</p>
            </div>
            
            <div class="stars">*********************</div>
            <div class="title">${labels.title}</div>
            <div class="stars">*********************</div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th style="width: 70%;">${labels.desc}</th>
                        <th style="text-align: ${isAr ? 'left' : 'right'};">${labels.price}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>
                            ${op.partName}<br>
                            <small>${labels.qty}: ${op.quantity || 1} x ${(op.price / (op.quantity || 1)).toLocaleString()}</small>
                        </td>
                        <td style="text-align: ${isAr ? 'left' : 'right'};">${op.price.toLocaleString()}</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="divider"></div>
            
            <div class="row row-bold">
                <span>${labels.total}</span>
                <span>${op.price.toLocaleString()}</span>
            </div>
            <div class="row">
                <span>${labels.cash}</span>
                <span>${op.paidAmount.toLocaleString()}</span>
            </div>
            <div class="row">
                <span>${labels.remaining}</span>
                <span>${debt.toLocaleString()}</span>
            </div>
            
            <div class="stars">*********************</div>
            <div style="font-size: 0.8rem; text-align: ${isAr ? 'right' : 'left'}; margin-top: 10px;">
                <p>${labels.customer}: ${op.customerName}</p>
                <p>${labels.date}: ${todayStr} - ${timeStr}</p>
                <p>${labels.status}: ${paidText}</p>
            </div>
            <div class="stars">*********************</div>
            
            <div class="footer">
                <p>${settings.receipt.footer}</p>
                <p>${labels.thanks}</p>
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
    const isAr = settings.language === 'ar';
    const todayStr = new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US');
    const timeStr = new Date().toLocaleTimeString(isAr ? 'ar-EG' : 'en-US');

    const diffText = isAr
        ? (diff === 0 ? 'مطابق' : (diff < 0 ? `عجز(${Math.abs(diff)})` : `زيادة(${diff})`))
        : (diff === 0 ? 'Balanced' : (diff < 0 ? `Shortage(${Math.abs(diff)})` : `Surplus(${diff})`));

    const labels = {
        title: isAr ? 'تقرير إغلاق اليومية' : 'Daily Close Report',
        expected: isAr ? 'المبيعات النقدية المتوقعة:' : 'Expected Cash Sales:',
        actual: isAr ? 'المبلغ الفعلي بالخزنة:' : 'Actual Cash in Safe:',
        diff: isAr ? 'الفرق (العجز/الزيادة):' : 'Difference (Shortage/Surplus):',
        signature: isAr ? 'توقيع المدير المسؤول' : 'Manager Signature'
    };

    const html = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Cairo', sans-serif, system-ui; }
            body { background: white; padding: 20px; width: 100mm; margin: 0 auto; direction: ${isAr ? 'rtl' : 'ltr'}; }
            .report { border: 2px solid #000; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 1.1rem; }
            .row-bold { font-weight: 700; border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; }
        </style>
        <div class="report">
            <div class="header">
                <h2>${labels.title}</h2>
                <h3>${settings.receipt.title}</h3>
                <p>${todayStr} - ${timeStr}</p>
            </div>
            <div class="row">
                <span>${labels.expected}</span>
                <span>${expected.toLocaleString()}</span>
            </div>
            <div class="row">
                <span>${labels.actual}</span>
                <span>${actual.toLocaleString()}</span>
            </div>
            <div class="row row-bold">
                <span>${labels.diff}</span>
                <span>${diffText}</span>
            </div>
            <div style="margin-top: 40px; text-align: center; border-top: 1px solid #000; padding-top: 10px;">
                <p>${labels.signature}</p>
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
