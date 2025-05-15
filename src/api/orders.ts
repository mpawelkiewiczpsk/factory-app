import { axiosInstance } from './instance.ts'

export const orderProducts = (data) => {
  return axiosInstance
    .get(`payment/create-payment?${data}`)
    .then((resp) => {
      return resp.data
    })
    .catch((err) => {
      return {
        message: err,
      }
    })
}
