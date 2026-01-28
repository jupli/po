'use client'

import { usePurchasing } from '@/context/PurchasingContext'
import { useState, useRef } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { generatePOsFromRequest } from '@/app/actions/generate-po'
import { archiveDocument } from '@/app/actions/archive'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function PurchaseSubmissionPage() {
  const { requests, rejectRequest, updateRequestSignature } = usePurchasing()
  const submissionRequests = requests.filter(req => req.status === 'submission')
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null)
  const [signingRole, setSigningRole] = useState<'manager' | 'purchasing' | null>(null)
  const sigCanvas = useRef<any>(null)

  const currentRequest = requests.find(r => r.id === selectedPdf)

  const handleReject = () => {
    if (selectedPdf && confirm('Apakah Anda yakin ingin menolak pengajuan ini? Data akan dikembalikan ke menu Pembelian Bahan.')) {
      rejectRequest(selectedPdf)
      setSelectedPdf(null)
    }
  }

  const handleSaveSignature = () => {
    if (sigCanvas.current && selectedPdf && signingRole) {
      const signatureData = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
      updateRequestSignature(selectedPdf, signingRole, signatureData)
      setSigningRole(null)
    }
  }

  const [isGenerating, setIsGenerating] = useState(false)

  const handleCreatePO = async () => {
    if (!currentRequest) return

    if (confirm('Apakah Anda yakin ingin membuat Purchase Order dari pengajuan ini?')) {
      try {
        setIsGenerating(true)

        // Archive PDF Logic
        let archivePath: string | undefined
        const input = document.getElementById('pdf-content')
        if (input) {
             const canvas = await html2canvas(input, { 
               scale: 1.5,
               backgroundColor: '#ffffff',
               useCORS: true,
               logging: false
             })
             const imgData = canvas.toDataURL('image/jpeg', 0.95)
             const pdf = new jsPDF('p', 'mm', 'a4')
             const pdfWidth = pdf.internal.pageSize.getWidth()
             const pdfHeight = (canvas.height * pdfWidth) / canvas.width
             
             pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
             const pdfBlob = pdf.output('blob')
             
             const formData = new FormData()
             formData.append('file', pdfBlob)
             // Use today's date as approval date
             const approvalDate = new Date().toISOString().split('T')[0]
             formData.append('date', approvalDate)
             formData.append('filename', `${currentRequest.requestNumber}.pdf`)
             
             try {
               const archiveResult = await archiveDocument(formData)
               if (archiveResult.success) {
                  archivePath = archiveResult.path
               }
             } catch (error) {
               console.error('Failed to archive document:', error)
               alert('Gagal mengarsipkan dokumen PDF, namun proses pembuatan PO akan dilanjutkan.')
             }
        }

        const result = await generatePOsFromRequest(currentRequest.requestNumber, currentRequest.items, archivePath)
        
        if (result.success) {
          alert(result.message)
          // Optionally move the request to 'completed' or 'approved' state if you have such logic
          // For now just close the modal
          setSelectedPdf(null)
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error('Error creating POs:', error)
        alert('Terjadi kesalahan saat membuat Purchase Order.')
      } finally {
        setIsGenerating(false)
      }
    }
  }

  return (
    <div className="p-6 print:p-0">
      <div className="print:hidden">
        <h1 className="text-3xl font-bold mb-8">Pengajuan Pembelian</h1>
        
        {submissionRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow text-gray-500">
            Belum ada pengajuan pembelian.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissionRequests.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{req.requestNumber}.pdf</h3>
                <p className="text-sm text-gray-500 mb-4">Tanggal: {req.date}</p>
                
                <div className="w-full border-t pt-4 mt-auto">
                   <div className="flex justify-between items-center text-sm mb-4">
                      <span className="text-gray-500">Total Item:</span>
                      <span className="font-medium">{req.items.length}</span>
                   </div>
                   <div className="flex justify-between items-center text-sm mb-6">
                      <span className="text-gray-500">Total Nilai:</span>
                      <span className="font-bold text-green-600">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                          req.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
                        )}
                      </span>
                   </div>
                   
                   <button 
                     onClick={() => setSelectedPdf(req.id)}
                     className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                     </svg>
                     <span>Lihat PDF</span>
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal/Preview for "PDF" */}
      {selectedPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:static print:p-0 print:bg-white print:block">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden flex flex-col print:h-auto print:overflow-visible print:shadow-none print:w-full print:max-w-none print:rounded-none">
            <div className="p-4 border-b flex justify-between items-center shrink-0 print:hidden">
               <h3 className="text-xl font-bold">
                 Preview: {requests.find(r => r.id === selectedPdf)?.requestNumber}.pdf
               </h3>
               <button onClick={() => setSelectedPdf(null)} className="text-gray-500 hover:text-gray-700">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50 print:p-0 print:bg-white print:overflow-visible print:h-auto">
               {/* Simulated PDF Content */}
               <div id="pdf-content" className="shadow-lg p-8 min-h-[800px] mx-auto max-w-[800px] print:shadow-none print:p-0 print:mx-0 print:min-h-0 print:max-w-none" style={{ backgroundColor: '#ffffff', color: '#111827' }}>
                 <div className="text-center mb-8 border-b pb-8" style={{ borderColor: '#e5e7eb' }}>
                   <h1 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>ORDER PEMBELIAN</h1>
                   <p style={{ color: '#6b7280' }}>No: {requests.find(r => r.id === selectedPdf)?.requestNumber}</p>
                   <p style={{ color: '#6b7280' }}>Tanggal: {requests.find(r => r.id === selectedPdf)?.date}</p>
                 </div>
                 
                 <table className="w-full mb-8" style={{ color: '#111827' }}>
                   <thead>
                     <tr className="border-b-2" style={{ borderColor: '#d1d5db' }}>
                       <th className="text-left py-3 font-bold">Item</th>
                       <th className="text-right py-3 font-bold">Qty</th>
                       <th className="text-right py-3 font-bold">Harga Satuan</th>
                       <th className="text-right py-3 font-bold">Total</th>
                     </tr>
                   </thead>
                   <tbody>
                     {requests.find(r => r.id === selectedPdf)?.items.map((item, idx) => (
                       <tr key={idx} className="border-b" style={{ borderColor: '#f3f4f6' }}>
                         <td className="py-3">
                           <div className="font-medium">{item.name}</div>
                           <div className="text-sm" style={{ color: '#6b7280' }}>{item.category}</div>
                         </td>
                         <td className="text-right py-3">{item.quantity} {item.unit}</td>
                         <td className="text-right py-3">
                           {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.price)}
                         </td>
                         <td className="text-right py-3 font-medium">
                           {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(item.quantity * item.price)}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                   <tfoot>
                     <tr>
                       <td colSpan={3} className="text-right py-4 font-bold text-xl">Grand Total</td>
                       <td className="text-right py-4 font-bold text-xl" style={{ color: '#2563eb' }}>
                         {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(
                           requests.find(r => r.id === selectedPdf)?.items.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0
                         )}
                       </td>
                     </tr>
                   </tfoot>
                 </table>
                 
                 <div className="mt-12 flex justify-between">
                   <div className="text-center w-48 relative">
                     <p className="mb-8">Dibuat Oleh,</p>
                     <div 
                       onClick={() => setSigningRole('purchasing')} 
                       className="h-24 flex items-center justify-center cursor-pointer border border-dashed mb-2 relative group print:border-none"
                       style={{ borderColor: '#d1d5db' }}
                     >
                        {currentRequest?.purchasingSignature ? (
                          <img src={currentRequest.purchasingSignature} alt="Signature" className="h-full w-auto object-contain" />
                        ) : (
                          <div className="text-xs print:hidden" style={{ color: '#9ca3af' }}>Klik untuk tanda tangan</div>
                        )}
                     </div>
                     <p className="font-bold border-t pt-2" style={{ borderColor: '#000000' }}>Purchasing</p>
                   </div>
                   <div className="text-center w-48 relative">
                     <p className="mb-8">Disetujui Oleh,</p>
                     <div 
                       onClick={() => setSigningRole('manager')} 
                       className="h-24 flex items-center justify-center cursor-pointer border border-dashed mb-2 relative group print:border-none"
                       style={{ borderColor: '#d1d5db' }}
                     >
                        {currentRequest?.managerSignature ? (
                          <img src={currentRequest.managerSignature} alt="Signature" className="h-full w-auto object-contain" />
                        ) : (
                          <div className="text-xs print:hidden" style={{ color: '#9ca3af' }}>Klik untuk tanda tangan</div>
                        )}
                     </div>
                     <p className="font-bold border-t pt-2" style={{ borderColor: '#000000' }}>Manager</p>
                   </div>
                </div>
               </div>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end space-x-4 print:hidden">
              <button 
                onClick={handleReject}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Tolak</span>
              </button>
              <button 
                onClick={() => window.print()} 
                className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Print PDF</span>
              </button>

              {currentRequest?.managerSignature && currentRequest?.purchasingSignature && (
                <button 
                  onClick={handleCreatePO}
                  disabled={isGenerating}
                  className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center space-x-2 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isGenerating ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <span>{isGenerating ? 'Memproses...' : 'Buat PO'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Signature Modal */}
      {signingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center print:hidden">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[500px]">
            <h3 className="text-lg font-bold mb-4">
              Tanda Tangan ({signingRole === 'manager' ? 'Manager' : 'Purchasing'})
            </h3>
            <div className="border border-gray-300 rounded mb-4">
              <SignatureCanvas 
                ref={sigCanvas}
                canvasProps={{
                  width: 450, 
                  height: 200, 
                  className: 'cursor-crosshair bg-gray-50'
                }} 
              />
            </div>
            <div className="flex justify-between">
               <button 
                 onClick={() => sigCanvas.current.clear()} 
                 className="px-4 py-2 text-red-600 hover:text-red-800 text-sm font-medium"
               >
                 Hapus / Ulangi
               </button>
               <div className="flex space-x-2">
                 <button 
                   onClick={() => setSigningRole(null)} 
                   className="px-4 py-2 text-gray-600 hover:text-gray-800"
                 >
                   Batal
                 </button>
                 <button 
                   onClick={handleSaveSignature} 
                   className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                 >
                   Simpan
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}