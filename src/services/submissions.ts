import { supabase } from '../lib/supabase'

export interface SubmissionData {
  station_id: string
  timestamp?: string
  gender?: string
  age?: string
  resident?: boolean
  consent_given: boolean
  consent_version: string
  consent_purpose: string
}

export interface AnswerData {
  submission_id: string
  question_number: number
  question_key: string
  type: 'audio' | 'text'
  storage_path?: string
  mime_type?: string
  size_bytes?: number
  duration_seconds?: number
  text_content?: string
}

// Função para criar uma nova submissão
export async function createSubmission(data: SubmissionData) {
  try {
    console.log('Creating submission with data:', data)

    const insertData = {
      station_id: data.station_id,
      timestamp: data.timestamp || new Date().toISOString(),
      gender: data.gender,
      age: data.age,
      resident: data.resident,
      consent_given: data.consent_given,
      consent_version: data.consent_version,
      consent_purpose: data.consent_purpose,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Insert data prepared:', insertData)

    const { data: submission, error } = await supabase
      .from('submissions')
      .insert([insertData])
      .select()
      .single()

    console.log('Supabase response:', { submission, error })

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }

    return submission
  } catch (error) {
    console.error('Exception in createSubmission:', error)
    throw error
  }
}

// Função para salvar uma resposta
export async function saveAnswer(data: AnswerData) {
  try {
    console.log('Saving answer with data:', data)

    const { data: answer, error } = await supabase
      .from('answers')
      .insert([{
        submission_id: data.submission_id,
        question_number: data.question_number,
        question_key: data.question_key,
        type: data.type,
        storage_path: data.storage_path,
        mime_type: data.mime_type,
        size_bytes: data.size_bytes,
        duration_seconds: data.duration_seconds,
        text_content: data.text_content,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    console.log('Answer save response:', { answer, error })

    if (error) {
      console.error('Error saving answer:', error)
      throw error
    }

    return answer
  } catch (error) {
    console.error('Failed to save answer:', error)
    throw error
  }
}

// Função de teste para verificar conexão
export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...')

    const { data, error } = await supabase
      .from('stations')
      .select('*')
      .limit(1)

    console.log('Connection test result:', { data, error })

    if (error) {
      console.error('Connection test failed:', error)
      return false
    }

    console.log('Supabase connection successful!')
    return true
  } catch (error) {
    console.error('Connection test exception:', error)
    return false
  }
}
