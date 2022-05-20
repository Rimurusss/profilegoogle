<template>
  <v-layout align-center justify-center>
    <v-card class="pa-5">
      <v-layout align-center justify-center column>
        <v-layout align-center justify-center row>
          <v-divider width="100" />
          <v-subheader class="overline">
            TIME SHEET LOGIN
          </v-subheader>
          <v-divider width="100" />
        </v-layout>
        <v-btn class="mx-2 mb-2" @click="login">
          <v-icon class="mx-2" size="30">
            mdi-google
          </v-icon>
          signup with google
        </v-btn>
      </v-layout>
    </v-card>
  </v-layout>
</template>

<script>
import { defineComponent, useContext } from '@nuxtjs/composition-api'
export default defineComponent({
  name: 'IndexPage',
  setup () {
    const { $auth } = useContext()
    const login = () => {
      $auth.loginWith('google')
    }
    return { login }
  }
})
</script>
<style>
.theme--dark.v-icon{
  color: white !important;
}
</style>
