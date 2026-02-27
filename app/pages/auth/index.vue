<script setup lang="ts">
// import { Field, useForm } from 'vee-validate'
import * as z from 'zod'

definePageMeta({
  layout: 'empty',
  title: 'Login',
  preview: {
    title: 'Login 1',
    description: 'For authentication and sign in',
    categories: ['layouts', 'authentication'],
    src: '/img/screens/auth-login-1.png',
    srcDark: '/img/screens/auth-login-1-dark.png',
    order: 151,
  },
})

// const VALIDATION_TEXT = {
//   EMAIL_REQUIRED: 'A valid email is required',
//   PASSWORD_REQUIRED: 'A password is required',
// }

// This is the Zod schema for the form input
// It's used to define the shape that the form data will have
// const validationSchema = z.object({
//   email: z.string().email(VALIDATION_TEXT.EMAIL_REQUIRED),
//   password: z.string().min(1, VALIDATION_TEXT.PASSWORD_REQUIRED),
//   trustDevice: z.boolean(),
// })

// Zod has a great infer method that will
// infer the shape of the schema into a TypeScript type
// type FormInput = z.infer<typeof validationSchema>

// const initialValues: FormInput = {
//   email: '',
//   password: '',
//   trustDevice: false,
// }

// const {
//   handleSubmit,
//   isSubmitting,
//   setFieldError,
// } = useForm({
//   validationSchema,
//   initialValues,
// })

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const handleGoogleLogin = () => {
  // Pass the redirect query parameter to preserve the intended destination
  const redirectUrl = route.query.redirect as string | undefined
  login(redirectUrl)
}

// This is where you would send the form data to the server
// const onSubmit = handleSubmit(async (values) => {
//   // here you have access to the validated form values
//   // console.log('auth-success', values)
//
//   try {
//     // fake delay, this will make isSubmitting value to be true
//     await new Promise((resolve, reject) => {
//       if (values.password !== 'password') {
//         // simulate a backend error
//         setTimeout(
//           () => reject(new Error('Fake backend validation error')),
//           2000,
//         )
//       }
//       setTimeout(resolve, 4000)
//     })
//   }
//   catch (error: any) {
//     // this will set the error on the form
//     if (error.message === 'Fake backend validation error') {
//       setFieldError('password', 'Invalid credentials (use "password")')
//     }
//     return
//   }
//
//   router.push('/')
// })
</script>

<template>
  <div class="dark:bg-muted-800 flex min-h-screen bg-white">
    <div
      class="relative flex flex-1 flex-col justify-center px-6 py-12 lg:w-2/5 lg:flex-none"
    >
      <div class="dark:bg-muted-800 relative mx-auto w-full max-w-sm bg-white">
        <div>
          <!-- Social Sign Up Buttons -->
          <div class="flex flex-wrap justify-between gap-4">
            <!-- Google button -->
            <button
              id="login"
              class="cursor-pointer dark:bg-muted-700 text-muted-800 border-muted-300 dark:border-muted-600 focus-visible:nui-focus relative inline-flex grow items-center justify-center gap-2 rounded-md border bg-white px-6 py-4 dark:text-white"
              @click="handleGoogleLogin"
            >
              <Icon
                name="logos:google-icon"
                class="size-5"
              />
              <div>Login with Google</div>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="bg-muted-100 dark:bg-muted-900 relative hidden w-0 flex-1 items-center justify-center lg:flex lg:w-3/5"
    >
      <div class="mx-auto w-full max-w-4xl">
        <!-- Media image -->
        <img
          class="mx-auto max-w-md"
          src="/img/logos/brands/openshift-logo.svg"
          alt=""
          width="800"
          height="800"
        >
      </div>
    </div>
  </div>
</template>
