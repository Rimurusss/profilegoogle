<template>
  <h1>
    Email: {{ data.emailUser }}<br />
    profile: 
    <img :src="data.profileUrl">
  </h1>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from '@nuxtjs/composition-api'
// import FormContainer from '~/components/containers/FormContainer.vue'
import useGoogleAccount from '~/libs/useGoogleAccount'
import useServiceAccountAPI from '~/libs/useServiceAccountAPI'

export default defineComponent({

  components: {
    // FormContainer,
  },
  
  setup () {
    // const status = reactive({
    //   pageLoadingStatus: false,
    //   snackbarStatus: false,
    //   checkProjectNull: false
    // })

    const data = reactive({
      emailUser: '',
      profileUrl:''
    })

    // const project = ref<any[]>([])
    // const selectedProject = ref<any[]>([])
    // const checkBoxData = ref<any[]>([])

    // useGoogleAccount({
    //   onResult: (response: any) => {
    //     console.log('Profile API response: ', response.data)
    //     console.log('email API response: ', response.data.email)
    //     console.log('Profilee API response: ', response.data.profileUser)
    //     data.emailUser = response.data.email
    //   }
    // })
     useGoogleAccount({
      onResult: (result: any) => {
        // TODO Mile do this api
        console.log('Profile API data: ', result)
        data.emailUser = result.emailAddresses[0].value
        data.profileUrl = result.photos[0].url
      }
    })
    return {
      data,
    }
  },
  head: {
    title: 'IGG Daily Timesheet'
  }

})
</script>
