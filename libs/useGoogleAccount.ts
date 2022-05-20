import { onBeforeMount, useContext, useRouter } from '@nuxtjs/composition-api'
import qs from 'qs'

const useGoogleAccount = ({
  onResult
}: any) => {
  const { $axios, $auth }: any = useContext()
  const router = useRouter()
  const { hash } = $auth.ctx.route
  const query = hash.replace('#', '')
  const qsObject = qs.parse(query)
  const ID_TOKEN = qsObject.id_token

  onBeforeMount(async () => {
    try {
      const response = await $axios
        .get(`${process.env.GOOGLE_OAUTH_API}/tokeninfo`, {
          params: {
            id_token: ID_TOKEN
          }
        })
      onResult(response)
      // console.log(response , 555555)
    } catch (error) {
      console.error(error)
      router.replace('/')
    }
  })
}
export default useGoogleAccount
