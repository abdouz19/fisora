import React, { useEffect } from 'react';

export default function InvoicePrint({ invoiceData, onPrinted }) {
  useEffect(() => {
    if (invoiceData) {
      // Small timeout to allow DOM to render the invoice before opening print dialog
      const timer = setTimeout(() => {
        window.print();
        if (onPrinted) onPrinted();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invoiceData, onPrinted]);

  if (!invoiceData) return null;

  return (
    <div className="hidden print:block absolute top-0 left-0 w-full bg-white text-black min-h-screen z-[9999] p-10 font-sans" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-1">Fisora Production</h1>
          <p className="text-sm text-gray-500">Agence de Production Audiovisuelle</p>
          <p className="text-sm text-gray-500 mt-2">Tel: 0555 11 22 33</p>
          <p className="text-sm text-gray-500">Email: contact@fisoraproduction.com</p>
        </div>
        <div className="text-left">
          <h2 className="text-3xl font-bold text-gray-800 uppercase tracking-widest mb-2">Facture</h2>
          <p className="text-sm text-gray-600">
            <strong>رقم الفاتورة:</strong> INV-{Date.now().toString().slice(-6)}
          </p>
          <p className="text-sm text-gray-600">
            <strong>التاريخ:</strong> {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-3">معلومات العميل</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600"><strong>الاسم:</strong> {invoiceData.firstName} {invoiceData.lastName}</p>
            {invoiceData.company && (
              <p className="text-sm text-gray-600 mt-1"><strong>الشركة:</strong> {invoiceData.company}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600"><strong>رقم الهاتف:</strong> <span dir="ltr">{invoiceData.phone}</span></p>
          </div>
        </div>
      </div>

      {/* Invoice Details Table */}
      <table className="w-full text-sm text-right mb-8 border border-gray-300">
        <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-300">
          <tr>
            <th className="p-4 w-1/2">البيان (Description)</th>
            <th className="p-4 text-center">الكمية (Qté)</th>
            <th className="p-4 text-left">المبلغ الإجمالي (DA)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          <tr>
            <td className="p-4 font-medium text-gray-800">
              {invoiceData.pack === 'باقة مخصصة' ? 'باقة مخصصة (Custom Agreement)' : `باقة ${invoiceData.pack}`}
            </td>
            <td className="p-4 text-center">1</td>
            <td className="p-4 text-left font-bold" dir="ltr">
              {Number(invoiceData.packPrice).toLocaleString()} DA
            </td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-1/2 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-600 font-bold">المبلغ الإجمالي (Total):</span>
            <span className="font-bold text-lg" dir="ltr">{Number(invoiceData.packPrice).toLocaleString()} DA</span>
          </div>
          <div className="flex justify-between items-center mb-3 text-green-700">
            <span className="font-bold">المبلغ المدفوع (Versement):</span>
            <span className="font-bold text-lg" dir="ltr">{Number(invoiceData.amountPaid).toLocaleString()} DA</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-gray-300 text-red-600">
            <span className="font-bold">المبلغ المتبقي (Reste à payer):</span>
            <span className="font-black text-xl" dir="ltr">{Number(invoiceData.remainingAmount).toLocaleString()} DA</span>
          </div>
        </div>
      </div>

      {/* Footer / Notes */}
      <div className="mt-16 text-center text-sm text-gray-500 border-t border-gray-200 pt-8">
        <p>شكرًا لتعاملكم مع Fisora Production</p>
        <p className="mt-1">Merci pour votre confiance</p>
      </div>
    </div>
  );
}
