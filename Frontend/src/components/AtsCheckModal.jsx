import { useState } from 'react'
import { LoaderCircleIcon, UploadCloud, XIcon } from 'lucide-react'
import { useSelector } from 'react-redux'
import * as pdfjsLib from 'pdfjs-dist'
import toast from 'react-hot-toast'
import api from '../configs/api'
import AtsResult from './AtsResult'

// Configure PDF.js worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

// Extract text from PDF
const extractTextFromPDF = async (file) => {
  const arrayBuffer = await file.arrayBuffer()

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer
  }).promise

  let text = ''

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()

    const pageText = content.items
      .map(item => item.str)
      .join(' ')

    text += pageText + '\n'
  }

  return text
}

const AtsCheckModal = ({ resumes, onClose }) => {
  const { token } = useSelector(state => state.auth)

  const [mode, setMode] = useState(resumes.length ? 'saved' : 'upload')
  const [resumeId, setResumeId] = useState(resumes[0]?._id || '')
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleCheck = async (e) => {
    e.preventDefault()

    const headers = {
      Authorization: token
    }

    const extras = {
      targetRole,
      jobDescription
    }

    // Validate saved resume
    if (mode === 'saved' && !resumeId) {
      return toast.error('Select a resume first')
    }

    // Validate uploaded file
    if (mode === 'upload' && !file) {
      return toast.error('Please select a PDF resume first')
    }

    // Check if uploaded file is PDF
    if (
      mode === 'upload' &&
      file &&
      file.type !== 'application/pdf'
    ) {
      return toast.error('Please upload a PDF file')
    }

    setIsLoading(true)

    try {
      let response

      // ============================
      // SAVED RESUME
      // ============================
      if (mode === 'saved') {
        response = await api.post(
          `/api/ats/check-saved/${resumeId}`,
          extras,
          { headers }
        )
      }

      // ============================
      // UPLOADED PDF
      // ============================
      else {
        toast.loading('Extracting text from PDF...', {
          id: 'pdf-extraction'
        })

        const resumeText = await extractTextFromPDF(file)

        toast.dismiss('pdf-extraction')

        if (!resumeText?.trim()) {
          throw new Error(
            'Could not extract text from this PDF. Please use a text-based PDF instead of a scanned image.'
          )
        }

        response = await api.post(
          '/api/ats/check-text',
          {
            resumeText,
            ...extras
          },
          { headers }
        )
      }

      setResult(response.data.result)
    } catch (error) {
      toast.dismiss('pdf-extraction')

      console.error('ATS Error:', error)

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong while checking the ATS score.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) {
      setFile(null)
      return
    }

    if (selectedFile.type !== 'application/pdf') {
      toast.error('Please select a PDF file')
      e.target.value = ''
      setFile(null)
      return
    }

    setFile(selectedFile)
  }

  const tabClass = (active) =>
    `flex-1 py-2 text-sm rounded-md transition-colors ${
      active
        ? 'bg-white shadow text-blue-700 font-medium'
        : 'text-slate-600'
    }`

  return (
    <div
      onClick={() => !isLoading && onClose()}
      className="fixed inset-0 bg-black/50 backdrop-blur z-10 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-slate-50 border shadow-md rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
      >
        {/* Header */}
        <h2 className="text-xl font-bold mb-4">
          ATS Score Checker
        </h2>

        <XIcon
          className={`absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors ${
            isLoading
              ? 'pointer-events-none opacity-50'
              : 'cursor-pointer'
          }`}
          onClick={onClose}
        />

        {/* ATS RESULT */}
        {result ? (
          <AtsResult
            result={result}
            onReset={() => {
              setResult(null)
              setFile(null)
            }}
          />
        ) : (
          <form
            onSubmit={handleCheck}
            className="space-y-4"
          >
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-200 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('saved')}
                className={tabClass(mode === 'saved')}
              >
                My resumes
              </button>

              <button
                type="button"
                onClick={() => setMode('upload')}
                className={tabClass(mode === 'upload')}
              >
                Upload from device
              </button>
            </div>

            {/* Saved Resume */}
            {mode === 'saved' ? (
              resumes.length ? (
                <select
                  value={resumeId}
                  onChange={(e) =>
                    setResumeId(e.target.value)
                  }
                  className="w-full px-4 py-2 bg-white border rounded-md"
                >
                  {resumes.map((r) => (
                    <option
                      key={r._id}
                      value={r._id}
                    >
                      {r.title}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">
                  You have no saved resumes yet.
                  Create one or upload a PDF.
                </p>
              )
            ) : (
              <>
                {/* Upload Area */}
                <label
                  htmlFor="ats-file"
                  className="flex flex-col items-center justify-center gap-2 border text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 hover:border-green-500 hover:text-blue-700 cursor-pointer transition-colors bg-white"
                >
                  {file ? (
                    <>
                      <UploadCloud className="size-10 text-blue-600" />

                      <p className="text-blue-700 font-medium">
                        {file.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        Click to change PDF
                      </p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="size-14 stroke-1" />

                      <p>
                        Select PDF resume
                      </p>

                      <p className="text-xs text-slate-400">
                        Only PDF files are supported
                      </p>
                    </>
                  )}
                </label>

                <input
                  type="file"
                  id="ats-file"
                  accept=".pdf,application/pdf"
                  hidden
                  onChange={handleFileChange}
                />
              </>
            )}

            {/* Target Role */}
            <input
              value={targetRole}
              onChange={(e) =>
                setTargetRole(e.target.value)
              }
              type="text"
              maxLength={100}
              placeholder="Target role (optional), e.g. Frontend Developer"
              className="w-full px-4 py-2 bg-white border rounded-md outline-none focus:border-blue-500"
            />

            {/* Job Description */}
            <textarea
              value={jobDescription}
              onChange={(e) =>
                setJobDescription(e.target.value)
              }
              rows={4}
              maxLength={5000}
              placeholder="Paste a job description (optional) for a more accurate keyword match"
              className="w-full px-4 py-2 text-sm bg-white border rounded-md outline-none focus:border-blue-500"
            />

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading && (
                <LoaderCircleIcon className="animate-spin size-4" />
              )}

              {isLoading
                ? 'Analyzing...'
                : 'Check ATS Score'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default AtsCheckModal