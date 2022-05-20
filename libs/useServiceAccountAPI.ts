import { onBeforeMount, ref, useContext, useRouter } from '@nuxtjs/composition-api'
// import getServiceAccountToken from './getServiceAccountToken'

const SHEET_ID = process.env.GOOGLE_SHEET_ID
const API_KEY = process.env.GOOGLE_API_KEY

const PROJECT_LIST_RANGE = `'${process.env.PROJECT_SHEET_NAME}'!A2:A`
const SHEET_PROJECT_URL = `${process.env.GOOGLE_SHEET_API}/spreadsheets/${SHEET_ID}/values/${PROJECT_LIST_RANGE}`

const APPEND_RANGE = `'${process.env.REPORT_SHEET_NAME}'!A:Z`
const APPEND_URL = `${process.env.GOOGLE_SHEET_API}/spreadsheets/${SHEET_ID}/values/${APPEND_RANGE}:append`

const useServiceAccountAPI = ({
  onProjectResult,
  onSubmitResult,
  onSubmitError
}: any) => {
  const { $axios } = useContext()
  const router = useRouter()
  const serviceAccountToken = ref<string>()

  onBeforeMount(async () => {
    try {
      // const assertion = await getServiceAccountToken()
      const response = await $axios
        .post('https://oauth2.googleapis.com/token', {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          // assertion
        })
      serviceAccountToken.value = response.data.access_token
      const projectResponse = await $axios
        .get(SHEET_PROJECT_URL, {
          params: {
            key: API_KEY,
            access_token: serviceAccountToken.value
          }
        })
      onProjectResult(projectResponse.data)
    } catch (error) {
      console.error(error)
      router.push('/')
    }
  })

  const submitReport = async (data: any) => {
    try {
      const res = await $axios
        .post(APPEND_URL, {
          range: APPEND_RANGE,
          values: data
        }, {
          headers: {
            Authorization: `Bearer ${serviceAccountToken.value}`,
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          params: {
            valueInputOption: 'USER_ENTERED'
          }
        })
      onSubmitResult(res)
    } catch (error) {
      onSubmitError(error)
    }
  }

  return {
    submitReport
  }
}

export default useServiceAccountAPI
