interface DocumentPreviewProps {
  state: any
  fields: { id: string; label: string; value: string }[]
  logo: string | null
  stamp: string | null
  signature: string | null
}

export default function DocumentPreview({ state, fields, logo, stamp, signature }: DocumentPreviewProps) {
  const customColor = state.text_color || '#000000'

  return (
    <div className="w-full h-full p-12 lg:p-16 flex flex-col bg-white font-serif" style={{ color: customColor }}>
      
      {/* HEADER */}
      <div className="flex items-center border-b-4 border-double border-gray-800 pb-6 mb-8" style={{ borderColor: customColor }}>
        {logo && (
           <img src={logo} alt="Company Logo" className="w-24 h-24 object-contain mr-6" />
        )}
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold tracking-tight uppercase" style={{ color: customColor }}>{state.header_company || 'COMPANY NAME'}</h1>
          <p className="text-[12px] mt-2 whitespace-pre-wrap leading-relaxed">{state.header_subtext || 'Company Subtext / Address will appear here.'}</p>
        </div>
        {/* Placeholder to balance the header if logo is present */}
        {logo && <div className="w-24 h-24 ml-6"></div>}
      </div>

      {/* TITLE & NOMOR */}
      <div className="text-center mb-8">
        <h2 className="text-xl font-bold underline underline-offset-4">{state.title || 'DOCUMENT TITLE'}</h2>
        <p className="text-sm mt-1">{state.nomor || 'No. XXX/YYY/ZZZ'}</p>
      </div>

      {/* BODY CONTENT */}
      <div className="flex-1">
        {state.body_content && (
          <p className="text-base leading-loose whitespace-pre-wrap mb-6 text-justify">
            {state.body_content}
          </p>
        )}

        {/* DYNAMIC FIELDS */}
        {fields.length > 0 && (
          <table className="w-full text-base mt-6 mb-8">
            <tbody>
              {fields.map(field => (
                <tr key={field.id} className="align-top">
                  <td className="py-1 w-1/3 pr-4 font-medium">{field.label}</td>
                  <td className="py-1 w-4 align-top">:</td>
                  <td className="py-1">{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* SIGNATURE & STAMP AREA (RIGHT ALIGNED) */}
      <div className="flex justify-end mt-12 mb-16 relative">
        <div className="text-center min-w-[250px] relative">
          <p className="mb-1">
            {state.ttd_lokasi || 'Lokasi'}, {state.ttd_tanggal || 'Tanggal'}
          </p>
          <p className="font-bold mb-20">{state.ttd_jabatan || 'Jabatan'}</p>
          
          {/* Overlay Logic */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full h-32 flex items-center justify-center">
            {/* Stamp (Behind, Opacity) */}
            {stamp && (
              <img 
                src={stamp} 
                alt="Stamp" 
                className="absolute w-32 h-32 object-contain opacity-50 z-0 mix-blend-multiply" 
              />
            )}
            
            {/* Signature (Front) */}
            {signature && (
              <img 
                src={signature} 
                alt="Signature" 
                className="absolute w-40 h-20 object-contain z-10" 
              />
            )}
          </div>

          <p className="font-bold underline underline-offset-4 relative z-20 mt-10">
            {state.ttd_nama || 'Nama Terang'}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      {state.footer_text && (
        <div className="border-t border-gray-300 pt-4 mt-auto text-center">
          <p className="text-xs whitespace-pre-wrap">{state.footer_text}</p>
        </div>
      )}

    </div>
  )
}
