import { axiosInstance } from './instance.ts'

export const getComponents = () => {
  return axiosInstance
    .get('components')
    .then((resp) => {
      return resp.data
    })
    .catch((err) => {
      return {
        message: err,
      }
    })
}
