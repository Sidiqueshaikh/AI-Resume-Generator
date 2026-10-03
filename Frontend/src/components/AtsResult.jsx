const levelColor = (n) => (n >= 80 ? '#16a34a' : n >= 60 ? '#ea580c' : '#dc2626')

const priorityStyle = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-orange-100 text-orange-700',
  Low: 'bg-blue-100 text-blue-700',
}

const categoryLabels = {
  keywords: 'Keywords & Relevance',
  content_quality: 'Content & Impact',
  structure: 'Structure',
  formatting: 'Formatting',
  completeness: 'Completeness',
}

const AtsResult = ({ result, onReset }) => {
  const { score, detected_role, industry_compatibility, category_scores, strengths, weaknesses, missing_keywords, focus_areas } = result
  const color = levelColor(score)
  const radius = 52
  const circumference = 2 * Math.PI * radius

  return (
    <div className='space-y-6'>
      {/* Score gauge */}
      <div className='flex flex-col sm:flex-row items-center gap-6'>
        <div className='relative size-32 shrink-0'>
          <svg viewBox='0 0 120 120' className='size-32 -rotate-90'>
            <circle cx='60' cy='60' r={radius} fill='none' stroke='#e2e8f0' strokeWidth='10' />
            <circle cx='60' cy='60' r={radius} fill='none' stroke={color} strokeWidth='10' strokeLinecap='round'
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - score / 100)} />
          </svg>
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <span className='text-3xl font-bold' style={{ color }}>{score}</span>
            <span className='text-xs text-slate-500'>/ 100</span>
          </div>
        </div>
        <div className='text-center sm:text-left'>
          <p className='text-sm text-slate-500'>Industry compatibility{detected_role ? ` · ${detected_role}` : ''}</p>
          <p className='text-xl font-semibold text-slate-800'>{industry_compatibility.level}</p>
          <p className='text-sm text-slate-600 mt-1'>{industry_compatibility.summary}</p>
        </div>
      </div>

      {/* Category bars */}
      <div className='space-y-2'>
        {Object.entries(category_scores).map(([key, value]) => (
          <div key={key}>
            <div className='flex justify-between text-xs text-slate-600 mb-1'>
              <span>{categoryLabels[key] || key}</span><span>{value}</span>
            </div>
            <div className='h-2 bg-slate-200 rounded-full overflow-hidden'>
              <div className='h-full rounded-full transition-all duration-700' style={{ width: `${value}%`, backgroundColor: levelColor(value) }} />
            </div>
          </div>
        ))}
      </div>

      {/* Strengths / weaknesses */}
      <div className='grid sm:grid-cols-2 gap-4'>
        <div className='p-4 rounded-lg bg-green-50 border border-green-200'>
          <h4 className='font-semibold text-green-800 mb-2 text-sm'>Strengths</h4>
          <ul className='list-disc list-inside text-sm text-green-900 space-y-1'>
            {strengths.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
        <div className='p-4 rounded-lg bg-red-50 border border-red-200'>
          <h4 className='font-semibold text-red-800 mb-2 text-sm'>Weaknesses</h4>
          <ul className='list-disc list-inside text-sm text-red-900 space-y-1'>
            {weaknesses.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </div>
      </div>

      {/* Missing keywords */}
      {missing_keywords.length > 0 && (
        <div>
          <h4 className='font-semibold text-slate-800 mb-2 text-sm'>Missing keywords</h4>
          <div className='flex flex-wrap gap-2'>
            {missing_keywords.map((k, i) => (
              <span key={i} className='px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700'>{k}</span>
            ))}
          </div>
        </div>
      )}

      {/* Focus areas */}
      <div>
        <h4 className='font-semibold text-slate-800 mb-2 text-sm'>What to focus on</h4>
        <div className='space-y-2'>
          {focus_areas.map((f, i) => (
            <div key={i} className='p-3 border border-slate-200 rounded-lg bg-white'>
              <div className='flex items-center gap-2 mb-1'>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${priorityStyle[f.priority]}`}>{f.priority}</span>
                <p className='text-sm font-medium text-slate-800'>{f.title}</p>
              </div>
              <p className='text-sm text-slate-600'>{f.action}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onReset} className='w-full py-2 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-100 transition-colors'>
        Check another resume
      </button>
    </div>
  )
}

export default AtsResult