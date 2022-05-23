import { onBeforeMount, useContext, useRouter } from '@nuxtjs/composition-api'
import qs from 'qs'
const API_KEY = process.env.GOOGLE_API_KEY

const useGoogleAccount = ({
  onResult
}: any) => {
  const { $axios, $auth }: any = useContext()
  const router = useRouter()
  const { hash } = $auth.ctx.route
  const query = hash.replace('#', '')
  const qsObject = qs.parse(query)
  // const ID_TOKEN = qsObject.id_token
  const accessToken = qsObject.access_token

  onBeforeMount(async () => {
    try {
      const profileResponse = await $axios
      // const response = await $axios
      //   .get(`${process.env.GOOGLE_OAUTH_API}/tokeninfo`, {
      //     params: {
      //       id_token: ID_TOKEN
      //     }
      //   })
      // onResult(response)
      .get('https://people.googleapis.com/v1/people/me', {
          params: {
            personFields: 'names,photos,emailAddresses',
            key: API_KEY
          },
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        onResult(profileResponse.data)
    } catch (error) {
      console.error(error)
      router.replace('/')
    }
  })
}
export default useGoogleAccount
