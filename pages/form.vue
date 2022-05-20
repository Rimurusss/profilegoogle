<template>
  <h1>
    Email: {{ data.emailUser }}<br />
    profile: {{ data.profileUser }}
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
      profileUser:''
    })

    // const project = ref<any[]>([])
    // const selectedProject = ref<any[]>([])
    // const checkBoxData = ref<any[]>([])

    useGoogleAccount({
      onResult: (response: any) => {
        console.log('Profile API response: ', response.data.profile)
        data.emailUser = response.data.email
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
