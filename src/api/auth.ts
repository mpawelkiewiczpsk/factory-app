import { axiosInstance } from './instance.ts'
import type { LoginData } from '../types.ts'

export const login = (data: LoginData) => {
  return axiosInstance
    .post('login', data)
    .then((resp) => {
      return resp.data
    })
    .catch((err) => {
      return {
        message: err,
      }
    })
}
